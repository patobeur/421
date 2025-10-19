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
		diceList.push({ diceBody, diceMesh });
	}
	console.log(pseudoMaker(5));
	UI.init();
	lancer();
	animate();
}

function lancer() {
	rolling = true;
	UI.resultats_des.textContent = "";
	diceList.forEach((dice, i) => {
		lancerDe(dice.diceBody, -1 + i * 1.1); // Chaque dé lancé, positionné en X différent
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

window.addEventListener("DOMContentLoaded", setup);
