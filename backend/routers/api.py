"""API路由"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from backend.data.muscles import MUSCLES, CATEGORIES, DIFFICULTIES, get_all_muscles, get_muscle_by_id
from backend.data.exercises import (
    get_all_exercises, get_exercise_by_id, get_exercises_by_category,
    get_exercises_by_muscle, get_exercises_by_equipment, get_exercises_by_difficulty
)

router = APIRouter()

@router.get("/muscles")
async def get_muscles():
    """获取所有肌肉定义"""
    return {
        "muscles": MUSCLES,
        "categories": CATEGORIES
    }

@router.get("/muscles/list")
async def get_muscles_list():
    """获取肌肉列表（扁平化）"""
    return get_all_muscles()

@router.get("/muscles/{muscle_id}")
async def get_muscle(muscle_id: str):
    """获取单个肌肉详情"""
    muscle = get_muscle_by_id(muscle_id)
    if not muscle:
        raise HTTPException(status_code=404, detail="肌肉不存在")
    return muscle

@router.get("/exercises")
async def get_exercises(
    category: Optional[str] = Query(None, description="肌肉分类"),
    muscle: Optional[str] = Query(None, description="肌肉ID"),
    equipment: Optional[str] = Query(None, description="器材名称"),
    difficulty: Optional[str] = Query(None, description="难度等级"),
    include_muscles: bool = Query(True, description="是否包含肌肉详情")
):
    """获取动作列表，支持多条件筛选"""
    exercises = get_all_exercises()
    
    if category:
        exercises = [ex for ex in exercises if ex["category"] == category]
    if muscle:
        exercises = [ex for ex in exercises 
                     if muscle in ex["muscles"].get("primary", []) 
                     or muscle in ex["muscles"].get("secondary", [])]
    if equipment:
        exercises = [ex for ex in exercises if equipment in ex.get("equipment", [])]
    if difficulty:
        exercises = [ex for ex in exercises if ex["difficulty"] == difficulty]
    
    if include_muscles:
        for exercise in exercises:
            exercise["muscle_details"] = {
                "primary": [get_muscle_by_id(m) for m in exercise["muscles"].get("primary", [])],
                "secondary": [get_muscle_by_id(m) for m in exercise["muscles"].get("secondary", [])]
            }
    
    return {
        "exercises": exercises,
        "total": len(exercises),
        "filters": {
            "category": category,
            "muscle": muscle,
            "equipment": equipment,
            "difficulty": difficulty
        }
    }

@router.get("/exercises/{exercise_id}")
async def get_exercise(exercise_id: str):
    """获取单个动作详情"""
    exercise = get_exercise_by_id(exercise_id)
    if not exercise:
        raise HTTPException(status_code=404, detail="动作不存在")
    
    exercise["muscle_details"] = {
        "primary": [get_muscle_by_id(m) for m in exercise["muscles"].get("primary", [])],
        "secondary": [get_muscle_by_id(m) for m in exercise["muscles"].get("secondary", [])]
    }
    
    return exercise

@router.get("/categories")
async def get_categories():
    """获取所有分类"""
    return CATEGORIES

@router.get("/difficulties")
async def get_difficulties():
    """获取所有难度等级"""
    return DIFFICULTIES

@router.get("/equipment")
async def get_equipment_list():
    """获取所有可用器材"""
    exercises = get_all_exercises()
    equipment_set = set()
    for ex in exercises:
        equipment_set.update(ex.get("equipment", []))
    return sorted(list(equipment_set))

@router.get("/stats")
async def get_stats():
    """获取数据统计"""
    exercises = get_all_exercises()
    muscles = get_all_muscles()
    
    category_counts = {}
    for ex in exercises:
        cat = ex["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1
    
    return {
        "total_exercises": len(exercises),
        "total_muscles": len(muscles),
        "exercises_by_category": category_counts
    }
