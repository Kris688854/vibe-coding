import * as THREE from 'three'

export class HumanModel {
  constructor() {
    this.group = new THREE.Group()
    this.muscleMeshes = {}
    this.bodyParts = {}
    this.muscleData = null
    
    this.initBody()
  }
  
  setMuscleData(muscleData) {
    this.muscleData = muscleData
    this.createMuscleMeshes()
  }
  
  initBody() {
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0xE8D5C4,
      shininess: 30
    })
    
    const boneMaterial = new THREE.MeshPhongMaterial({
      color: 0xF5F5DC,
      shininess: 20
    })
    
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 32, 32),
      bodyMaterial
    )
    head.position.set(0, 1.55, 0)
    head.name = 'head'
    this.bodyParts.head = head
    this.group.add(head)
    
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 0.1, 16),
      bodyMaterial
    )
    neck.position.set(0, 1.42, 0)
    this.bodyParts.neck = neck
    this.group.add(neck)
    
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.55, 0.22),
      bodyMaterial
    )
    torso.position.set(0, 1.1, 0)
    torso.name = 'torso'
    this.bodyParts.torso = torso
    this.group.add(torso)
    
    const pelvis = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.15, 0.18),
      bodyMaterial
    )
    pelvis.position.set(0, 0.78, 0)
    this.bodyParts.pelvis = pelvis
    this.group.add(pelvis)
    
    const createArm = (side) => {
      const x = side === 'left' ? 0.28 : -0.28
      
      const shoulder = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 16, 16),
        bodyMaterial
      )
      shoulder.position.set(x, 1.35, 0)
      shoulder.name = `${side}Shoulder`
      this.bodyParts[`${side}Shoulder`] = shoulder
      this.group.add(shoulder)
      
      const upperArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.05, 0.28, 16),
        bodyMaterial
      )
      upperArm.position.set(x, 1.15, 0)
      upperArm.name = `${side}UpperArm`
      this.bodyParts[`${side}UpperArm`] = upperArm
      this.group.add(upperArm)
      
      const elbow = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 16, 16),
        bodyMaterial
      )
      elbow.position.set(x, 1.0, 0)
      this.bodyParts[`${side}Elbow`] = elbow
      this.group.add(elbow)
      
      const forearm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.04, 0.26, 16),
        bodyMaterial
      )
      forearm.position.set(x, 0.82, 0)
      forearm.name = `${side}Forearm`
      this.bodyParts[`${side}Forearm`] = forearm
      this.group.add(forearm)
      
      const hand = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.1, 0.03),
        bodyMaterial
      )
      hand.position.set(x, 0.64, 0)
      this.bodyParts[`${side}Hand`] = hand
      this.group.add(hand)
    }
    
    createArm('left')
    createArm('right')
    
    const createLeg = (side) => {
      const x = side === 'left' ? 0.1 : -0.1
      
      const hip = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 16, 16),
        bodyMaterial
      )
      hip.position.set(x, 0.75, 0)
      this.bodyParts[`${side}Hip`] = hip
      this.group.add(hip)
      
      const thigh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.07, 0.4, 16),
        bodyMaterial
      )
      thigh.position.set(x, 0.52, 0)
      thigh.name = `${side}Thigh`
      this.bodyParts[`${side}Thigh`] = thigh
      this.group.add(thigh)
      
      const knee = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 16, 16),
        bodyMaterial
      )
      knee.position.set(x, 0.3, 0)
      this.bodyParts[`${side}Knee`] = knee
      this.group.add(knee)
      
      const calf = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.05, 0.35, 16),
        bodyMaterial
      )
      calf.position.set(x, 0.1, 0)
      calf.name = `${side}Calf`
      this.bodyParts[`${side}Calf`] = calf
      this.group.add(calf)
      
      const ankle = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 16, 16),
        bodyMaterial
      )
      ankle.position.set(x, -0.1, 0)
      this.bodyParts[`${side}Ankle`] = ankle
      this.group.add(ankle)
      
      const foot = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.05, 0.15),
        bodyMaterial
      )
      foot.position.set(x, -0.15, 0.03)
      this.bodyParts[`${side}Foot`] = foot
      this.group.add(foot)
    }
    
    createLeg('left')
    createLeg('right')
    
    const spine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.65, 8),
      boneMaterial
    )
    spine.position.set(0, 1.1, -0.08)
    spine.rotation.x = 0.1
    this.group.add(spine)
  }
  
  createMuscleMeshes() {
    if (!this.muscleData) return
    
    const muscleGeometry = new THREE.BoxGeometry(1, 1, 1)
    
    for (const category in this.muscleData) {
      for (const muscleId in this.muscleData[category]) {
        const muscle = this.muscleData[category][muscleId]
        
        const material = new THREE.MeshPhongMaterial({
          color: 0x666666,
          transparent: true,
          opacity: 0.4,
          shininess: 50
        })
        
        const mesh = new THREE.Mesh(muscleGeometry, material)
        
        mesh.scale.set(
          muscle.size.width,
          muscle.size.height,
          muscle.size.depth
        )
        
        mesh.position.set(
          muscle.position.x,
          muscle.position.y,
          muscle.position.z
        )
        
        mesh.userData = {
          id: muscle.id,
          name: muscle.name,
          category: muscle.category,
          defaultColor: muscle.color,
          isPrimary: false,
          isSecondary: false
        }
        
        mesh.name = `muscle_${muscle.id}`
        this.muscleMeshes[muscle.id] = mesh
        this.group.add(mesh)
      }
    }
  }
  
  highlightMuscles(primaryIds, secondaryIds) {
    for (const muscleId in this.muscleMeshes) {
      const mesh = this.muscleMeshes[muscleId]
      mesh.userData.isPrimary = primaryIds.includes(muscleId)
      mesh.userData.isSecondary = secondaryIds.includes(muscleId)
      
      if (primaryIds.includes(muscleId)) {
        mesh.material.color.setStyle(mesh.userData.defaultColor)
        mesh.material.opacity = 0.9
        mesh.material.emissive = new THREE.Color(mesh.userData.defaultColor)
        mesh.material.emissiveIntensity = 0.3
      } else if (secondaryIds.includes(muscleId)) {
        const color = new THREE.Color(mesh.userData.defaultColor)
        color.multiplyScalar(0.7)
        mesh.material.color.copy(color)
        mesh.material.opacity = 0.6
        mesh.material.emissive = new THREE.Color(mesh.userData.defaultColor)
        mesh.material.emissiveIntensity = 0.15
      } else {
        mesh.material.color.setHex(0x666666)
        mesh.material.opacity = 0.3
        mesh.material.emissive = new THREE.Color(0x000000)
        mesh.material.emissiveIntensity = 0
      }
    }
  }
  
  clearHighlights() {
    for (const muscleId in this.muscleMeshes) {
      const mesh = this.muscleMeshes[muscleId]
      mesh.userData.isPrimary = false
      mesh.userData.isSecondary = false
      mesh.material.color.setHex(0x666666)
      mesh.material.opacity = 0.3
      mesh.material.emissive = new THREE.Color(0x000000)
      mesh.material.emissiveIntensity = 0
    }
  }
  
  setView(view) {
    let targetRotation = 0
    let cameraZ = 3
    
    switch (view) {
      case 'front':
        targetRotation = 0
        break
      case 'back':
        targetRotation = Math.PI
        break
      case 'left':
        targetRotation = Math.PI / 2
        break
      case 'right':
        targetRotation = -Math.PI / 2
        break
    }
    
    const startRotation = this.group.rotation.y
    const rotationDiff = targetRotation - startRotation
    
    if (Math.abs(rotationDiff) > 0.01) {
      this.animateRotation(targetRotation)
    }
  }
  
  animateRotation(targetRotation) {
    const startRotation = this.group.rotation.y
    const duration = 500
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      
      this.group.rotation.y = startRotation + (targetRotation - startRotation) * eased
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    animate()
  }
  
  getGroup() {
    return this.group
  }
  
  getMuscleMeshes() {
    return this.muscleMeshes
  }
}
