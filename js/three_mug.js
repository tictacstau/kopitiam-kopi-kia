/**
 * Kopitiam Kopi Kia - Real-Time 3D WebGL Glass Mug Engine (Three.js)
 * Provides 3D volumetric glass mug rendering, liquid sloshing physics, 3D ice cubes & steam!
 */

class ThreeMugRenderer {
  constructor() {
    this.container = document.getElementById('three-canvas-container');
    this.enabled = true;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // 3D Meshes
    this.mugGroup = null;
    this.glassMesh = null;
    this.milkMesh = null;
    this.brewMesh = null;
    this.waterMesh = null;
    this.iceCubes = [];
    this.steamParticles = null;

    // Animation & Wave Physics
    this.time = 0;
    this.targetMilkHeight = 0;
    this.targetBrewHeight = 0;
    this.targetWaterHeight = 0;
    this.currentMilkHeight = 0;
    this.currentBrewHeight = 0;
    this.currentWaterHeight = 0;

    // Interactive Touch Rotation
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.targetRotationY = 0;
    this.targetRotationX = 0;

    if (this.container && window.THREE) {
      this.initThree();
    }
  }

  initThree() {
    const width = this.container.clientWidth || 150;
    const height = this.container.clientHeight || 180;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0.5, 4.2);

    // 2. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    // 3. Kopitiam Lighting
    const ambientLight = new THREE.AmbientLight(0xfffbeb, 0.9);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(2, 4, 3);
    this.scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xf59e0b, 0.8, 10);
    pointLight.position.set(-2, 1, 2);
    this.scene.add(pointLight);

    // 4. Create 3D Mug Group
    this.mugGroup = new THREE.Group();
    this.scene.add(this.mugGroup);

    this.createGlassMug();
    this.createLiquidLayers();
    this.create3DIceCubes();
    this.create3DSteam();

    this.bindTouchControls();
    this.animate();
  }

  createGlassMug() {
    // 3D Glass Body
    const glassGeo = new THREE.CylinderGeometry(0.85, 0.75, 1.8, 32, 1, true);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1,
      ior: 1.5,
      thickness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });

    this.glassMesh = new THREE.Mesh(glassGeo, glassMat);
    this.mugGroup.add(this.glassMesh);

    // Glass Base Bottom
    const baseGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.15, 32);
    const baseMesh = new THREE.Mesh(baseGeo, glassMat);
    baseMesh.position.y = -0.9;
    this.mugGroup.add(baseMesh);

    // 3D Mug Handle
    const handleGeo = new THREE.TorusGeometry(0.55, 0.1, 16, 32, Math.PI * 0.95);
    const handleMesh = new THREE.Mesh(handleGeo, glassMat);
    handleMesh.position.set(0.85, 0, 0);
    handleMesh.rotation.z = -Math.PI / 2;
    this.mugGroup.add(handleMesh);
  }

  createLiquidLayers() {
    const liquidMatConfig = { roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0.92 };

    // Milk Mesh Layer
    const milkGeo = new THREE.CylinderGeometry(0.74, 0.74, 1, 32);
    const milkMat = new THREE.MeshStandardMaterial(Object.assign({ color: 0xfef3c7 }, liquidMatConfig));
    this.milkMesh = new THREE.Mesh(milkGeo, milkMat);
    this.milkMesh.position.y = -0.8;
    this.milkMesh.scale.set(1, 0.001, 1);
    this.mugGroup.add(this.milkMesh);

    // Brew Mesh Layer (Coffee / Tea)
    const brewGeo = new THREE.CylinderGeometry(0.76, 0.74, 1, 32);
    const brewMat = new THREE.MeshStandardMaterial(Object.assign({ color: 0x451a03 }, liquidMatConfig));
    this.brewMesh = new THREE.Mesh(brewGeo, brewMat);
    this.brewMesh.position.y = -0.8;
    this.brewMesh.scale.set(1, 0.001, 1);
    this.mugGroup.add(this.brewMesh);

    // Water Mesh Layer
    const waterGeo = new THREE.CylinderGeometry(0.78, 0.76, 1, 32);
    const waterMat = new THREE.MeshStandardMaterial(Object.assign({ color: 0x93c5fd, opacity: 0.65 }, liquidMatConfig));
    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.position.y = -0.8;
    this.waterMesh.scale.set(1, 0.001, 1);
    this.mugGroup.add(this.waterMesh);
  }

  create3DIceCubes() {
    const iceGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
    const iceMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transmission: 0.8,
      opacity: 0.85,
      transparent: true,
      roughness: 0.1
    });

    for (let i = 0; i < 3; i++) {
      const ice = new THREE.Mesh(iceGeo, iceMat);
      ice.position.set((i - 1) * 0.3, 0.3, (Math.random() - 0.5) * 0.3);
      ice.rotation.set(Math.random(), Math.random(), Math.random());
      ice.visible = false;
      this.mugGroup.add(ice);
      this.iceCubes.push(ice);
    }
  }

  create3DSteam() {
    const particleCount = 25;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 0.6;
      positions[i + 1] = 0.9 + Math.random() * 0.8;
      positions[i + 2] = (Math.random() - 0.5) * 0.6;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.4
    });

    this.steamParticles = new THREE.Points(particles, pMaterial);
    this.steamParticles.visible = false;
    this.mugGroup.add(this.steamParticles);
  }

  updateMugState(mugState) {
    if (!this.mugGroup) return;

    if (!mugState.isEquipped) {
      this.targetMilkHeight = 0;
      this.targetBrewHeight = 0;
      this.targetWaterHeight = 0;
      this.iceCubes.forEach(ice => ice.visible = false);
      if (this.steamParticles) this.steamParticles.visible = false;
      return;
    }

    // Set Milk Height & Color
    if (mugState.milk === 'condensed') {
      this.targetMilkHeight = 0.35;
      this.milkMesh.material.color.setHex(0xfef3c7);
    } else if (mugState.milk === 'evaporated') {
      this.targetMilkHeight = 0.35;
      this.milkMesh.material.color.setHex(0xfffffff);
    } else {
      this.targetMilkHeight = 0;
    }

    // Set Brew Height & Color
    if (mugState.type === 'brew') {
      if (mugState.kopiCount > 0 && mugState.tehCount > 0) {
        this.targetBrewHeight = 0.75;
        this.brewMesh.material.color.setHex(0x7c2d12);
      } else if (mugState.kopiCount > 0) {
        this.targetBrewHeight = 0.65;
        this.brewMesh.material.color.setHex(0x451a03);
      } else if (mugState.tehCount > 0) {
        this.targetBrewHeight = 0.65;
        this.brewMesh.material.color.setHex(0x9a3412);
      } else {
        this.targetBrewHeight = 0;
      }
    } else if (mugState.type === 'can') {
      this.targetBrewHeight = 1.1;
      if (mugState.canBrand === 'coke') this.brewMesh.material.color.setHex(0x180903);
      else if (mugState.canBrand === 'sprite') this.brewMesh.material.color.setHex(0xd1fae5);
      else if (mugState.canBrand === 'hundred_plus') this.brewMesh.material.color.setHex(0xbae6fd);
    } else if (mugState.type === 'dispenser') {
      this.targetBrewHeight = 1.1;
      if (mugState.dispenserFlavor === 'bandung') this.brewMesh.material.color.setHex(0xf472b6);
      else if (mugState.dispenserFlavor === 'lime_juice') this.brewMesh.material.color.setHex(0xa3e635);
    }

    // Water Height
    if (mugState.hasWater) {
      this.targetWaterHeight = 0.45;
    } else {
      this.targetWaterHeight = 0;
    }

    // Ice Cubes
    if (mugState.hasIce) {
      this.iceCubes.forEach(ice => ice.visible = true);
      if (this.steamParticles) this.steamParticles.visible = false;
    } else {
      this.iceCubes.forEach(ice => ice.visible = false);
      if (mugState.hasWater && this.steamParticles) {
        this.steamParticles.visible = true;
      }
    }
  }

  bindTouchControls() {
    const el = this.container;

    const startDrag = (x, y) => {
      this.isDragging = true;
      this.previousMousePosition = { x, y };
    };

    const moveDrag = (x, y) => {
      if (!this.isDragging || !this.mugGroup) return;

      const deltaX = x - this.previousMousePosition.x;
      const deltaY = y - this.previousMousePosition.y;

      this.targetRotationY += deltaX * 0.015;
      this.targetRotationX += deltaY * 0.015;

      this.targetRotationX = Math.max(-0.4, Math.min(0.4, this.targetRotationX));
      this.previousMousePosition = { x, y };
    };

    const stopDrag = () => { this.isDragging = false; };

    el.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
    window.addEventListener('mouseup', stopDrag);

    el.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) startDrag(e.touches[0].clientX, e.touches[0].clientY);
    });
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    });
    window.addEventListener('touchend', stopDrag);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.time += 0.03;

    if (!this.mugGroup || !this.renderer) return;

    // Smooth Touch Rotation Interpolation
    this.mugGroup.rotation.y += (this.targetRotationY - this.mugGroup.rotation.y) * 0.1;
    this.mugGroup.rotation.x += (this.targetRotationX - this.mugGroup.rotation.x) * 0.1;

    // Smooth Liquid Height Interpolation
    this.currentMilkHeight += (this.targetMilkHeight - this.currentMilkHeight) * 0.1;
    this.currentBrewHeight += (this.targetBrewHeight - this.currentBrewHeight) * 0.1;
    this.currentWaterHeight += (this.targetWaterHeight - this.currentWaterHeight) * 0.1;

    if (this.milkMesh) {
      this.milkMesh.scale.y = Math.max(0.001, this.currentMilkHeight);
      this.milkMesh.position.y = -0.9 + (this.currentMilkHeight / 2);
    }

    if (this.brewMesh) {
      this.brewMesh.scale.y = Math.max(0.001, this.currentBrewHeight);
      this.brewMesh.position.y = -0.9 + this.currentMilkHeight + (this.currentBrewHeight / 2);
    }

    if (this.waterMesh) {
      this.waterMesh.scale.y = Math.max(0.001, this.currentWaterHeight);
      this.waterMesh.position.y = -0.9 + this.currentMilkHeight + this.currentBrewHeight + (this.currentWaterHeight / 2);
    }

    // 3D Ice Cubes Buoyancy Wave Wobble
    this.iceCubes.forEach((ice, idx) => {
      if (ice.visible) {
        const topY = -0.8 + this.currentMilkHeight + this.currentBrewHeight + this.currentWaterHeight;
        ice.position.y = Math.min(0.6, topY + Math.sin(this.time * 2 + idx) * 0.04);
        ice.rotation.y += 0.01;
      }
    });

    // 3D Steam Particles Rise
    if (this.steamParticles && this.steamParticles.visible) {
      const positions = this.steamParticles.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.015;
        if (positions[i] > 1.8) positions[i] = 0.9;
      }
      this.steamParticles.geometry.attributes.position.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.threeMugRenderer = new ThreeMugRenderer();
});
