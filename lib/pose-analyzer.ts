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
  forwardHeadAngle: number;     // 0-100 (nose Z + head Y combined, higher = worse FHP)
  headProtrusion: number;       // 0-100 (nose Y ratio, higher = worse protrusion)
  shoulderShrug: number;        // 0-100 (shoulder elevation asymmetry)
  bodyTilt: number;             // 0-100 (coronal head tilt, higher = worse)
  overallScore: number;         // 0-100, higher = better posture
  severity: "good" | "mild" | "moderate" | "severe";
  timestamp: number;
  details: {
    noseZDiff: number;           // raw nose Z depth forward of shoulders
    noseZNorm: number;           // nose Z diff / shoulderSpan (distance-invariant)
    headYRatio: number;          // nose-to-shoulder Y ratio / shoulderSpan
    earYNorm: number;            // ear-to-shoulder Y ratio (alternative vertical metric)
    coronalHeadTilt: number;     // head lateral tilt in degrees (0° = level)
    shoulderYDiff: number;       // left-right shoulder Y difference
    shoulderSpan: number;        // shoulder width in normalized coords (distance proxy)
  };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
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

  if (
    (nose.visibility !== undefined && nose.visibility < 0.5) ||
    (leftShoulder.visibility !== undefined && leftShoulder.visibility < 0.5) ||
    (rightShoulder.visibility !== undefined && rightShoulder.visibility < 0.5)
  ) {
    return null;
  }

  const avgShoulderZ = (leftShoulder.z + rightShoulder.z) / 2;
  const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const shoulderSpan = Math.abs(leftShoulder.x - rightShoulder.x);

  // Average ear position (use whichever ears are visible)
  const earVisibleL = (leftEar.visibility ?? 1) >= 0.5;
  const earVisibleR = (rightEar.visibility ?? 1) >= 0.5;
  const avgEarY = earVisibleL && earVisibleR
    ? (leftEar.y + rightEar.y) / 2
    : earVisibleL ? leftEar.y : rightEar.y;
  const avgEarZ = earVisibleL && earVisibleR
    ? (leftEar.z + rightEar.z) / 2
    : earVisibleL ? leftEar.z : rightEar.z;

  // ── 1. Forward Head Posture — nose Z-depth (strong signal) normalized ──
  // Nose Z protrudes more than ear Z → much better signal-to-noise ratio.
  // Normalize by shoulderSpan for distance invariance.
  //   MediaPipe Z: negative = toward camera (anterior)
  //   noseZDiff > 0 when nose is anterior to shoulders
  const noseZDiff = avgShoulderZ - nose.z;
  const noseZNorm = shoulderSpan > 0.01 ? noseZDiff / shoulderSpan : 0;

  // ── 2. Head Protrusion — nose Y relative to shoulder Y ──
  const headYDist = avgShoulderY - nose.y;
  const headYRatio = shoulderSpan > 0.01 ? headYDist / shoulderSpan : 1.0;

  // ── 3. Ear Y ratio — secondary vertical metric ──
  const earYDist = avgShoulderY - avgEarY;
  const earYNorm = shoulderSpan > 0.01 ? earYDist / shoulderSpan : 0;

  // ── 4. Shoulder Elevation Asymmetry ──
  const shoulderYDiff = Math.abs(leftShoulder.y - rightShoulder.y);

  // ── 5. Coronal Head Tilt — fixed: use leftEye as reference for dx ──
  // leftEye.x > rightEye.x when facing camera (person's left is on image right)
  const tiltDy = leftEye.y - rightEye.y;
  const tiltDx = leftEye.x - rightEye.x;
  const coronalHeadTilt = Math.abs(tiltDx) > 0.001
    ? Math.atan2(tiltDy, tiltDx) * (180 / Math.PI)
    : 0;
  // Now: 0° = level eyes facing camera, positive = left eye lower, negative = right eye lower

  // ── Score conversion ──

  // noseZNorm: user's data needs to calibrate this.
  // At ~50cm: expected ~2.5 (retracted) to ~4.5 (forward).
  // Map: noseZNorm < 2.5 → 0%, noseZNorm > 4.5 → 100%
  const fhpZNScore = clamp(Math.round(((noseZNorm - 2.5) / 2.0) * 100), 0, 100);

  // headYRatio: smaller = worse protrusion
  // 0.85+ → 0%, 0.45- → 100%
  const headProtrusion = clamp(Math.round(((0.85 - headYRatio) / 0.40) * 100), 0, 100);

  // Shoulder shrug: Y diff
  const shoulderShrug = clamp(Math.round((shoulderYDiff / 0.1) * 100), 0, 100);

  // Coronal tilt: |angle| < 2° → 0%, > 10° → 100%
  const bodyTilt = clamp(Math.round((Math.abs(coronalHeadTilt) - 2) / 8 * 100), 0, 100);

  // ── Combined forward head score: 60% Z-depth + 40% Y-protrusion ──
  const forwardHeadAngle = clamp(Math.round(fhpZNScore * 0.60 + headProtrusion * 0.40), 0, 100);

  // ── Overall Score ──
  const overallScore = clamp(
    Math.round(
      100 -
        (forwardHeadAngle * 0.40 +
          headProtrusion * 0.20 +
          shoulderShrug * 0.15 +
          bodyTilt * 0.25),
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
    details: {
      noseZDiff,
      noseZNorm,
      headYRatio,
      earYNorm,
      coronalHeadTilt,
      shoulderYDiff,
      shoulderSpan,
    },
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
