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
  forwardHeadAngle: number;     // 0-100 score, higher = worse
  headProtrusion: number;       // 0-100 score
  shoulderShrug: number;        // 0-100 score
  bodyTilt: number;             // 0-100 score
  overallScore: number;         // 0-100, higher = better
  severity: "good" | "mild" | "moderate" | "severe";
  timestamp: number;
  details: {
    neckZDiff: number;
    headYRatio: number;
    shoulderYDiff: number;
    shoulderTilt: number;
  };
}

const THRESHOLDS = {
  neckZDiff: 0.08,      // nose Z ahead of shoulders Z
  headYRatio: 0.6,      // nose-to-shoulder Y ratio (smaller = more forward)
  shoulderShrug: 0.03,  // Y difference between shoulders
  bodyTilt: 0.05,       // Y difference for body tilt
};

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function analyzePose(landmarks: Landmark[]): PoseAnalysis | null {
  if (!landmarks || landmarks.length < 25) return null;

  const nose = landmarks[NOSE];
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

  // 1. Forward Head Posture: how much nose is in front of shoulders
  // MediaPipe Z: more negative = closer to camera. Nose in front of shoulders → nose.z < shoulder.z
  const neckZDiff = avgShoulderZ - nose.z;

  // 2. Head Protrusion: nose Y relative to shoulder Y, normalized by span
  const headYDist = avgShoulderY - nose.y;
  const headYRatio = shoulderSpan > 0.01 ? headYDist / shoulderSpan : 1.0;

  // 3. Shoulder Shrug: single side elevation vs expected
  const shoulderYDiff = Math.abs(leftShoulder.y - rightShoulder.y);

  // 4. Body Tilt: same metric but with different threshold
  const shoulderTilt = shoulderYDiff;

  // Convert to 0-100 scores (higher = worse)
  // Z from single camera is noisy; use a wider threshold to avoid saturating at 100%
  const forwardHeadAngle = clamp(Math.round((neckZDiff / 0.45) * 100), 0, 100);
  const headProtrusion = clamp(Math.round(((0.8 - headYRatio) / 0.6) * 100), 0, 100);
  const shoulderShrug = clamp(Math.round((shoulderYDiff / 0.1) * 100), 0, 100);
  const bodyTilt = clamp(Math.round((shoulderTilt / 0.12) * 100), 0, 100);

  const overallScore = clamp(
    Math.round(100 - (forwardHeadAngle * 0.35 + headProtrusion * 0.35 + shoulderShrug * 0.15 + bodyTilt * 0.15)),
    0,
    100
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
    details: { neckZDiff, headYRatio, shoulderYDiff, shoulderTilt },
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
