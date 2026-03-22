"""肌肉定义数据"""

MUSCLES = {
    "chest": {
        "upper_chest": {
            "id": "upper_chest",
            "name": "上胸",
            "name_en": "Upper Chest",
            "category": "chest",
            "color": "#FF6B6B",
            "position": {"x": 0, "y": 1.3, "z": 0.3},
            "size": {"width": 0.35, "height": 0.15, "depth": 0.12}
        },
        "middle_chest": {
            "id": "middle_chest",
            "name": "中胸",
            "name_en": "Middle Chest",
            "category": "chest",
            "color": "#FF4757",
            "position": {"x": 0, "y": 1.15, "z": 0.3},
            "size": {"width": 0.38, "height": 0.18, "depth": 0.1}
        },
        "lower_chest": {
            "id": "lower_chest",
            "name": "下胸",
            "name_en": "Lower Chest",
            "category": "chest",
            "color": "#FF3838",
            "position": {"x": 0, "y": 1.0, "z": 0.28},
            "size": {"width": 0.35, "height": 0.15, "depth": 0.1}
        }
    },
    "back": {
        "latissimus": {
            "id": "latissimus",
            "name": "背阔肌",
            "name_en": "Latissimus Dorsi",
            "category": "back",
            "color": "#5352ED",
            "position": {"x": 0, "y": 1.1, "z": -0.25},
            "size": {"width": 0.4, "height": 0.35, "depth": 0.08}
        },
        "rhomboid": {
            "id": "rhomboid",
            "name": "菱形肌",
            "name_en": "Rhomboid",
            "category": "back",
            "color": "#3742FA",
            "position": {"x": 0, "y": 1.25, "z": -0.22},
            "size": {"width": 0.3, "height": 0.15, "depth": 0.06}
        },
        "trapezius": {
            "id": "trapezius",
            "name": "斜方肌",
            "name_en": "Trapezius",
            "category": "back",
            "color": "#5352ED",
            "position": {"x": 0, "y": 1.35, "z": -0.18},
            "size": {"width": 0.4, "height": 0.12, "depth": 0.05}
        },
        "erector_spinae": {
            "id": "erector_spinae",
            "name": "竖脊肌",
            "name_en": "Erector Spinae",
            "category": "back",
            "color": "#1E90FF",
            "position": {"x": 0, "y": 1.0, "z": -0.2},
            "size": {"width": 0.12, "height": 0.3, "depth": 0.06}
        }
    },
    "legs": {
        "quadriceps": {
            "id": "quadriceps",
            "name": "股四头肌",
            "name_en": "Quadriceps",
            "category": "legs",
            "color": "#FFA502",
            "position": {"x": 0, "y": 0.55, "z": 0.1},
            "size": {"width": 0.2, "height": 0.4, "depth": 0.15}
        },
        "hamstrings": {
            "id": "hamstrings",
            "name": "腘绳肌",
            "name_en": "Hamstrings",
            "category": "legs",
            "color": "#FF7F50",
            "position": {"x": 0, "y": 0.55, "z": -0.1},
            "size": {"width": 0.18, "height": 0.38, "depth": 0.12}
        },
        "gluteus": {
            "id": "gluteus",
            "name": "臀大肌",
            "name_en": "Gluteus Maximus",
            "category": "legs",
            "color": "#FF6348",
            "position": {"x": 0, "y": 0.85, "z": -0.08},
            "size": {"width": 0.35, "height": 0.15, "depth": 0.15}
        },
        "calves": {
            "id": "calves",
            "name": "小腿肌群",
            "name_en": "Calves",
            "category": "legs",
            "color": "#FFB347",
            "position": {"x": 0, "y": 0.15, "z": 0.05},
            "size": {"width": 0.12, "height": 0.25, "depth": 0.1}
        }
    },
    "shoulders": {
        "anterior_deltoid": {
            "id": "anterior_deltoid",
            "name": "三角肌前束",
            "name_en": "Anterior Deltoid",
            "category": "shoulders",
            "color": "#2ED573",
            "position": {"x": 0.22, "y": 1.35, "z": 0.08},
            "size": {"width": 0.12, "height": 0.12, "depth": 0.1}
        },
        "lateral_deltoid": {
            "id": "lateral_deltoid",
            "name": "三角肌中束",
            "name_en": "Lateral Deltoid",
            "category": "shoulders",
            "color": "#7BED9F",
            "position": {"x": 0.28, "y": 1.35, "z": 0},
            "size": {"width": 0.12, "height": 0.1, "depth": 0.1}
        },
        "posterior_deltoid": {
            "id": "posterior_deltoid",
            "name": "三角肌后束",
            "name_en": "Posterior Deltoid",
            "category": "shoulders",
            "color": "#26DE81",
            "position": {"x": 0.22, "y": 1.35, "z": -0.08},
            "size": {"width": 0.12, "height": 0.12, "depth": 0.1}
        }
    },
    "arms": {
        "biceps": {
            "id": "biceps",
            "name": "肱二头肌",
            "name_en": "Biceps",
            "category": "arms",
            "color": "#A55EEA",
            "position": {"x": 0.32, "y": 1.1, "z": 0.05},
            "size": {"width": 0.08, "height": 0.22, "depth": 0.08}
        },
        "triceps": {
            "id": "triceps",
            "name": "肱三头肌",
            "name_en": "Triceps",
            "category": "arms",
            "color": "#8854D0",
            "position": {"x": 0.32, "y": 1.1, "z": -0.05},
            "size": {"width": 0.08, "height": 0.22, "depth": 0.08}
        },
        "forearms": {
            "id": "forearms",
            "name": "前臂肌群",
            "name_en": "Forearms",
            "category": "arms",
            "color": "#D980FA",
            "position": {"x": 0.35, "y": 0.85, "z": 0},
            "size": {"width": 0.06, "height": 0.2, "depth": 0.06}
        }
    },
    "core": {
        "abdominals": {
            "id": "abdominals",
            "name": "腹直肌",
            "name_en": "Abdominals",
            "category": "core",
            "color": "#FD79A8",
            "position": {"x": 0, "y": 1.0, "z": 0.18},
            "size": {"width": 0.2, "height": 0.25, "depth": 0.06}
        },
        "obliques": {
            "id": "obliques",
            "name": "腹斜肌",
            "name_en": "Obliques",
            "category": "core",
            "color": "#FDCB6E",
            "position": {"x": 0.15, "y": 1.0, "z": 0.12},
            "size": {"width": 0.08, "height": 0.2, "depth": 0.08}
        }
    }
}

