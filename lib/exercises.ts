export interface Exercise {
  id: string;
  name: string;
  description: string;
  level: "L1" | "L2" | "L3";
  duration: number; // seconds
  instructions: string[];
  targetMuscles: string;
}

export const exercises: Exercise[] = [
  {
    id: "chin-tuck",
    name: "下巴后缩",
    description: "收下巴做双下巴动作，感受颈后肌肉发力",
    level: "L1",
    duration: 36,
    instructions: [
      "坐直身体，目视前方",
      "缓慢将下巴向后平移，做出双下巴",
      "保持 3 秒",
      "缓慢放松回到原位",
    ],
    targetMuscles: "颈深屈肌",
  },
  {
    id: "chin-tuck-l2",
    name: "下巴后缩",
    description: "靠墙练习，强化下巴后缩动作",
    level: "L2",
    duration: 48,
    instructions: [
      "背靠墙壁站立，脚跟离墙一拳",
      "后脑勺尽量贴近墙壁",
      "缓慢将下巴向后平移",
      "保持 5 秒",
      "缓慢放松回到原位",
    ],
    targetMuscles: "颈深屈肌",
  },
  {
    id: "chin-tuck-l3",
    name: "下巴后缩（进阶）",
    description: "弹力带辅助抗阻训练",
    level: "L3",
    duration: 48,
    instructions: [
      "坐直，将弹力带置于脑后",
      "双手向前拉住弹力带两端",
      "下巴后缩对抗弹力带阻力",
      "保持 5 秒后缓慢还原",
    ],
    targetMuscles: "颈深屈肌",
  },
  {
    id: "neck-flexion",
    name: "颈部前屈",
    description: "缓慢低头，拉伸颈后肌群",
    level: "L1",
    duration: 36,
    instructions: [
      "坐直身体，肩膀放松",
      "缓慢将下巴靠近胸口",
      "感受颈后拉伸感",
      "保持 5 秒",
      "缓慢抬头回到原位",
    ],
    targetMuscles: "颈后肌群",
  },
  {
    id: "neck-flexion-l2",
    name: "颈部前屈",
    description: "增加活动范围和保持时间",
    level: "L2",
    duration: 48,
    instructions: [
      "坐直身体，肩膀下沉放松",
      "缓慢将下巴靠近胸口至最大范围",
      "双手可轻放头顶辅助（勿用力）",
      "保持 10 秒",
      "缓慢抬头回到原位",
    ],
    targetMuscles: "颈后肌群",
  },
  {
    id: "neck-flexion-l3",
    name: "颈部前屈（进阶）",
    description: "强化离心控制",
    level: "L3",
    duration: 48,
    instructions: [
      "仰卧，头部悬空",
      "缓慢低头，下巴靠近胸口",
      "控制抬头回到中立位（离心阶段放慢）",
      "重复动作",
    ],
    targetMuscles: "颈后肌群、颈深屈肌",
  },
  {
    id: "lateral-flexion",
    name: "颈部侧屈",
    description: "左右交替侧屈颈部，拉伸胸锁乳突肌",
    level: "L1",
    duration: 36,
    instructions: [
      "坐直，肩膀放松",
      "先向左侧屈，左耳靠近左肩",
      "感受右侧颈部拉伸，保持",
      "缓慢回正，换右侧",
      "右耳靠近右肩，保持",
      "缓慢回正",
    ],
    targetMuscles: "胸锁乳突肌、斜角肌",
  },
  {
    id: "lateral-flexion-l2",
    name: "颈部侧屈",
    description: "左右交替，增加保持时间和活动范围",
    level: "L2",
    duration: 48,
    instructions: [
      "坐直，对侧手可轻拉椅子边缘固定肩膀",
      "先向左侧屈，耳朵靠向左肩至最大范围",
      "保持，感受右侧拉伸",
      "缓慢回正后换右侧",
      "右侧屈至最大范围，保持",
      "缓慢回正",
    ],
    targetMuscles: "胸锁乳突肌、斜角肌",
  },
  {
    id: "lateral-flexion-l3",
    name: "颈部侧屈（进阶）",
    description: "左右交替，增加离心控制和轻微阻力",
    level: "L3",
    duration: 48,
    instructions: [
      "坐直，同侧手可轻压头部增加轻微阻力",
      "先向左侧屈至最大范围",
      "用手给轻微阻力，对抗回正",
      "缓慢回正后换右侧",
      "右侧屈，离心控制回正",
      "缓慢还原",
    ],
    targetMuscles: "胸锁乳突肌、斜角肌",
  },
  {
    id: "scapular-retraction",
    name: "肩胛收缩",
    description: "夹紧肩胛骨，改善圆肩驼背",
    level: "L1",
    duration: 36,
    instructions: [
      "坐直或站立，手臂自然下垂",
      "缓慢将两侧肩胛骨向中间夹紧",
      "保持 3 秒",
      "缓慢放松回到原位",
    ],
    targetMuscles: "菱形肌、斜方肌中下束",
  },
  {
    id: "scapular-retraction-l2",
    name: "肩胛收缩",
    description: "手臂外展位强化训练",
    level: "L2",
    duration: 48,
    instructions: [
      "站立，双臂侧平举与肩同高",
      "手臂向后画圈，同时夹紧肩胛骨",
      "保持 5 秒",
      "控制回到起始位",
    ],
    targetMuscles: "菱形肌、斜方肌中下束",
  },
  {
    id: "scapular-retraction-l3",
    name: "肩胛收缩（进阶）",
    description: "弹力带抗阻训练",
    level: "L3",
    duration: 48,
    instructions: [
      "双手握住弹力带，手臂前伸与肩同高",
      "向两侧拉开弹力带，同时夹紧肩胛骨",
      "保持 5 秒",
      "缓慢回到起始位",
    ],
    targetMuscles: "菱形肌、斜方肌中下束、三角肌后束",
  },
];

export interface TrainingPlan {
  exercises: Exercise[];
  totalDuration: number;
  level: "L1" | "L2" | "L3";
}

export function getTrainingPlan(severity: "good" | "mild" | "moderate" | "severe"): TrainingPlan {
  let level: "L1" | "L2" | "L3";
  switch (severity) {
    case "good": level = "L1"; break;
    case "mild": level = "L2"; break;
    default: level = "L3"; break;
  }

  const planExercises = exercises.filter((e) => {
    const baseId = e.id.replace(/-l[123]$/, "");
    if (level === "L1") return e.id === baseId;
    if (level === "L2") return e.id === `${baseId}-l2` || e.id === baseId;
    return e.id === `${baseId}-l3` || e.id === `${baseId}-l2`;
  });

  // Deduplicate by keeping highest level
  const seen = new Set<string>();
  const deduped: Exercise[] = [];
  for (const ex of planExercises) {
    const base = ex.id.replace(/-l[123]$/, "");
    if (!seen.has(base)) {
      seen.add(base);
      deduped.push(ex);
    }
  }

  const totalDuration = deduped.reduce((sum, e) => sum + e.duration, 0);
  return { exercises: deduped, totalDuration, level };
}
