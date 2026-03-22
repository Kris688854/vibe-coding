export const ACTIVITY_LEVEL_OPTIONS = [
  { value: "sedentary", label: "久坐少动" },
  { value: "light", label: "轻度活动" },
  { value: "moderate", label: "中度活动" },
  { value: "active", label: "高频训练" },
  { value: "very_active", label: "高强度体能" },
] as const;

export const GOAL_OPTIONS = [
  { value: "fat_loss", label: "减脂" },
  { value: "maintenance", label: "维持" },
  { value: "muscle_gain", label: "增肌" },
] as const;

export const DIET_PREFERENCE_OPTIONS = [
  { value: "balanced", label: "均衡饮食" },
  { value: "high_protein", label: "高蛋白偏好" },
  { value: "vegetarian", label: "素食" },
  { value: "low_carb", label: "控碳" },
] as const;

export const SEX_OPTIONS = [
  { value: "male", label: "男性" },
  { value: "female", label: "女性" },
] as const;

export const DAY_TYPE_OPTIONS = [
  { value: "training", label: "训练日" },
  { value: "rest", label: "休息日" },
] as const;
