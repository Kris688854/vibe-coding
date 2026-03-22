import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useExerciseStore = defineStore('exercise', () => {
  const exercises = ref([])
  const muscleData = ref(null)
  const categories = ref({})
  const loading = ref(false)
  const selectedExercise = ref(null)
  const selectedCategory = ref(null)
  const selectedDifficulty = ref(null)
  const currentView = ref('front')
  
  const categoriesList = computed(() => {
    return Object.entries(categories.value).map(([id, cat]) => ({
      id,
      ...cat
    }))
  })
  
  const difficultiesList = computed(() => [
    { id: 'beginner', name: '入门', color: '#10B981' },
    { id: 'intermediate', name: '中级', color: '#F59E0B' },
    { id: 'advanced', name: '高级', color: '#EF4444' }
  ])
  
  const filteredExercises = computed(() => {
    let result = exercises.value
    
    if (selectedCategory.value) {
      result = result.filter(ex => ex.category === selectedCategory.value)
    }
    
    if (selectedDifficulty.value) {
      result = result.filter(ex => ex.difficulty === selectedDifficulty.value)
    }
    
    return result
  })
  
  async function fetchMuscles() {
    try {
      const response = await fetch('/api/muscles')
      const data = await response.json()
      muscleData.value = data.muscles
      categories.value = data.categories
    } catch (error) {
      console.error('Failed to fetch muscles:', error)
    }
  }
  
  async function fetchExercises() {
    loading.value = true
    try {
      const response = await fetch('/api/exercises')
      const data = await response.json()
      exercises.value = data.exercises
    } catch (error) {
      console.error('Failed to fetch exercises:', error)
    } finally {
      loading.value = false
    }
  }
  
  function selectExercise(exercise) {
    selectedExercise.value = exercise
  }
  
  function setCategory(category) {
    selectedCategory.value = category === selectedCategory.value ? null : category
  }
  
  function setDifficulty(difficulty) {
    selectedDifficulty.value = difficulty === selectedDifficulty.value ? null : difficulty
  }
  
  function setView(view) {
    currentView.value = view
  }
  
  return {
    exercises,
    muscleData,
    categories,
    loading,
    selectedExercise,
    selectedCategory,
    selectedDifficulty,
    currentView,
    categoriesList,
    difficultiesList,
    filteredExercises,
    fetchMuscles,
    fetchExercises,
    selectExercise,
    setCategory,
    setDifficulty,
    setView
  }
})