CATEGORIES = {
    "chest": {"name": "胸部", "name_en": "Chest", "icon": "💪"},
    "back": {"name": "背部", "name_en": "Back", "icon": "🔙"},
    "legs": {"name": "腿部", "name_en": "Legs", "icon": "🦵"},
    "shoulders": {"name": "肩部", "name_en": "Shoulders", "icon": "🎯"},
    "arms": {"name": "手臂", "name_en": "Arms", "icon": "💪"},
    "core": {"name": "核心", "name_en": "Core", "icon": "🎯"}
}

DIFFICULTIES = {
    "beginner": {"name": "入门", "color": "#2ED573"},
    "intermediate": {"name": "中级", "color": "#FFA502"},
    "advanced": {"name": "高级", "color": "#FF4757"}
}

def get_all_muscles():
    """获取所有肌肉数据"""
    all_muscles = []
    for category, muscles in MUSCLES.items():
        for muscle_id, muscle in muscles.items():
            all_muscles.append(muscle)
    return all_muscles

def get_muscle_by_id(muscle_id):
    """根据ID获取肌肉数据"""
    for muscles in MUSCLES.values():
        if muscle_id in muscles:
            return muscles[muscle_id]
    return None

def get_muscles_by_category(category):
    """根据分类获取肌肉"""
    return list(MUSCLES.get(category, {}).values())
