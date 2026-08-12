(function () {
  const THREE = window.THREE;
  const stateApi = window.agritwin || {};
  const { farmState, clamp } = stateApi;

  if (!THREE) {
    console.error('Three.js failed to load.');
    return;
  }

  const sceneState = {
    root: null,
    renderer: null,
    scene: null,
    camera: null,
    plants: [],
    soilGroup: null,
    waterLevel: null,
    orbit: {
      radius: 16,
      yaw: 0.7,
      pitch: 0.9,
      target: new THREE.Vector3(0, 1.5, 0),
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      lastX: 0,
      lastY: 0,
      panX: 0,
      panY: 0,
    },
  };

  function syncCamera() {
    const { camera, orbit } = sceneState;
    if (!camera) return;

    const offset = new THREE.Vector3(
      orbit.radius * Math.cos(orbit.pitch) * Math.sin(orbit.yaw),
      orbit.radius * Math.sin(orbit.pitch),
      orbit.radius * Math.cos(orbit.pitch) * Math.cos(orbit.yaw)
    );

    camera.position.copy(orbit.target).add(offset);
    camera.lookAt(orbit.target);
  }

  function setupDigitalTwin(containerId = 'digital-twin-canvas') {
    const mount = document.getElementById(containerId);
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdfeef7);
    scene.fog = new THREE.Fog(0xdfeef7, 18, 42);

    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 150);
    sceneState.camera = camera;
    syncCamera();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.touchAction = 'none';
    mount.appendChild(renderer.domElement);
    sceneState.renderer = renderer;
    sceneState.scene = scene;
    sceneState.root = mount;

    const ambient = new THREE.AmbientLight(0xf4f0dd, 1.1);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff0d6, 1.4);
    sun.position.set(10, 15, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left = -18;
    sun.shadow.camera.right = 18;
    sun.shadow.camera.top = 18;
    sun.shadow.camera.bottom = -18;
    scene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 20),
      new THREE.MeshStandardMaterial({ color: 0x9fc172, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const soilBed = new THREE.Mesh(
      new THREE.BoxGeometry(20, 1.2, 10),
      new THREE.MeshStandardMaterial({ color: 0xbc8c57, roughness: 1 })
    );
    soilBed.position.y = -0.6;
    soilBed.receiveShadow = true;
    scene.add(soilBed);
    sceneState.soilGroup = soilBed;

    const farmBoundary = new THREE.Group();
    const boundaryMaterial = new THREE.MeshStandardMaterial({ color: 0x7b9b4a, roughness: 1 });
    const boundaryLines = [
      { width: 20, height: 0.12, depth: 0.2, x: 0, y: 0.25, z: -5 },
      { width: 20, height: 0.12, depth: 0.2, x: 0, y: 0.25, z: 5 },
      { width: 0.2, height: 0.12, depth: 10, x: -10, y: 0.25, z: 0 },
      { width: 0.2, height: 0.12, depth: 10, x: 10, y: 0.25, z: 0 },
    ];

    boundaryLines.forEach((line) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(line.width, line.height, line.depth), boundaryMaterial);
      mesh.position.set(line.x, line.y, line.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      farmBoundary.add(mesh);
    });
    scene.add(farmBoundary);

    const irrigationPipeGeo = new THREE.CylinderGeometry(0.12, 0.12, 12, 18);
    const irrigationPipeMaterial = new THREE.MeshStandardMaterial({ color: 0x7d8f96, metalness: 0.2, roughness: 0.8 });
    const pipe1 = new THREE.Mesh(irrigationPipeGeo, irrigationPipeMaterial);
    pipe1.rotation.z = Math.PI / 2;
    pipe1.position.set(0, 0.7, -1.6);
    scene.add(pipe1);

    const pipe2 = pipe1.clone();
    pipe2.position.set(0, 0.9, 1.5);
    scene.add(pipe2);

    const tankGroup = new THREE.Group();
    const tankBody = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.6, 3.2, 32),
      new THREE.MeshStandardMaterial({ color: 0xe5e7ea, roughness: 0.8, metalness: 0.2 })
    );
    tankBody.position.set(-7.5, 1.5, 4.2);
    tankBody.castShadow = true;
    tankGroup.add(tankBody);

    const tankWater = new THREE.Mesh(
      new THREE.CylinderGeometry(1.38, 1.38, 2.1, 32),
      new THREE.MeshStandardMaterial({ color: 0x55a9d9, transparent: true, opacity: 0.9 })
    );
    tankWater.position.set(-7.5, 1.25, 4.2);
    tankGroup.add(tankWater);
    sceneState.waterLevel = tankWater;
    scene.add(tankGroup);

    const sensorMaterial = new THREE.MeshStandardMaterial({ color: 0x7f7f5d, emissive: 0x1d251c, emissiveIntensity: 0.08 });
    for (let i = 0; i < 4; i += 1) {
      const sensor = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.5, 0.22), sensorMaterial);
      sensor.position.set(-4 + i * 2.5, 0.7, 2.6);
      scene.add(sensor);
    }

    const plantGroup = new THREE.Group();
    scene.add(plantGroup);

    const makePlant = (x, z) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.18, 1.4, 10),
        new THREE.MeshStandardMaterial({ color: 0x3e7c34 })
      );
      stem.position.y = 0.7;
      stem.castShadow = true;
      group.add(stem);

      for (let i = 0; i < 4; i += 1) {
        const leaf = new THREE.Mesh(
          new THREE.SphereGeometry(0.36, 12, 10),
          new THREE.MeshStandardMaterial({ color: 0x4ea657 })
        );
        leaf.scale.set(1.6, 0.7, 1);
        leaf.position.set(Math.cos(i * 1.5) * 0.32, 1.2 + i * 0.08, Math.sin(i * 1.5) * 0.32);
        leaf.rotation.z = i % 2 === 0 ? -0.7 : 0.7;
        group.add(leaf);
      }

      for (let i = 0; i < 3; i += 1) {
        const tomato = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 16, 16),
          new THREE.MeshStandardMaterial({ color: 0xb6482f })
        );
        tomato.position.set(i * 0.18 - 0.2, 1.25 + i * 0.08, 0.2 + (i % 2) * 0.14);
        tomato.castShadow = true;
        group.add(tomato);
      }

      group.rotation.y = (Math.random() - 0.5) * 0.8;
      plantGroup.add(group);
      sceneState.plants.push(group);
    };

    const rows = [-6, -3.2, -0.4, 2.4, 5.2];
    rows.forEach((rowZ, index) => {
      for (let x = -8; x <= 8; x += 1.6) {
        makePlant(x, rowZ + (index % 2) * 0.15);
      }
    });

    function handlePointerMove(event) {
      const dx = event.clientX - sceneState.orbit.lastX;
      const dy = event.clientY - sceneState.orbit.lastY;
      sceneState.orbit.lastX = event.clientX;
      sceneState.orbit.lastY = event.clientY;

      if (event.buttons === 2 || event.button === 2) {
        sceneState.orbit.target.x -= dx * 0.01;
        sceneState.orbit.target.z -= dy * 0.01;
      } else if (sceneState.orbit.isDragging) {
        sceneState.orbit.yaw -= dx * 0.008;
        sceneState.orbit.pitch -= dy * 0.006;
        sceneState.orbit.pitch = Math.max(-1.1, Math.min(1.1, sceneState.orbit.pitch));
      }
      syncCamera();
    }

    function handleWheel(event) {
      event.preventDefault();
      sceneState.orbit.radius += event.deltaY * 0.01;
      sceneState.orbit.radius = Math.min(28, Math.max(8, sceneState.orbit.radius));
      syncCamera();
    }

    renderer.domElement.addEventListener('pointerdown', (event) => {
      sceneState.orbit.isDragging = true;
      sceneState.orbit.lastX = event.clientX;
      sceneState.orbit.lastY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    });

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerup', () => {
      sceneState.orbit.isDragging = false;
    });
    renderer.domElement.addEventListener('pointerleave', () => {
      sceneState.orbit.isDragging = false;
    });
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    const button = document.getElementById('reset-view-btn');
    button?.addEventListener('click', () => {
      sceneState.orbit.radius = 16;
      sceneState.orbit.yaw = 0.7;
      sceneState.orbit.pitch = 0.9;
      sceneState.orbit.target.set(0, 1.5, 0);
      syncCamera();
    });

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      updateFarmVisualState();
    }

    animate();

    const resize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener('resize', resize);
    return { scene, camera, renderer, resize };
  }

  function updateFarmVisualState() {
    const { plants, waterLevel } = sceneState;
    if (!plants || plants.length === 0) return;

    const health = clamp(farmState.crop.health, 0, 100);
    const moisture = clamp(farmState.soil.moisture, 0, 100);
    const waterAmount = clamp(farmState.water.available, 0, 1000);

    plants.forEach((plant, index) => {
      const leanAmount = (health - 50) / 100;
      plant.rotation.z = -leanAmount * 0.9 + ((index % 2) - 0.5) * 0.06;
      plant.position.y = 0;

      let leafColor = 0x4ea657;
      let tomatoColor = 0xb6482f;
      if (health < 80) leafColor = 0xb7b953;
      if (health < 50) leafColor = 0xb88d4b;
      if (health < 25) leafColor = 0x8e5740;

      if (health < 50) {
        plant.rotation.x = 0.22;
      } else {
        plant.rotation.x = 0.05;
      }

      plant.traverse((obj) => {
        if (obj.isMesh && obj.geometry.type === 'SphereGeometry') {
          if (obj.material && obj.material.color) {
            obj.material.color.setHex(tomatoColor);
          }
        }
        if (obj.isMesh && obj.geometry.type === 'CylinderGeometry' && obj.position.y > 0.5) {
          obj.material.color.setHex(leafColor);
        }
      });
    });

    const soilColor = moisture > 45 ? 0xbe985c : moisture > 25 ? 0xc69b62 : 0x8d6845;
    if (sceneState.soilGroup) {
      sceneState.soilGroup.material.color.setHex(soilColor);
    }

    if (waterLevel) {
      const scale = 0.46 + (waterAmount / 1000) * 0.6;
      waterLevel.scale.y = clamp(scale, 0.38, 1);
      waterLevel.position.y = 1.2 + (waterLevel.scale.y - 0.38) * 0.7;
    }
  }

  window.agritwin = window.agritwin || {};
  window.agritwin.setupDigitalTwin = setupDigitalTwin;
  window.agritwin.updateFarmVisualState = updateFarmVisualState;
  window.agritwin.digitalTwinScene = sceneState;
})();
