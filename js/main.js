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
let isTurnOver = true; // Le jeu commence avec un tour "terminé" pour forcer le premier lancer
let awaitingNextTurn = false;

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
    UI.validateButton.addEventListener('click', endTurn);
	//lancer(); // On ne lance plus automatiquement
	animate();
}

function endTurn() {
    UI.validateButton.style.display = 'none';
    isTurnOver = true;
    awaitingNextTurn = true;

    // Afficher le message de score final
    const tops = diceList.map((dice) => getTopFace(dice.diceMesh, THREE));
    const combination = getCombination(tops);
    UI.finalScoreMessage.textContent = `Score : ${combination.score} points\nFigure : ${combination.name}`;
    UI.finalScoreMessage.style.display = 'block';
}

function lancer() {
    if (awaitingNextTurn) {
        // C'est un nouveau tour
        lancerCount = 0;
        diceList.forEach((dice) => {
            dice.locked = false;
            dice.diceMesh.material.forEach((material) => {
                material.emissive.setHex(0x000000);
            });
        });
        isTurnOver = false;
        awaitingNextTurn = false;
        UI.finalScoreMessage.style.display = 'none';
    }

    UI.validateButton.style.display = 'none';

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

        if (lancerCount === 3) {
            endTurn();
        } else if (!isTurnOver) {
            UI.validateButton.style.display = 'block';
        }
	}
}

function handleUserAction() {
    if (awaitingNextTurn && !rolling) {
        lancer();
    } else if (!rolling) {
        lancer();
    }
}

window.addEventListener("keydown", (e) => {
	if (e.code === "Space") {
		handleUserAction();
	}
});

window.addEventListener("mousedown", (event) => {
    // Si le tour est terminé, un clic n'importe où lance un nouveau tour
    if (awaitingNextTurn) {
        handleUserAction();
        return;
    }

    // Si le tour est en cours, on tente de locker un dé
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
            toggleLock(dice);
        }
    }
});

function toggleLock(dice) {
    if (lancerCount === 0 || isTurnOver) return;

    const lockedCount = diceList.filter((d) => d.locked).length;
    if (!dice.locked && lockedCount >= 2) return;

    dice.locked = !dice.locked;

    dice.diceMesh.material.forEach((material) => {
        material.emissive.setHex(dice.locked ? 0x555555 : 0x000000);
    });
    }
}

window.addEventListener("DOMContentLoaded", setup);
