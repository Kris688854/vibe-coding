<template>
  <div class="detail-panel" v-if="exercise">
    <div class="detail-title">{{ exercise.name }}</div>
    <div class="detail-desc">{{ exercise.description }}</div>
    
    <div class="detail-section">
      <div class="detail-section-title">主动肌 (主要发力)</div>
      <div class="muscle-tags">
        <span
          v-for="muscle in exercise.muscle_details.primary"
          :key="muscle.id"
          class="muscle-tag primary"
          :style="{ backgroundColor: muscle.color }"
        >
          {{ muscle.name }}
        </span>
      </div>
    </div>
    
    <div class="detail-section" v-if="exercise.muscle_details.secondary.length">
      <div class="detail-section-title">协同肌 (辅助发力)</div>
      <div class="muscle-tags">
        <span
          v-for="muscle in exercise.muscle_details.secondary"
          :key="muscle.id"
          class="muscle-tag secondary"
          :style="{ borderColor: muscle.color, color: muscle.color }"
        >
          {{ muscle.name }}
        </span>
      </div>
    </div>
    
    <div class="detail-section">
      <div class="detail-section-title">器材</div>
      <div class="muscle-tags">
        <span
          v-for="eq in exercise.equipment"
          :key="eq"
          class="muscle-tag secondary"
        >
          {{ eq }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  exercise: {
    type: Object,
    default: null
  }
})
</script>

<style scoped>
.detail-panel {
  position: absolute;
  bottom: 80px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  min-width: 280px;
  max-width: 320px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.detail-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 8px;
}

.detail-desc {
  font-size: 13px;
  color: var(--gray-500);
  line-height: 1.5;
  margin-bottom: 16px;
}

.detail-section {
  margin-bottom: 12px;
}

.detail-section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-400);
  text-transform: uppercase;
  margin-bottom: 8px;
}

.muscle-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.muscle-tag {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.muscle-tag.primary {
  color: white;
}

.muscle-tag.secondary {
  background: var(--gray-100);
  color: var(--gray-600);
  border: 1px solid;
}

@media (max-width: 768px) {
  .detail-panel {
    display: none;
  }
}
</style>
