import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MUSCLE_MAPPING, REVERSE_MAPPING, getMeshNamesByMuscleId, MODEL_MESH_NAMES } from './MuscleMapper.js'

export class AnatomicalModel {
  constructor(scene) {
    this.scene = scene
    this.group = new THREE.Group()
    this.model = null
    this.allMeshes = new Map()
    this.muscleMeshes = new Map()
    this.originalMaterials = new Map()
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.clickableObjects = []
    this.muscleClickCallback = null
    this.debugMode = false
    
    this.scene.add(this.group)
  }
  
  async loadModel(url, onProgress) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader()
      
      loader.load(
        url,
        (gltf) => {
          this.model = gltf.scene
          this.group.add(this.model)
          
          this.processModel()
          
          if (this.debugMode) {
            this.logAllMeshNames()
          }
          
          console.log('Anatomical model loaded successfully')
          console.log(`Found ${this.muscleMeshes.size} muscle meshes`)
          resolve()
        },
        (progress) => {
          if (onProgress && progress.total > 0) {
            const percent = (progress.loaded / progress.total) * 100
            onProgress({ loaded: progress.loaded, total: progress.total, percent })
          }
        },
        (error) => {
          console.error('Error loading model:', error)
          reject(error)
        }
      )
    })
  }
  
  processModel() {
    this.model.traverse((child) => {
      if (child.isMesh) {
        const meshName = child.name || ''
        
        this.allMeshes.set(meshName, child)
        this.clickableObjects.push(child)
        
        this.originalMaterials.set(child.uuid, child.material.clone())
        
        if (this.isMuscleMesh(meshName)) {
          this.muscleMeshes.set(meshName, child)
          child.userData.isMuscle = true
          child.userData.meshName = meshName
          child.userData.displayName = MODEL_MESH_NAMES[meshName] || meshName
        }
      }
    })
    
    this.alignModel()
  }
  
  alignModel() {
    const box = new THREE.Box3().setFromObject(this.model)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    
    this.model.position.sub(center)
    
    const maxDim = Math.max(size.x, size.y, size.z)
    this.model.scale.setScalar(2 / maxDim)
    
    this.model.position.y -= size.y / 2 * (2 / maxDim)
  }
  
  isMuscleMesh(meshName) {
    return meshName.startsWith('MUSCLE_')
  }
  
  logAllMeshNames() {
    console.log('=== All Mesh Names in Model ===')
    console.log(`Total meshes: ${this.allMeshes.size}`)
    console.log(`Muscle meshes: ${this.muscleMeshes.size}`)
    
    console.log('\nAll muscle meshes:')
    this.muscleMeshes.forEach((mesh, name) => {
      console.log(`  - ${name}: ${mesh.userData.displayName || name}`)
    })
    
    console.log('\n=== End of Mesh List ===')
  }
  
  highlightMuscles(primaryIds, secondaryIds) {
    this.clearHighlights()
    
    const allHighlightIds = [...primaryIds, ...secondaryIds]
    
    allHighlightIds.forEach(muscleId => {
      const meshNames = getMeshNamesByMuscleId(muscleId)
      
      meshNames.forEach(meshName => {
        const mesh = this.muscleMeshes.get(meshName)
        if (mesh) {
          const isPrimary = primaryIds.includes(muscleId)
          this.setMuscleHighlight(mesh, muscleId, isPrimary)
        }
      })
    })
  }
  
  setMuscleHighlight(mesh, muscleId, isPrimary) {
    const mapping = MUSCLE_MAPPING[muscleId]
    const baseColor = mapping?.color || '#FF6B6B'
    const color = new THREE.Color(baseColor)
    
    mesh.material = mesh.material.clone()
    mesh.material.color.copy(color)
    
    if (isPrimary) {
      mesh.material.emissive = color
      mesh.material.emissiveIntensity = 0.5
      mesh.material.opacity = 1
    } else {
      mesh.material.color.copy(color).multiplyScalar(0.7)
      mesh.material.emissive = color
      mesh.material.emissiveIntensity = 0.25
      mesh.material.opacity = 0.8
    }
    
    mesh.material.transparent = true
    mesh.material.depthWrite = true
    
    mesh.userData.highlighted = true
    mesh.userData.highlightIntensity = isPrimary ? 'primary' : 'secondary'
    mesh.userData.muscleId = muscleId
  }
  
  clearHighlights() {
    this.muscleMeshes.forEach((mesh) => {
      if (mesh.userData.highlighted) {
        const original = this.originalMaterials.get(mesh.uuid)
        if (original) {
          mesh.material = original.clone()
        }
        mesh.userData.highlighted = false
        mesh.userData.highlightIntensity = null
        mesh.userData.muscleId = null
      }
    })
  }
  
  onClick(event, camera, domElement) {
    const rect = domElement.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    
    this.raycaster.setFromCamera(this.mouse, camera)
    const intersects = this.raycaster.intersectObjects(this.clickableObjects, false)
    
    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object
      this.handleMuscleClick(clickedMesh)
    }
  }
  
  handleMuscleClick(mesh) {
    if (!mesh) return
    
    const meshName = mesh.name || ''
    const mapping = REVERSE_MAPPING.get(meshName)
    
    const info = {
      meshName: meshName,
      name: mesh.userData.displayName || meshName,
      displayName: mesh.userData.displayName || meshName,
      muscleId: mapping?.id || null,
      muscleName: mapping?.name || null,
      category: mapping?.category || null,
      isMuscle: mesh.userData.isMuscle || false,
      wikiLink: null
    }
    
    if (this.muscleClickCallback) {
      this.muscleClickCallback(info)
    }
  }
  
  setMuscleClickCallback(callback) {
    this.muscleClickCallback = callback
  }
  
  setDebugMode(enabled) {
    this.debugMode = enabled
  }
  
  getMuscleMeshes() {
    return this.muscleMeshes
  }
  
  getGroup() {
    return this.group
  }
  
  dispose() {
    this.clickableObjects.forEach(mesh => {
      if (mesh.geometry) mesh.geometry.dispose()
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose())
        } else {
          mesh.material.dispose()
        }
      }
    })
    
    this.scene.remove(this.group)
  }
}
