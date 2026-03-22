<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="header">
        <h1>健身工具</h1>
        <p style="font-size: 12px; color: var(--gray-500); margin-top: 4px;">
          肌肉训练3D可视化
        </p>
      </div>
      
      <FilterBar
        :categories="store.categoriesList"
        :difficulties="store.difficultiesList"
        :selectedCategory="store.selectedCategory"
        :selectedDifficulty="store.selectedDifficulty"
        @update:selectedCategory="store.setCategory"
        @update:selectedDifficulty="store.setDifficulty"
      />
      
      <div class="exercise-count">
        共 {{ store.filteredExercises.length }} 个动作
      </div>
      
      <ExerciseList
        :exercises="store.filteredExercises"
        :selectedId="store.selectedExercise?.id"
        @select="handleExerciseSelect"
      />
    </aside>
    
    <main class="main-content">
      <div class="viewer-container">
        <MuscleViewer
          :muscleData="store.muscleData"
          :selectedExercise="store.selectedExercise"
          :currentView="store.currentView"
        />
        
        <MuscleLegend />
        
        <ExerciseDetail :exercise="store.selectedExercise" />
        
        <div class="viewer-controls">
          <button
            v-for="view in views"
            :key="view.id"
            class="view-btn"
            :class="{ active: store.currentView === view.id }"
            @click="store.setView(view.id)"
          >
            {{ view.label }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useExerciseStore } from './stores/exercise.js'
import MuscleViewer from './components/MuscleViewer.vue'
import ExerciseList from './components/ExerciseList.vue'
import FilterBar from './components/FilterBar.vue'
import ExerciseDetail from './components/ExerciseDetail.vue'
import MuscleLegend from './components/MuscleLegend.vue'

const store = useExerciseStore()

const views = [
  { id: 'front', label: '正面' },
  { id: 'back', label: '背面' },
  { id: 'left', label: '左侧' },
  { id: 'right', label: '右侧' }
]

const handleExerciseSelect = (exercise) => {
  store.selectExercise(exercise)
}

onMounted(async () => {
  await Promise.all([
    store.fetchMuscles(),
    store.fetchExercises()
  ])
})
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 320px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-right: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  background: rgba(255, 255, 255, 0.95);
  padding: 16px 20px;
  border-bottom: 1px solid var(--gray-200);
}

.header h1 {
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-900);
}

.exercise-count {
  padding: 8px 16px;
  font-size: 12px;
  color: var(--gray-500);
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
}

.viewer-container {
  flex: 1;
  position: relative;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  overflow: hidden;
}

.viewer-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  padding: 8px;
  border-radius: 12px;
}

.view-btn {
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.view-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.view-btn.active {
  background: var(--primary);
}

@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    max-height: 45vh;
    border-right: none;
    border-bottom: 1px solid var(--gray-200);
  }
  
  .viewer-container {
    min-height: 55vh;
  }
}
</style>
