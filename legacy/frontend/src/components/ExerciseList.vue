<template>
  <div class="exercise-list" v-if="exercises.length > 0">
    <div
      v-for="exercise in exercises"
      :key="exercise.id"
      class="exercise-item"
      :class="{ active: selectedId === exercise.id }"
      @click="$emit('select', exercise)"
    >
      <div class="exercise-name">{{ exercise.name }}</div>
      <div class="exercise-meta">
        <span class="exercise-badge badge-difficulty" :class="exercise.difficulty">
          {{ difficultyLabels[exercise.difficulty] }}
        </span>
        <span class="exercise-badge badge-equipment">
          {{ exercise.equipment[0] }}
        </span>
      </div>
    </div>
  </div>
  <div v-else class="loading">
    <div class="loading-spinner"></div>
    加载中...
  </div>
</template>

<script setup>
defineProps({
  exercises: {
    type: Array,
    default: () => []
  },
  selectedId: {
    type: String,
    default: null
  }
})

defineEmits(['select'])

const difficultyLabels = {
  beginner: '入门',
  intermediate: '中级',
  advanced: '高级'
}
</script>

<style scoped>
.exercise-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.exercise-item {
  background: var(--gray-50);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.exercise-item:hover {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.exercise-item.active {
  border-color: var(--primary);
  background: white;
}

.exercise-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 6px;
}

.exercise-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.exercise-badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.badge-difficulty {
  background: var(--gray-100);
  color: var(--gray-600);
}

.badge-difficulty.beginner {
  background: #D1FAE5;
  color: #065F46;
}

.badge-difficulty.intermediate {
  background: #FEF3C7;
  color: #92400E;
}

.badge-difficulty.advanced {
  background: #FEE2E2;
  color: #991B1B;
}

.badge-equipment {
  background: var(--gray-100);
  color: var(--gray-500);
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--gray-400);
}
</style>
