"use client";

interface Props {
  exerciseId: string;
  phase: "inhale" | "hold" | "exhale" | "idle";
  side?: "left" | "right";
}

interface Coords {
  headCX: number; headCY: number; headRX: number; headRY: number;
  neckTopX: number; neckTopY: number; neckBaseY: number;
  leftShoulderX: number; rightShoulderX: number;
  leftElbowX: number; rightElbowX: number;
  leftHandX: number; rightHandX: number;
}

function computeCoords(exerciseId: string, active: boolean, side?: "left" | "right"): Coords {
  const baseId = exerciseId.replace(/-l[123]$/, "");
  const rest: Coords = {
    headCX: 100, headCY: 52, headRX: 16, headRY: 20,
    neckTopX: 100, neckTopY: 72, neckBaseY: 92,
    leftShoulderX: 58, rightShoulderX: 142,
    leftElbowX: 38, rightElbowX: 162,
    leftHandX: 42, rightHandX: 158,
  };

  if (!active) return rest;

  switch (baseId) {
    case "chin-tuck":
      return {
        ...rest,
        headCY: 44,
        headRY: 17,
        neckTopY: 64,
      };
    case "neck-flexion":
      return {
        ...rest,
        headCY: 60,
        headRY: 17,
        neckTopY: 78,
      };
    case "lateral-flexion": {
      const isRight = side === "right";
      return {
        ...rest,
        headCX: isRight ? 110 : 90,
        headCY: 56,
        headRY: 18,
        neckTopX: isRight ? 107 : 93,
        neckTopY: 74,
      };
    }
    case "scapular-retraction":
      return {
        ...rest,
        leftShoulderX: 72,
        rightShoulderX: 128,
        leftElbowX: 52,
        rightElbowX: 148,
        leftHandX: 56,
        rightHandX: 144,
        neckBaseY: 90,
      };
    default:
      return rest;
  }
}

