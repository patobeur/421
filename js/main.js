import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js";

import { init3D } from "./three_functions.js";
import { lancerDe, updateGame } from "./game_functions.js";
import { UI } from "./ui_functions.js";
import { pseudoMaker } from "./pseudoMaker_functions.js";
import {
	createDice,
	syncDiceMeshBody,
	isDiceStopped,
	getTopFace,
} from "./dice_functions.js";
import { getCombination } from "./rules_421.js";

let diceList = []; // <--- Tableau de tous les dés
let world, renderer, camera, scene, diceMaterial;
let rolling = false;
let lancerCount = 0;

function setup() {
	({ scene, camera, renderer, world, diceMaterial } = init3D(
		THREE,
		CANNON,
		OrbitControls
	));

	// On crée 3 dés, espacés sur l’axe X
	for (let i = 0; i < 3; i++) {
		let x = -1 + i * 3; // -1, 0, +1 pour bien les voir
		let { diceBody, diceMesh } = createDice(
			THREE,
			CANNON,
			scene,
			world,
			diceMaterial,
			i
		);
		diceList.push({ diceBody, diceMesh, locked: false });
	}
	console.log(pseudoMaker(5));
	UI.init();
	lancer();
	animate();
}

function lancer() {
	// Si le tour est terminé (3 lancers), on le réinitialise avant de commencer le nouveau tour
	if (lancerCount >= 3) {
		lancerCount = 0;
		diceList.forEach((dice) => {
			dice.locked = false;
			// On remet la couleur normale
			dice.diceMesh.material.forEach((material) => {
				material.emissive.setHex(0x000000);
			});
		});
	}

	lancerCount++;
	rolling = true;
	UI.resultats_des.textContent = "";
	diceList.forEach((dice, i) => {
		// On ne lance que les dés qui ne sont pas "locked"
		if (!dice.locked) {
			lancerDe(dice.diceBody, -1 + i * 1.1); // Chaque dé lancé, positionné en X différent
		}
	});
}

function animate() {
	requestAnimationFrame(animate);
	updateGame(
		world,
		diceList.map((d) => d.diceBody)
	);
	diceList.forEach((dice) => syncDiceMeshBody(dice.diceMesh, dice.diceBody));
	renderer.render(scene, camera);

	// Affichage de toutes les valeurs quand tous les dés sont stables
	if (rolling && diceList.every((dice) => isDiceStopped(dice.diceBody))) {
		rolling = false;
		const tops = diceList.map((dice) => getTopFace(dice.diceMesh, THREE));
		const combination = getCombination(tops);
		UI.resultats_des.textContent = `${combination.name} (${combination.score} points)`;
		console.log("tops :", tops, "combination :", combination);
	}
}

window.addEventListener("keydown", (e) => {
	if (e.code === "Space" && !rolling) {
		lancer();
	}
});

window.addEventListener("mousedown", onDiceClick, false);

function onDiceClick(event) {
	const mouse = new THREE.Vector2();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	const raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(mouse, camera);

	const intersects = raycaster.intersectObjects(scene.children, true);

	if (intersects.length > 0) {
		const clickedObject = intersects[0].object;
		const dice = diceList.find((d) => d.diceMesh === clickedObject);

		if (dice) {
			// On ne peut pas locker les dés au premier lancer
			if (lancerCount === 1) return;

			const lockedCount = diceList.filter((d) => d.locked).length;

			// Si le dé n'est pas déjà locké et qu'on a déjà 2 dés lockés, on ne fait rien
			if (!dice.locked && lockedCount >= 2) return;

			// Inverser l'état de lock
			dice.locked = !dice.locked;

			// Changer l'apparence du dé
			if (dice.locked) {
				dice.diceMesh.material.forEach((material) => {
					material.emissive.setHex(0x555555);
				});
			} else {
				dice.diceMesh.material.forEach((material) => {
					material.emissive.setHex(0x000000);
				});
			}
		}
	}
}

window.addEventListener("DOMContentLoaded", setup);
