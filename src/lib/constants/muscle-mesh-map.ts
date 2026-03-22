export type MuscleMeshConfig = {
  primaryMeshKeys: string[];
  secondaryMeshKeys: string[];
};

export const MUSCLE_MESH_MAP: Record<string, MuscleMeshConfig> = {
  upper_chest: {
    primaryMeshKeys: ["MUSCLE_PECS"],
    secondaryMeshKeys: ["MUSCLE_PECS"],
  },
  middle_chest: {
    primaryMeshKeys: ["MUSCLE_PECS"],
    secondaryMeshKeys: ["MUSCLE_PECS"],
  },
  lower_chest: {
    primaryMeshKeys: ["MUSCLE_PECS"],
    secondaryMeshKeys: ["MUSCLE_PECS"],
  },
  latissimus: {
    primaryMeshKeys: ["MUSCLE_LAT_1", "MUSCLE_LAT_2"],
    secondaryMeshKeys: ["MUSCLE_LAT_1", "MUSCLE_LAT_2"],
  },
  rhomboid: {
    primaryMeshKeys: ["MUSCLE_TRAP_1", "MUSCLE_TRAP_2"],
    secondaryMeshKeys: ["MUSCLE_TRAP_1", "MUSCLE_TRAP_2"],
  },
  trapezius: {
    primaryMeshKeys: ["MUSCLE_TRAP_1", "MUSCLE_TRAP_2"],
    secondaryMeshKeys: ["MUSCLE_TRAP_1", "MUSCLE_TRAP_2"],
  },
  erector_spinae: {
    primaryMeshKeys: ["BODY"],
    secondaryMeshKeys: ["BODY"],
  },
  quadriceps: {
    primaryMeshKeys: ["MUSCLE_QUAD_1", "MUSCLE_QUAD_2"],
    secondaryMeshKeys: ["MUSCLE_QUAD_1", "MUSCLE_QUAD_2"],
  },
  hamstrings: {
    primaryMeshKeys: ["MUSCLE_HAM_1", "MUSCLE_HAM_2"],
    secondaryMeshKeys: ["MUSCLE_HAM_1", "MUSCLE_HAM_2"],
  },
  gluteus: {
    primaryMeshKeys: ["MUSCLE_GLUTE_1", "MUSCLE_GLUTE_2"],
    secondaryMeshKeys: ["MUSCLE_GLUTE_1", "MUSCLE_GLUTE_2"],
  },
  calves: {
    primaryMeshKeys: ["MUSCLE_CALF_1", "MUSCLE_CALF_2"],
    secondaryMeshKeys: ["MUSCLE_CALF_1", "MUSCLE_CALF_2"],
  },
  anterior_deltoid: {
    primaryMeshKeys: ["MUSCLE_DELTS"],
    secondaryMeshKeys: ["MUSCLE_DELTS"],
  },
  lateral_deltoid: {
    primaryMeshKeys: ["MUSCLE_DELTS"],
    secondaryMeshKeys: ["MUSCLE_DELTS"],
  },
  posterior_deltoid: {
    primaryMeshKeys: ["MUSCLE_DELTS"],
    secondaryMeshKeys: ["MUSCLE_DELTS"],
  },
  biceps: {
    primaryMeshKeys: ["MUSCLE_BICEPS"],
    secondaryMeshKeys: ["MUSCLE_BICEPS"],
  },
  triceps: {
    primaryMeshKeys: ["MUSCLE_TRICEPS"],
    secondaryMeshKeys: ["MUSCLE_TRICEPS"],
  },
  forearms: {
    primaryMeshKeys: ["MUSCLE_FOREARMS"],
    secondaryMeshKeys: ["MUSCLE_FOREARMS"],
  },
  abdominals: {
    primaryMeshKeys: ["MUSCLE_ABS"],
    secondaryMeshKeys: ["MUSCLE_ABS"],
  },
  obliques: {
    primaryMeshKeys: ["MUSCLE_ABS"],
    secondaryMeshKeys: ["MUSCLE_ABS"],
  },
};

export const MODEL_MESH_LABELS: Record<string, string> = {
  MUSCLE_PECS: "胸肌",
  MUSCLE_DELTS: "三角肌",
  MUSCLE_BICEPS: "肱二头肌",
  MUSCLE_TRICEPS: "肱三头肌",
  MUSCLE_FOREARMS: "前臂",
  MUSCLE_LAT_1: "左背阔肌",
  MUSCLE_LAT_2: "右背阔肌",
  MUSCLE_TRAP_1: "左斜方肌",
  MUSCLE_TRAP_2: "右斜方肌",
  MUSCLE_ABS: "腹肌",
  MUSCLE_QUAD_1: "左股四头肌",
  MUSCLE_QUAD_2: "右股四头肌",
  MUSCLE_HAM_1: "左腘绳肌",
  MUSCLE_HAM_2: "右腘绳肌",
  MUSCLE_GLUTE_1: "左臀肌",
  MUSCLE_GLUTE_2: "右臀肌",
  MUSCLE_CALF_1: "左小腿",
  MUSCLE_CALF_2: "右小腿",
  BODY: "身体基础模型",
};