export default function ExerciseDemo({ exerciseId, phase, side }: Props) {
  const active = phase === "hold" || phase === "exhale";
  const baseId = exerciseId.replace(/-l[123]$/, "");
  const isChinTuck = baseId === "chin-tuck";
  const isNeckFlexion = baseId === "neck-flexion";
  const isLateral = baseId === "lateral-flexion";
  const isScapular = baseId === "scapular-retraction";

  const c = computeCoords(exerciseId, active, side);
  const t = "transition-all duration-700 ease-in-out";

  const arrowClass = `transition-opacity duration-500 ${active ? "opacity-100" : "opacity-25"}`;

  return (
    <div className="select-none">
      <svg viewBox="0 0 200 230" className="w-full max-w-[200px] h-auto mx-auto block">

        {/* ── Movement arrows ── */}
        {isChinTuck && (
          <g className={arrowClass}>
            <text x="64" y="48" fontSize="14" fill="#0d9488" fontWeight="bold">↑</text>
            <text x="64" y="58" fontSize="9" fill="#0d9488">后缩</text>
          </g>
        )}
        {isNeckFlexion && (
          <g className={arrowClass}>
            <text x="62" y="62" fontSize="14" fill="#0d9488" fontWeight="bold">↓</text>
            <text x="60" y="72" fontSize="9" fill="#0d9488">前屈</text>
          </g>
        )}
        {isLateral && (
          <g className={arrowClass}>
            {side === "right" ? (
              <>
                <text x="108" y="46" fontSize="14" fill="#0d9488" fontWeight="bold">↗</text>
                <text x="112" y="54" fontSize="9" fill="#0d9488">右侧屈</text>
              </>
            ) : (
              <>
                <text x="78" y="46" fontSize="14" fill="#0d9488" fontWeight="bold">↖</text>
                <text x="68" y="54" fontSize="9" fill="#0d9488">左侧屈</text>
              </>
            )}
          </g>
        )}
        {isScapular && (
          <g className={arrowClass}>
            <text x="60" y="82" fontSize="14" fill="#0d9488" fontWeight="bold">→</text>
            <text x="126" y="82" fontSize="14" fill="#0d9488" fontWeight="bold">←</text>
          </g>
        )}

        {/* ── Target area glow ── */}
        {active && (
          <ellipse
            cx={isLateral ? (side === "right" ? 110 : 90) : 100}
            cy={isScapular ? 92 : isLateral ? 68 : isChinTuck ? 48 : 58}
            rx={isScapular ? 38 : 22}
            ry={isScapular ? 16 : 24}
            fill="rgba(13, 148, 136, 0.1)"
            className={t}
          >
            <animate attributeName="opacity" values="0.06;0.14;0.06" dur="2.5s" repeatCount="indefinite" />
          </ellipse>
        )}

        {/* ── Ghost of rest position ── */}
        {active && (isChinTuck || isNeckFlexion || isLateral) && (
          <ellipse
            cx={100} cy={52} rx={16} ry={20}
            fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 3"
            className="transition-opacity duration-500 opacity-60"
          />
        )}

        {/* ── Torso ── */}
        <line x1="100" y1={c.neckBaseY} x2="100" y2="165"
          stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" className={t} />
        <line x1="82" y1="165" x2="118" y2="165"
          stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />

        {/* ── Shoulders ── */}
        <line
          x1={c.leftShoulderX} y1={c.neckBaseY}
          x2={c.rightShoulderX} y2={c.neckBaseY}
          stroke="#64748b" strokeWidth="3" strokeLinecap="round" className={t}
        />

        {/* Shoulder blade indicators */}
        {isScapular && (
          <>
            <ellipse
              cx={c.leftShoulderX + 6} cy={c.neckBaseY - 2} rx="5" ry="3"
              fill={active ? "rgba(13, 148, 136, 0.35)" : "rgba(203, 213, 225, 0.5)"}
              className={t}
            />
            <ellipse
              cx={c.rightShoulderX - 6} cy={c.neckBaseY - 2} rx="5" ry="3"
              fill={active ? "rgba(13, 148, 136, 0.35)" : "rgba(203, 213, 225, 0.5)"}
              className={t}
            />
          </>
        )}

        {/* ── Left arm ── */}
        <line x1={c.leftShoulderX} y1={c.neckBaseY} x2={c.leftElbowX} y2="138"
          stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" className={t} />
        <line x1={c.leftElbowX} y1="138" x2={c.leftHandX} y2="172"
          stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" className={t} />

        {/* ── Right arm ── */}
        <line x1={c.rightShoulderX} y1={c.neckBaseY} x2={c.rightElbowX} y2="138"
          stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" className={t} />
        <line x1={c.rightElbowX} y1="138" x2={c.rightHandX} y2="172"
          stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" className={t} />

        {/* ── Neck ── */}
        <line
          x1={c.neckTopX} y1={c.neckTopY}
          x2="100" y2={c.neckBaseY}
          stroke={active ? "#0d9488" : "#64748b"} strokeWidth="2.5" strokeLinecap="round"
          className={`${t} ${active ? "transition-colors" : ""}`}
        />

        {/* ── Head ── */}
        <ellipse
          cx={c.headCX} cy={c.headCY} rx={c.headRX} ry={c.headRY}
          fill="none"
          stroke={active ? "#0d9488" : "#475569"}
          strokeWidth="2.5"
          className={t}
        />

        {/* Eyes */}
        <ellipse cx={c.headCX - 5} cy={c.headCY - 3} rx="1.5" ry="2" fill="#475569" className={t} />
        <ellipse cx={c.headCX + 5} cy={c.headCY - 3} rx="1.5" ry="2" fill="#475569" className={t} />

        {/* Nose */}
        <circle cx={c.headCX} cy={c.headCY + 3} r="1.5" fill="#475569" className={t} />

        {/* Mouth */}
        <path
          d={active
            ? `M ${c.headCX - 3} ${c.headCY + 9} Q ${c.headCX} ${c.headCY + 10} ${c.headCX + 3} ${c.headCY + 9}`
            : `M ${c.headCX - 3} ${c.headCY + 8} Q ${c.headCX} ${c.headCY + 10} ${c.headCX + 3} ${c.headCY + 8}`
          }
          fill="none" stroke="#475569" strokeWidth="1" strokeLinecap="round" className={t}
        />

        {/* ── Floor / ground line ── */}
        <line x1="40" y1="200" x2="160" y2="200" stroke="#e2e8f0" strokeWidth="1" />
      </svg>

      {/* Phase hint */}
      <div className="text-center mt-1">
        {(() => {
          const label = (() => {
            if (!active) {
              if (isChinTuck) return "准备后缩下巴";
              if (isNeckFlexion) return "准备低头前屈";
              if (isLateral) return `准备${side === "right" ? "右侧" : "左侧"}屈`;
              if (isScapular) return "准备收缩肩胛";
              return "准备";
            }
            if (phase === "hold") {
              if (isChinTuck) return "保持后缩";
              if (isNeckFlexion) return "保持前屈";
              if (isLateral) return `保持${side === "right" ? "右侧" : "左侧"}屈`;
              if (isScapular) return "保持收缩";
              return "保持";
            }
            if (isChinTuck) return "缓慢还原";
            if (isNeckFlexion) return "缓慢抬头";
            if (isLateral) return `缓慢回正${side === "right" ? "（右侧完成）" : ""}`;
            if (isScapular) return "缓慢放松";
            return "还原";
          })();
          return (
            <span className={`inline-block text-xs font-medium transition-colors duration-500 ${active ? "text-teal-600" : "text-slate-400"}`}>
              {label}
            </span>
          );
        })()}
      </div>
    </div>
  );
}
