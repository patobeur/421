function createTextTexture(number, size = 256) {
	const canvas = document.createElement("canvas");
	canvas.width = canvas.height = size;
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, size, size);

	ctx.strokeStyle = "#FF0000";
	ctx.lineWidth = 8;
	ctx.strokeRect(0, 0, size, size);

	ctx.fillStyle = "#000";
	ctx.font = `bold ${size * 0.7}px Arial`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(number, size / 2, size / 2);

	return canvas;
}

export function createDice(THREE, CANNON, scene, world, index = 0) {
	const textures = [];
	for (let i = 1; i <= 6; i++) {
		const canvas = createTextTexture(i);
		const texture = new THREE.CanvasTexture(canvas);
		textures.push(new THREE.MeshStandardMaterial({ map: texture }));
	}

	const geometry = new THREE.BoxGeometry(1, 1, 1);
	const mesh = new THREE.Mesh(geometry, textures);
	mesh.isKept = false;

	const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
	const diceBody = new CANNON.Body({ mass: 1, shape });
	diceBody.position.set((index - 1) * 2, 5, 0);

	world.addBody(diceBody);
	scene.add(mesh);

	return { diceBody, diceMesh: mesh };
}

export function syncDiceMeshBody(mesh, body) {
	mesh.position.copy(body.position);
	mesh.quaternion.copy(body.quaternion);
}

export function isDiceStopped(diceBody) {
	const linear = diceBody.velocity.length();
	const angular = diceBody.angularVelocity.length();
	return linear < 0.05 && angular < 0.05 && diceBody.position.y < 1.1;
}

export function getTopFace(mesh, THREE) {
	const up = new THREE.Vector3(0, 1, 0);
	const directions = [
		new THREE.Vector3(0, 0, 1),
		new THREE.Vector3(0, 0, -1),
		new THREE.Vector3(0, 1, 0),
		new THREE.Vector3(0, -1, 0),
		new THREE.Vector3(1, 0, 0),
		new THREE.Vector3(-1, 0, 0),
	];
	let maxDot = -Infinity;
	let topFaceIndex = -1;
	for (let i = 0; i < directions.length; i++) {
		const dir = directions[i].clone().applyQuaternion(mesh.quaternion);
		const dot = dir.dot(up);
		if (dot > maxDot) {
			maxDot = dot;
			topFaceIndex = i;
		}
	}
	const faceValues = [5, 6, 3, 4, 1, 2];
	return faceValues[topFaceIndex];
}

export function toggleDiceKeep(diceMesh) {
    diceMesh.isKept = !diceMesh.isKept;
    diceMesh.material.forEach(material => {
        material.color.set(diceMesh.isKept ? 0x98FB98 : 0xffffff);
    });
}