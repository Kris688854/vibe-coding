export const CATEGORY_META = {
  chest: {
    id: "chest",
    label: "胸部",
    labelEn: "Chest",
    icon: "胸",
    sortOrder: 1,
  },
  back: {
    id: "back",
    label: "背部",
    labelEn: "Back",
    icon: "背",
    sortOrder: 2,
  },
  legs: {
    id: "legs",
    label: "腿部",
    labelEn: "Legs",
    icon: "腿",
    sortOrder: 3,
  },
  shoulders: {
    id: "shoulders",
    label: "肩部",
    labelEn: "Shoulders",
    icon: "肩",
    sortOrder: 4,
  },
  arms: {
    id: "arms",
    label: "手臂",
    labelEn: "Arms",
    icon: "臂",
    sortOrder: 5,
  },
  core: {
    id: "core",
    label: "核心",
    labelEn: "Core",
    icon: "核",
    sortOrder: 6,
  },
} as const;

export const CATEGORY_ORDER = Object.keys(CATEGORY_META) as Array<
  keyof typeof CATEGORY_META
>;

export const DIFFICULTY_META = {
  beginner: {
    id: "beginner",
    label: "入门",
    color: "#22c55e",
  },
  intermediate: {
    id: "intermediate",
    label: "进阶",
    color: "#f59e0b",
  },
  advanced: {
    id: "advanced",
    label: "高阶",
    color: "#ef4444",
  },
} as const;

export type ExerciseCategory = keyof typeof CATEGORY_META;
export type ExerciseDifficulty = keyof typeof DIFFICULTY_META;

