export const MUSCLE_MAPPING = {
  upper_chest: {
    id: 'upper_chest',
    name: '上胸',
    name_en: 'Upper Chest',
    color: '#FF6B6B',
    meshNames: ['MUSCLE_PECS'],
    category: 'chest'
  },
  middle_chest: {
    id: 'middle_chest',
    name: '中胸',
    name_en: 'Middle Chest',
    color: '#FF4757',
    meshNames: ['MUSCLE_PECS'],
    category: 'chest'
  },
  lower_chest: {
    id: 'lower_chest',
    name: '下胸',
    name_en: 'Lower Chest',
    color: '#FF3838',
    meshNames: ['MUSCLE_PECS'],
    category: 'chest'
  },
  chest: {
    id: 'chest',
    name: '胸肌',
    name_en: 'Chest',
    color: '#FF4757',
    meshNames: ['MUSCLE_PECS'],
    category: 'chest'
  },
  latissimus: {
    id: 'latissimus',
    name: '背阔肌',
    name_en: 'Latissimus Dorsi',
    color: '#5352ED',
    meshNames: ['MUSCLE_LAT_1', 'MUSCLE_LAT_2'],
    category: 'back'
  },
  rhomboid: {
    id: 'rhomboid',
    name: '菱形肌',
    name_en: 'Rhomboid',
    color: '#3742FA',
    meshNames: [],
    category: 'back'
  },
  trapezius: {
    id: 'trapezius',
    name: '斜方肌',
    name_en: 'Trapezius',
    color: '#5352ED',
    meshNames: ['MUSCLE_TRAP_1', 'MUSCLE_TRAP_2'],
    category: 'back'
  },
  erector_spinae: {
    id: 'erector_spinae',
    name: '竖脊肌',
    name_en: 'Erector Spinae',
    color: '#1E90FF',
    meshNames: [],
    category: 'back'
  },
  quadriceps: {
    id: 'quadriceps',
    name: '股四头肌',
    name_en: 'Quadriceps',
    color: '#FFA502',
    meshNames: ['MUSCLE_QUAD_1', 'MUSCLE_QUAD_2'],
    category: 'legs'
  },
  hamstrings: {
    id: 'hamstrings',
    name: '腘绳肌',
    name_en: 'Hamstrings',
    color: '#FF7F50',
    meshNames: ['MUSCLE_HAM_1', 'MUSCLE_HAM_2'],
    category: 'legs'
  },
  gluteus: {
    id: 'gluteus',
    name: '臀大肌',
    name_en: 'Gluteus Maximus',
    color: '#FF6348',
    meshNames: ['MUSCLE_GLUTE_1', 'MUSCLE_GLUTE_2'],
    category: 'legs'
  },
  calves: {
    id: 'calves',
    name: '小腿肌群',
    name_en: 'Calves',
    color: '#FFB347',
    meshNames: ['MUSCLE_CALF_1', 'MUSCLE_CALF_2'],
    category: 'legs'
  },
  anterior_deltoid: {
    id: 'anterior_deltoid',
    name: '三角肌前束',
    name_en: 'Anterior Deltoid',
    color: '#2ED573',
    meshNames: ['MUSCLE_DELTS'],
    category: 'shoulders'
  },
  lateral_deltoid: {
    id: 'lateral_deltoid',
    name: '三角肌中束',
    name_en: 'Lateral Deltoid',
    color: '#7BED9F',
    meshNames: ['MUSCLE_DELTS'],
    category: 'shoulders'
  },
  posterior_deltoid: {
    id: 'posterior_deltoid',
    name: '三角肌后束',
    name_en: 'Posterior Deltoid',
    color: '#26DE81',
    meshNames: ['MUSCLE_DELTS'],
    category: 'shoulders'
  },
  shoulders: {
    id: 'shoulders',
    name: '三角肌',
    name_en: 'Deltoids',
    color: '#2ED573',
    meshNames: ['MUSCLE_DELTS'],
    category: 'shoulders'
  },
  biceps: {
    id: 'biceps',
    name: '肱二头肌',
    name_en: 'Biceps',
    color: '#A55EEA',
    meshNames: ['MUSCLE_BICEPS'],
    category: 'arms'
  },
  triceps: {
    id: 'triceps',
    name: '肱三头肌',
    name_en: 'Triceps',
    color: '#8854D0',
    meshNames: ['MUSCLE_TRICEPS'],
    category: 'arms'
  },
  forearms: {
    id: 'forearms',
    name: '前臂肌群',
    name_en: 'Forearms',
    color: '#D980FA',
    meshNames: ['MUSCLE_FOREARMS'],
    category: 'arms'
  },
  abdominals: {
    id: 'abdominals',
    name: '腹直肌',
    name_en: 'Abdominals',
    color: '#FD79A8',
    meshNames: ['MUSCLE_ABS'],
    category: 'core'
  },
  obliques: {
    id: 'obliques',
    name: '腹斜肌',
    name_en: 'Obliques',
    color: '#FDCB6E',
    meshNames: ['MUSCLE_ABS'],
    category: 'core'
  }
}

export const REVERSE_MAPPING = new Map()

for (const [muscleId, mapping] of Object.entries(MUSCLE_MAPPING)) {
  REVERSE_MAPPING.set(muscleId, mapping)
  for (const meshName of mapping.meshNames) {
    REVERSE_MAPPING.set(meshName, mapping)
  }
}

export function getMeshNamesByMuscleId(muscleId) {
  const mapping = MUSCLE_MAPPING[muscleId]
  return mapping ? mapping.meshNames : []
}

export function getMuscleMappingByMeshName(meshName) {
  const mapping = REVERSE_MAPPING.get(meshName)
  return mapping || null
}

export function getAllMuscleIds() {
  return Object.keys(MUSCLE_MAPPING)
}

export function getMuscleMapping(muscleId) {
  return MUSCLE_MAPPING[muscleId] || null
}

export const MODEL_MESH_NAMES = {
  MUSCLE_PECS: '胸肌 (Pectoralis)',
  MUSCLE_DELTS: '三角肌 (Deltoids)',
  MUSCLE_BICEPS: '肱二头肌 (Biceps)',
  MUSCLE_TRICEPS: '肱三头肌 (Triceps)',
  MUSCLE_FOREARMS: '前臂 (Forearms)',
  MUSCLE_LAT_1: '背阔肌左 (Lat Left)',
  MUSCLE_LAT_2: '背阔肌右 (Lat Right)',
  MUSCLE_TRAP_1: '斜方肌左 (Trap Left)',
  MUSCLE_TRAP_2: '斜方肌右 (Trap Right)',
  MUSCLE_ABS: '腹肌 (Abdominals)',
  MUSCLE_QUAD_1: '股四头肌左 (Quad Left)',
  MUSCLE_QUAD_2: '股四头肌右 (Quad Right)',
  MUSCLE_HAM_1: '腘绳肌左 (Ham Left)',
  MUSCLE_HAM_2: '腘绳肌右 (Ham Right)',
  MUSCLE_GLUTE_1: '臀肌左 (Glute Left)',
  MUSCLE_GLUTE_2: '臀肌右 (Glute Right)',
  MUSCLE_CALF_1: '小腿肌左 (Calf Left)',
  MUSCLE_CALF_2: '小腿肌右 (Calf Right)',
  BODY: '身体 (Body)'
}
