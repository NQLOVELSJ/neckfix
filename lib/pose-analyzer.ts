// Pose landmarks indices from MediaPipe Pose
export const NOSE = 0;
export const LEFT_EYE_INNER = 1;
export const LEFT_EYE = 2;
export const LEFT_EYE_OUTER = 3;
export const RIGHT_EYE_INNER = 4;
export const RIGHT_EYE = 5;
export const RIGHT_EYE_OUTER = 6;
export const LEFT_EAR = 7;
export const RIGHT_EAR = 8;
export const MOUTH_LEFT = 9;
export const MOUTH_RIGHT = 10;
export const LEFT_SHOULDER = 11;
export const RIGHT_SHOULDER = 12;
export const LEFT_ELBOW = 13;
export const RIGHT_ELBOW = 14;
export const LEFT_WRIST = 15;
export const RIGHT_WRIST = 16;
export const LEFT_PINKY = 17;
export const RIGHT_PINKY = 18;
export const LEFT_INDEX = 19;
export const RIGHT_INDEX = 20;
export const LEFT_THUMB = 21;
export const RIGHT_THUMB = 22;
export const LEFT_HIP = 23;
export const RIGHT_HIP = 24;

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseAnalysis {
  forwardHeadAngle: number;     // CVA-based 0-100 score (higher = worse FHP)
  headProtrusion: number;       // head Y-ratio 0-100 score (higher = worse protrusion)
  shoulderShrug: number;        // shoulder elevation asymmetry 0-100
  bodyTilt: number;             // coronal head tilt 0-100 (higher = worse tilt)
  overallScore: number;         // 0-100, higher = better posture
  severity: "good" | "mild" | "moderate" | "severe";
  timestamp: number;
  details: {
    cvaAngle: number;           // craniovertebral angle in degrees (clinical gold standard)
    headYRatio: number;         // nose-to-shoulder Y ratio normalized by shoulder span
    coronalHeadTilt: number;    // inter-eye line tilt angle in degrees
    earShoulderZDiff: number;   // ear Z depth forward of shoulders (rounded shoulder indicator)
    shoulderYDiff: number;      // left-right shoulder Y difference
  };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Compute Craniovertebral Angle (CVA) — the clinical gold standard for FHP assessment.
 *
 * Reference: Zárate-Tejero et al. (2024), Applied Sciences 14(19):8639
 *   - Mean CVA in healthy adults: 48.76° ± 6.77°
 *   - CVA measured as angle between horizontal through C7 and line from C7 to tragus
 *   - Landmarks: tragus (ear) → C7 spinous process (approximated by shoulder midpoint)
 *
 * MediaPipe coordinate system:
 *   Y: 0 at image top, increases downward
 *   Z: negative = toward camera (anterior), positive = away (posterior)
 *
 * In the sagittal (YZ) plane:
 *   dy = avgShoulderY - avgEarY     ear above shoulder → positive
 *   dz = avgShoulderZ - avgEarZ     ear anterior to shoulder (FHP) → positive
 *   CVA = atan2(dy, dz) * 180 / PI  angle from horizontal forward to tragus line
 *
 * Clinical interpretation (Singla et al. 2017, J Chiropr Med):
 *   CVA > 50°  → normal
 *   45-50°     → mild FHP
 *   35-45°     → moderate FHP
 *   CVA < 35°  → severe FHP
 */
function computeCVA(
  earY: number, earZ: number,
  avgShoulderY: number, avgShoulderZ: number,
): number {
  const dy = avgShoulderY - earY;
  const dz = avgShoulderZ - earZ;
  if (Math.abs(dz) < 0.001) return 90; // ear directly above shoulder
  return Math.atan2(dy, dz) * (180 / Math.PI);
}

/**
 * Coronal head tilt — lateral inclination measured via inter-eye line vs horizontal.
 *
 * Reference: Karbalaeimahdi et al. (2025), Scientific Reports
 *   Systematic review + meta-analysis of smartphone photogrammetry:
 *   inter-rater reliability ICC = 0.962, test-retest ICC = 0.898
 */
function computeCoronalHeadTilt(
  leftEye: Landmark, rightEye: Landmark,
): number {
  const dy = rightEye.y - leftEye.y;
  const dx = rightEye.x - leftEye.x;
  if (Math.abs(dx) < 0.001) return 0;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

export function analyzePose(landmarks: Landmark[]): PoseAnalysis | null {
  if (!landmarks || landmarks.length < 25) return null;

  const nose = landmarks[NOSE];
  const leftEye = landmarks[LEFT_EYE];
  const rightEye = landmarks[RIGHT_EYE];
  const leftEar = landmarks[LEFT_EAR];
  const rightEar = landmarks[RIGHT_EAR];
  const leftShoulder = landmarks[LEFT_SHOULDER];
  const rightShoulder = landmarks[RIGHT_SHOULDER];

  // Require shoulders (critical) + at least one ear (for CVA) + nose (for protrusion)
  const earVisible =
    (leftEar.visibility ?? 1) >= 0.5 || (rightEar.visibility ?? 1) >= 0.5;
  if (
    (nose.visibility !== undefined && nose.visibility < 0.5) ||
    (leftShoulder.visibility !== undefined && leftShoulder.visibility < 0.5) ||
    (rightShoulder.visibility !== undefined && rightShoulder.visibility < 0.5) ||
    !earVisible
  ) {
    return null;
  }

  const avgShoulderZ = (leftShoulder.z + rightShoulder.z) / 2;
  const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const shoulderSpan = Math.abs(leftShoulder.x - rightShoulder.x);

  // Pick best ear by visibility
  const useLeftEar = (leftEar.visibility ?? 1) >= (rightEar.visibility ?? 0);
  const ear = useLeftEar ? leftEar : rightEar;
  const avgEarY = (leftEar.visibility ?? 1) >= 0.5 && (rightEar.visibility ?? 1) >= 0.5
    ? (leftEar.y + rightEar.y) / 2
    : ear.y;
  const avgEarZ = (leftEar.visibility ?? 1) >= 0.5 && (rightEar.visibility ?? 1) >= 0.5
    ? (leftEar.z + rightEar.z) / 2
    : ear.z;

  // ── 1. CVA (Craniovertebral Angle) — gold standard for FHP ──
  // Replaces the old nose-Z-based forwardHeadAngle with the clinically-validated metric.
  // CVA > 55° → score 0 (excellent), CVA < 35° → score 100 (severe)
  // Linear mapping across the clinically-relevant 20° band.
  const cvaAngle = computeCVA(avgEarY, avgEarZ, avgShoulderY, avgShoulderZ);
  const forwardHeadAngle = clamp(Math.round(((55 - cvaAngle) / 20) * 100), 0, 100);

  // ── 2. Head Protrusion — nose Y relative to shoulder Y, normalized by span ──
  const headYDist = avgShoulderY - nose.y;
  const headYRatio = shoulderSpan > 0.01 ? headYDist / shoulderSpan : 1.0;
  const headProtrusion = clamp(Math.round(((0.8 - headYRatio) / 0.6) * 100), 0, 100);

  // ── 3. Shoulder Elevation Asymmetry ──
  const shoulderYDiff = Math.abs(leftShoulder.y - rightShoulder.y);
  const shoulderShrug = clamp(Math.round((shoulderYDiff / 0.1) * 100), 0, 100);

  // ── 4. Coronal Head Tilt — lateral head inclination ──
  // Reference: Karbalaeimahdi et al. (2025), ICC = 0.962
  // |tilt| < 2° → score 0, |tilt| > 10° → score 100
  const coronalHeadTilt = computeCoronalHeadTilt(leftEye, rightEye);
  const bodyTilt = clamp(Math.round((Math.abs(coronalHeadTilt) - 2) / 8 * 100), 0, 100);

  // ── 5. Ear-Shoulder Z Depth (rounded shoulder / shoulder protraction) ──
  // Included in details for diagnostic reference, factored into overall score
  // via forwardHeadAngle since both measure anterior head/shoulder displacement.
  const earShoulderZDiff = avgShoulderZ - avgEarZ;

  // ── Overall Score ──
  // CVA-based FHP carries highest weight (40%) as the clinical gold standard.
  // Head protrusion (25%), shoulder asymmetry (15%), coronal head tilt (20%).
  const overallScore = clamp(
    Math.round(
      100 -
        (forwardHeadAngle * 0.40 +
          headProtrusion * 0.25 +
          shoulderShrug * 0.15 +
          bodyTilt * 0.20),
    ),
    0,
    100,
  );

  let severity: PoseAnalysis["severity"];
  if (overallScore >= 75) severity = "good";
  else if (overallScore >= 55) severity = "mild";
  else if (overallScore >= 35) severity = "moderate";
  else severity = "severe";

  return {
    forwardHeadAngle,
    headProtrusion,
    shoulderShrug,
    bodyTilt,
    overallScore,
    severity,
    timestamp: Date.now(),
    details: { cvaAngle, headYRatio, coronalHeadTilt, earShoulderZDiff, shoulderYDiff },
  };
}

export function getSeverityLabel(severity: PoseAnalysis["severity"]): string {
  switch (severity) {
    case "good": return "良好";
    case "mild": return "轻度";
    case "moderate": return "中度";
    case "severe": return "重度";
  }
}

export function getSeverityColor(severity: PoseAnalysis["severity"]): string {
  switch (severity) {
    case "good": return "#10b981";
    case "mild": return "#f59e0b";
    case "moderate": return "#f97316";
    case "severe": return "#ef4444";
  }
}
