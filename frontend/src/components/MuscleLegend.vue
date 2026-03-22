<template>
  <div class="muscle-legend">
    <div class="legend-title">肌肉图例</div>
    <div class="legend-item">
      <div class="legend-color primary" style="background-color: #FF6B6B; box-shadow: 0 0 8px #FF6B6B;"></div>
      <span>主动肌 (主要发力)</span>
    </div>
    <div class="legend-item">
      <div class="legend-color secondary" style="background-color: #FF6B6B; opacity: 0.7;"></div>
      <span>协同肌 (辅助发力)</span>
    </div>
    <div class="legend-divider"></div>
    <div class="legend-item">
      <div class="legend-color" style="background-color: #666666; opacity: 0.3;"></div>
      <span>未激活肌肉</span>
    </div>
  </div>
</template>

<style scoped>
.muscle-legend {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  min-width: 180px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.legend-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--gray-600);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-divider {
  height: 1px;
  background: var(--gray-200);
  margin: 12px 0;
}

@media (max-width: 768px) {
  .muscle-legend {
    display: none;
  }
}
</style>
