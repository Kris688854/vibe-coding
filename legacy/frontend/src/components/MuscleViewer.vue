<template>
  <div class="muscle-viewer" ref="container">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      加载中...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { HumanModel } from '../three/HumanModel.js'

const props = defineProps({
  muscleData: {
    type: Object,
    default: null
  },
  selectedExercise: {
    type: Object,
    default: null
  },
  currentView: {
    type: String,
    default: 'front'
  }
})

const emit = defineEmits(['muscleClick'])

const container = ref(null)
const loading = ref(true)

let scene, camera, renderer, controls
let humanModel
let animationId

const initThreeJS = () => {
  if (!container.value) return
  
  const width = container.value.clientWidth
  const height = container.value.clientHeight
  
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1a2e)
  
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.set(0, 1.2, 3)
  camera.lookAt(0, 1, 0)
  
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  container.value.appendChild(renderer.domElement)
  
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = 1.5
  controls.maxDistance = 5
  controls.target.set(0, 1, 0)
  controls.maxPolarAngle = Math.PI
  controls.minPolarAngle = 0
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)
  
  const frontLight = new THREE.DirectionalLight(0xffffff, 0.8)
  frontLight.position.set(0, 2, 3)
  frontLight.castShadow = true
  scene.add(frontLight)
  
  const backLight = new THREE.DirectionalLight(0x8888ff, 0.3)
  backLight.position.set(0, 2, -3)
  scene.add(backLight)
  
  const topLight = new THREE.DirectionalLight(0xffffff, 0.4)
  topLight.position.set(0, 4, 0)
  scene.add(topLight)
  
  const gridHelper = new THREE.GridHelper(4, 20, 0x333344, 0x222233)
  gridHelper.position.y = -0.2
  scene.add(gridHelper)
  
  humanModel = new HumanModel()
  if (props.muscleData) {
    humanModel.setMuscleData(props.muscleData)
  }
  scene.add(humanModel.getGroup())
  
  loading.value = false
  
  animate()
  
  window.addEventListener('resize', onWindowResize)
  setupRaycaster()
}

const animate = () => {
  animationId = requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

const onWindowResize = () => {
  if (!container.value) return
  const width = container.value.clientWidth
  const height = container.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

const setupRaycaster = () => {
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()
  
  renderer.domElement.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(scene.children, true)
    
    for (const intersect of intersects) {
      if (intersect.object.userData && intersect.object.userData.id) {
        emit('muscleClick', intersect.object.userData)
        break
      }
    }
  })
}

watch(() => props.muscleData, (newData) => {
  if (newData && humanModel) {
    humanModel.setMuscleData(newData)
  }
})

watch(() => props.selectedExercise, (exercise) => {
  if (!humanModel) return
  
  if (exercise && exercise.muscle_details) {
    const primaryIds = exercise.muscle_details.primary
      .filter(m => m)
      .map(m => m.id)
    const secondaryIds = exercise.muscle_details.secondary
      .filter(m => m)
      .map(m => m.id)
    humanModel.highlightMuscles(primaryIds, secondaryIds)
  } else {
    humanModel.clearHighlights()
  }
})

watch(() => props.currentView, (view) => {
  if (humanModel) {
    humanModel.setView(view)
  }
})

onMounted(() => {
  initThreeJS()
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (renderer) {
    renderer.dispose()
  }
})
</script>

<style scoped>
.muscle-viewer {
  width: 100%;
  height: 100%;
  position: relative;
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}
</style>
