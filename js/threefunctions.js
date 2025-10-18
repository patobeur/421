export function init3D(THREE, CANNON, OrbitControls, container) {
	// SCENE
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x222235);

	// CAMERA
	const camera = new THREE.PerspectiveCamera(
		50,
		window.innerWidth / window.innerHeight,
		0.1,
		100
	);
	camera.position.set(6, 6, 6);
	camera.lookAt(0, 0, 0);

	// RENDERER
	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	// LIGHTS
	const light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(10, 10, 10);
	scene.add(light);
	scene.add(new THREE.AmbientLight(0xffffff, 0.6));

	// ORBIT CONTROLS
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 0, 0);
	controls.update();

	// CANNON WORLD
	const world = new CANNON.World({
		gravity: new CANNON.Vec3(0, -9.82, 0),
	});

	// SOL physique (Cannon)
	const groundBody = new CANNON.Body({
		type: CANNON.Body.STATIC,
		shape: new CANNON.Plane(),
		position: new CANNON.Vec3(0, 0, 0),
	});
	groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
	world.addBody(groundBody);

	// SOL visuel (Three)
	const groundGeometry = new THREE.PlaneGeometry(20, 20);
	const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x384c69, transparent: true, opacity: 0.5 });
	const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
	groundMesh.rotation.x = -Math.PI / 2;
	scene.add(groundMesh);

    // Murs invisibles
    const wallMaterial = new CANNON.Material('wallMaterial');
    const wallShape = new CANNON.Plane();
    const wallPositions = [
        { position: new CANNON.Vec3(0, 0, -10), quaternion: new CANNON.Vec3(0, 1, 0) }, // Back
        { position: new CANNON.Vec3(0, 0, 10), quaternion: new CANNON.Vec3(0, -1, 0) }, // Front
        { position: new CANNON.Vec3(-10, 0, 0), quaternion: new CANNON.Vec3(1, 0, 0) }, // Left
        { position: new CANNON.Vec3(10, 0, 0), quaternion: new CANNON.Vec3(-1, 0, 0) }  // Right
    ];

    wallPositions.forEach(config => {
        const wallBody = new CANNON.Body({ mass: 0, shape: wallShape, material: wallMaterial });
        wallBody.position.copy(config.position);
        wallBody.quaternion.setFromAxisAngle(config.quaternion, Math.PI / 2);
        world.addBody(wallBody);
    });

	// Responsive
	window.addEventListener("resize", () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	});

	return { scene, camera, renderer, world };
}

export function lancerDe(diceBody, index = 0) {
	diceBody.position.set((index - 1) * 2.5, 4 + Math.random() * 2, (index - 1) * (Math.random() - 0.5) * 2);
	diceBody.velocity.set(
		(Math.random() - 0.5) * 10,
		6 + Math.random() * 4,
		(Math.random() - 0.5) * 10
	);
	diceBody.angularVelocity.set(
		(Math.random() - 0.5) * 30,
		(Math.random() - 0.5) * 30,
		(Math.random() - 0.5) * 30
	);
	diceBody.quaternion.setFromEuler(
		Math.random() * Math.PI * 2,
		Math.random() * Math.PI * 2,
		Math.random() * Math.PI * 2
	);
}

export function updateGame(world) {
    world.step(1/60);
}