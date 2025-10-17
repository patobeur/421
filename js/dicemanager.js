// Création du dé D6 texturé/couleur
//

// Synchroniser le mesh Three.js avec le body Cannon-es
export function syncDiceMeshBody(mesh, body) {
	mesh.position.copy(body.position);
	mesh.quaternion.copy(body.quaternion);
}

// Déterminer si le dé est arrêté
export function isDiceStopped(diceBody) {
	const linear = diceBody.velocity.length();
	const angular = diceBody.angularVelocity.length();
	return linear < 0.05 && angular < 0.05 && diceBody.position.y < 1.1;
}

// Trouver la face supérieure grâce au quaternion du mesh
// getTopFace(mesh, THREE)
export function getTopFace(mesh, THREE) {
	const up = new THREE.Vector3(0, 1, 0);
	const directions = [
		new THREE.Vector3(0, 0, 1), // 0 : +Z
		new THREE.Vector3(0, 0, -1), // 1 : -Z
		new THREE.Vector3(0, 1, 0), // 2 : +Y (haut)
		new THREE.Vector3(0, -1, 0), // 3 : -Y (bas)
		new THREE.Vector3(1, 0, 0), // 4 : +X
		new THREE.Vector3(-1, 0, 0), // 5 : -X
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
	// Ici, corrige ce tableau pour que l'index (0...5) donne le BON numéro affiché sur la face
	// Par défaut tu avais :
	// const faceValues = [1, 2, 3, 4, 5, 6];
	// MAIS selon l'ordre où tu mets tes textures dans le Mesh, ce n'est peut-être pas ça !
	// Exemple :
	// textures = [face1, face2, face3, face4, face5, face6]
	// si la face3 (i=2) est réellement le 6, il faut corriger.
	// Vérifie le sens de pose de ton dé !
	const faceValues = [5, 6, 3, 4, 1, 2];

	// Adapte ce tableau en regardant ce qui sort en haut lors de tes tests.
	// Tu peux faire un test simple :
	// Place le dé à la main : diceBody.quaternion.setFromEuler(0,0,0);
	// et regarde quelle face est sur le dessus dans la 3D et quelle valeur le code donne.
	return faceValues[topFaceIndex];
}

// export function getTopFace(mesh, THREE) {
// 	// Repères locaux des faces du cube
// 	// FaceIndex: 0:+Z, 1:-Z, 2:+Y, 3:-Y, 4:+X, 5:-X
// 	const up = new THREE.Vector3(0, 1, 0);
// 	const directions = [
// 		new THREE.Vector3(0, 0, 1), // +Z
// 		new THREE.Vector3(0, 0, -1), // -Z
// 		new THREE.Vector3(0, 1, 0), // +Y
// 		new THREE.Vector3(0, -1, 0), // -Y
// 		new THREE.Vector3(1, 0, 0), // +X
// 		new THREE.Vector3(-1, 0, 0), // -X
// 	];
// 	let maxDot = -Infinity;
// 	let topFace = -1;
// 	for (let i = 0; i < directions.length; i++) {
// 		const dir = directions[i].clone().applyQuaternion(mesh.quaternion);
// 		const dot = dir.dot(up);
// 		if (dot > maxDot) {
// 			maxDot = dot;
// 			topFace = i;
// 		}
// 	}
// 	// Correspondance faceIndex -> numéro affiché sur le dé :
// 	// 2:+Y=face 3, 3:-Y=face 4, 4:+X=5, 5:-X=6, 0:+Z=1, 1:-Z=2
// 	const faceValues = [1, 2, 3, 4, 5, 6];
// 	return faceValues[topFace];
// }
// Génère une texture avec un numéro pour chaque face
function createTextTexture(number, size = 256) {
	const canvas = document.createElement("canvas");
	canvas.width = canvas.height = size;
	const ctx = canvas.getContext("2d");

	// fond blanc
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, size, size);

	// bord noir
	ctx.strokeStyle = "#FF0000";
	ctx.lineWidth = 8;
	ctx.strokeRect(0, 0, size, size);

	// texte noir, centré
	ctx.fillStyle = "#000";
	ctx.font = `bold ${size * 0.7}px Arial`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(number, size / 2, size / 2);

	return canvas;
}

export function createDice(THREE, CANNON, scene, world, posY = 0) {
	// Création des textures pour chaque face
	const textures = [];
	for (let i = 1; i <= 6; i++) {
		const canvas = createTextTexture(i);
		const texture = new THREE.CanvasTexture(canvas);
		textures.push(new THREE.MeshStandardMaterial({ map: texture }));
	}

	const geometry = new THREE.BoxGeometry(1, 1, 1);
	const mesh = new THREE.Mesh(geometry, textures);
	mesh.isKept = false; // Initial state

	// Physique
	const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
	const diceBody = new CANNON.Body({ mass: 1, shape });
	diceBody.position.set(0, 5 + posY * 8, 0);
	// diceBody.angularDamping = 0.2;
	// diceBody.linearDamping = 0.1;

	world.addBody(diceBody);
	scene.add(mesh);

	return { diceBody, diceMesh: mesh };
}

export function toggleDiceKeep(diceMesh) {
    diceMesh.isKept = !diceMesh.isKept;
    // We need to access the material array to change colors for each face
    diceMesh.material.forEach(material => {
        material.color.set(diceMesh.isKept ? 0x98FB98 : 0xffffff); // LightGreen for kept
    });
}
