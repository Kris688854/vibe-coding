export const TRAINING_GOAL_OPTIONS = [
  { value: "bulk", label: "增肌期" },
  { value: "cut", label: "减脂期" },
  { value: "maintain", label: "维持状态" },
  { value: "recomp", label: "体态重组" },
] as const;

export const TRAINING_DAY_OPTIONS = [3, 4, 5, 6] as const;

export const EXPERIENCE_LEVEL_OPTIONS = [
  { value: "beginner", label: "新手" },
  { value: "intermediate", label: "中级" },
  { value: "advanced", label: "高级" },
] as const;

export const SPLIT_TYPE_OPTIONS = [
  { value: "ppl", label: "PPL" },
  { value: "upper-lower", label: "上肢 / 下肢" },
  { value: "full-body", label: "全身" },
  { value: "bro-split", label: "分部位" },
] as const;

export const EQUIPMENT_ACCESS_OPTIONS = [
  { value: "gym", label: "完整健身房" },
  { value: "dumbbell", label: "哑铃 / 基础器械" },
  { value: "bodyweight", label: "徒手训练" },
] as const;

export const SESSION_DURATION_OPTIONS = [45, 60, 75, 90] as const;

export const RESTRICTION_OPTIONS = [
  { value: "no_squat", label: "避免深蹲" },
  { value: "no_deadlift", label: "避免硬拉" },
  { value: "no_overhead_press", label: "避免过头推举" },
] as const;
