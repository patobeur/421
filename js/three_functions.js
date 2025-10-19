export function init3D(THREE, CANNON, OrbitControls) {
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
	camera.position.set(1, 20, 10);
	camera.lookAt(0, 0, 0);

	// RENDERER
	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	// LIGHTS
	const light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(10, 10, 10);
	scene.add(light);
	scene.add(new THREE.AmbientLight(0xffffff, 0.6));

	// ORBIT CONTROLS
	const controls = new OrbitControls(camera, renderer.domElement);
	// controls.target.set(0, 0, 0);
	controls.update();

	// CANNON WORLD
	const world = new CANNON.World({
		gravity: new CANNON.Vec3(0, -9.82, 0),
	});

	// MATERIALS
	const groundMaterial = new CANNON.Material("groundMaterial");
	const diceMaterial = new CANNON.Material("diceMaterial");
	const contactMaterial = new CANNON.ContactMaterial(
		groundMaterial,
		diceMaterial,
		{
			friction: 0.05,
			restitution: 0.2,
		}
	);
	world.addContactMaterial(contactMaterial);
	const diceDiceContactMaterial = new CANNON.ContactMaterial(
		diceMaterial,
		diceMaterial,
		{
			friction: 0.05,
			restitution: 0.2,
		}
	);
	world.addContactMaterial(diceDiceContactMaterial);

	// SOL physique (Cannon)
	const groundBody = new CANNON.Body({
		type: CANNON.Body.STATIC,
		shape: new CANNON.Plane(),
		position: new CANNON.Vec3(0, 0, 0),
		material: groundMaterial,
	});
	groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
	world.addBody(groundBody);

	// SOL visuel (Three)
	const groundGeometry = new THREE.PlaneGeometry(20, 20);
	const groundMeshMaterial = new THREE.MeshStandardMaterial({
		color: 0x384c69,
	});
	const groundMesh = new THREE.Mesh(groundGeometry, groundMeshMaterial);
	groundMesh.rotation.x = -Math.PI / 2;
	scene.add(groundMesh);

	// Murs physique (Three)
	const wallGeometry = new THREE.PlaneGeometry(20, 20);
	const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
	const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
	wallMesh.position.set(0, 5, -5);
	scene.add(wallMesh);
	const wallMesh2 = new THREE.Mesh(wallGeometry, wallMaterial);
	wallMesh2.position.set(-5, 5, 0);
	wallMesh2.rotation.y = Math.PI / 2;
	scene.add(wallMesh2);

	const wallShape = new CANNON.Box(new CANNON.Vec3(5, 5, 0.1));
	const wallBody = new CANNON.Body({
		type: CANNON.Body.STATIC,
		shape: wallShape,
		position: new CANNON.Vec3(0, 5, -5),
		material: groundMaterial,
	});
	world.addBody(wallBody);

	const wallBody2 = new CANNON.Body({
		type: CANNON.Body.STATIC,
		shape: wallShape,
		position: new CANNON.Vec3(-5, 5, 0),
		material: groundMaterial,
	});
	wallBody2.quaternion.setFromEuler(0, Math.PI / 2, 0);
	world.addBody(wallBody2);

	// Responsive
	window.addEventListener("resize", () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	});

	return { scene, camera, renderer, world, diceMaterial };
}

export function getRenderer() {
	return renderer;
}
export function getCamera() {
	return camera;
}
export function getScene() {
	return scene;
}
