"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { PoseAnalysis, Landmark } from "@/lib/pose-analyzer";
import { analyzePose } from "@/lib/pose-analyzer";

interface Props {
  running: boolean;
  onResults: (analysis: PoseAnalysis | null) => void;
  onLandmarks: (landmarks: Landmark[] | null) => void;
  onReady: () => void;
  onError: (error: string) => void;
}

export default function PoseDetector({
  running,
  onResults,
  onLandmarks,
  onReady,
  onError,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseLandmarkerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const lastVideoTime = useRef(-1);
  const [modelLoaded, setModelLoaded] = useState(false);

  // Use refs for callbacks to avoid re-running effects when parent re-renders
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const onResultsRef = useRef(onResults);
  onResultsRef.current = onResults;
  const onLandmarksRef = useRef(onLandmarks);
  onLandmarksRef.current = onLandmarks;

  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (poseLandmarkerRef.current) {
      poseLandmarkerRef.current.close();
      poseLandmarkerRef.current = null;
    }
    setModelLoaded(false);
  }, []);

  // Initialize MediaPipe and start camera
  useEffect(() => {
    if (!running) {
      stopCamera();
      return;
    }

    let active = true;

    async function init() {
      try {
        const { PoseLandmarker, FilesetResolver } = await import(
          "@mediapipe/tasks-vision"
        );

        const vision = await FilesetResolver.forVisionTasks(
          "/wasm"
        );

        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/models/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (!active) {
          poseLandmarker.close();
          return;
        }

        poseLandmarkerRef.current = poseLandmarker;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          poseLandmarker.close();
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setModelLoaded(true);
        onReadyRef.current();
      } catch (err: any) {
        if (active) {
          onErrorRef.current(err.message || "无法访问摄像头或加载模型");
        }
      }
    }

    init();

    return () => {
      active = false;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // Detection loop
  useEffect(() => {
    if (!modelLoaded || !running) return;

    let lastDetectTime = 0;
    const FRAME_INTERVAL = 33; // ~30 FPS

    function drawLandmarksOnCanvas(
      landmarks: Landmark[],
      canvas: HTMLCanvasElement,
      video: HTMLVideoElement
    ) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const POSE_CONNECTIONS: [number, number][] = [
        [0, 1], [1, 2], [2, 3], [3, 7],
        [0, 4], [4, 5], [5, 6], [6, 8],
        [9, 10],
        [11, 12],
        [11, 13], [13, 15],
        [12, 14], [14, 16],
        [11, 23], [12, 24],
        [23, 24],
      ];

      // Draw connections
      ctx.strokeStyle = "#14b8a6";
      ctx.lineWidth = 2;
      for (const [i, j] of POSE_CONNECTIONS) {
        const a = landmarks[i];
        const b = landmarks[j];
        if (a && b) {
          ctx.beginPath();
          ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
          ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
          ctx.stroke();
        }
      }

      // Draw landmarks
      for (const lm of landmarks) {
        const x = lm.x * canvas.width;
        const y = lm.y * canvas.height;
        const r = 3 + (1 - (lm.z || 0)) * 4;

        ctx.beginPath();
        ctx.arc(x, y, Math.max(2, r), 0, 2 * Math.PI);
        ctx.fillStyle = "#0d9488";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Highlight key points
      const highlights = [0, 11, 12]; // nose, left shoulder, right shoulder
      for (const idx of highlights) {
        const lm = landmarks[idx];
        if (!lm) continue;
        const x = lm.x * canvas.width;
        const y = lm.y * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(245, 158, 11, 0.3)";
        ctx.fill();
      }
    }

    function detect() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const poseLandmarker = poseLandmarkerRef.current;

      if (!video || !canvas || !poseLandmarker) {
        rafRef.current = requestAnimationFrame(detect);
        return;
      }

      const now = performance.now();

      if (now - lastDetectTime >= FRAME_INTERVAL) {
        lastDetectTime = now;

        if (
          video.readyState >= 2 &&
          video.videoWidth > 0 &&
          video.videoHeight > 0 &&
          video.currentTime !== lastVideoTime.current
        ) {
          lastVideoTime.current = video.currentTime;

          try {
            const result = poseLandmarker.detectForVideo(video, now);

            if (result.landmarks && result.landmarks.length > 0) {
              const landmarks = result.landmarks[0] as Landmark[];
              onLandmarksRef.current(landmarks);
              drawLandmarksOnCanvas(landmarks, canvas, video);

              const analysis = analyzePose(landmarks);
              onResultsRef.current(analysis);
            } else {
              onLandmarksRef.current(null);
              onResultsRef.current(null);
              canvas.width = video.videoWidth || 640;
              canvas.height = video.videoHeight || 480;
              const ctx = canvas.getContext("2d");
              if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
          } catch {
            // Frame might fail; skip
          }
        }
      }

      rafRef.current = requestAnimationFrame(detect);
    }

    rafRef.current = requestAnimationFrame(detect);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelLoaded, running]);

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-[4/3] bg-black rounded-2xl overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {!modelLoaded && running && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm">
          <div className="flex items-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31.4 31.4" />
            </svg>
            正在加载姿态检测模型...
          </div>
        </div>
      )}
    </div>
  );
}
