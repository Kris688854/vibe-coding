<template>
  <div class="filter-section">
    <div class="filter-group">
      <div class="filter-label">肌肉群</div>
      <div class="filter-chips">
        <span
          v-for="cat in categories"
          :key="cat.id"
          class="chip"
          :class="{ active: selectedCategory === cat.id }"
          @click="$emit('update:selectedCategory', cat.id)"
        >
          {{ cat.icon }} {{ cat.name }}
        </span>
      </div>
    </div>
    
    <div class="filter-group">
      <div class="filter-label">难度</div>
      <div class="filter-chips">
        <span
          v-for="diff in difficulties"
          :key="diff.id"
          class="chip"
          :class="{ active: selectedDifficulty === diff.id }"
          :style="selectedDifficulty === diff.id ? { background: diff.color, borderColor: diff.color } : {}"
          @click="$emit('update:selectedDifficulty', diff.id)"
        >
          {{ diff.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  difficulties: {
    type: Array,
    default: () => []
  },
  selectedCategory: {
    type: String,
    default: null
  },
  selectedDifficulty: {
    type: String,
    default: null
  }
})

defineEmits(['update:selectedCategory', 'update:selectedDifficulty'])
</script>

<style scoped>
.filter-section {
  padding: 16px;
  border-bottom: 1px solid var(--gray-200);
}

.filter-group {
  margin-bottom: 12px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--gray-200);
  background: var(--gray-50);
  color: var(--gray-600);
}

.chip:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.chip.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}
</style>
