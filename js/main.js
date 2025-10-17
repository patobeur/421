import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js";

import { init3D } from "./threefunctions.js";
import { lancerDe, updateGame } from "./gamefunctions.js";
import {
	createDice,
	syncDiceMeshBody,
	isDiceStopped,
	getTopFace,
} from "./dicemanager.js";

let diceList = [];
let world, renderer, camera, scene;
let rolling = false;
const diceContainer = document.getElementById("dice-container");

eventBus.subscribe('rollDice', () => lancer());
eventBus.subscribe('toggleDiceKeep', (diceIndex) => {
    const dice = diceList[diceIndex];
    if (dice) {
        toggleDiceKeep(dice.diceMesh);
    }
});
eventBus.subscribe('resetDiceKeep', () => {
    diceList.forEach(d => {
        if (d.diceMesh.isKept) {
            toggleDiceKeep(d.diceMesh);
        }
    });
});

function setup3D() {
    ({ scene, camera, renderer, world } = init3D(THREE, CANNON, OrbitControls, document.getElementById('dice-container')));

    for (let i = 0; i < 3; i++) {
        let { diceBody, diceMesh } = createDice(THREE, CANNON, scene, world, i);
        diceList.push({ diceBody, diceMesh, id: i });
    }

    animate();
}

import eventBus from './eventbus.js';

window.lancer = function() {
    if (rolling) return;
    rolling = true;
    document.getElementById("dice-value").textContent = "";

    let diceToRoll = diceList.filter(d => !d.diceMesh.isKept);
    if (diceToRoll.length === 0) { // If all dice are kept, roll all
        diceToRoll = diceList;
        diceList.forEach(d => {
            if(d.diceMesh.isKept) toggleDiceKeep(d.diceMesh);
        });
    }

    diceToRoll.forEach((dice, i) => {
        lancerDe(dice.diceBody, i);
    });

    // Reset kept status for the next turn after the roll
    setTimeout(() => {
        diceList.forEach(d => {
            if (d.diceMesh.isKept) {
                // This is a visual cue, the actual game logic will handle the state
            }
        });
    }, 1500); // Delay to allow user to see which dice were kept
}

function animate() {
    requestAnimationFrame(animate);
    if (world && renderer && camera && scene) {
        updateGame(world, diceList.map(d => d.diceBody));
        diceList.forEach(dice => syncDiceMeshBody(dice.diceMesh, dice.diceBody));
        renderer.render(scene, camera);

        if (rolling && diceList.every(dice => isDiceStopped(dice.diceBody))) {
            rolling = false;
            const tops = diceList.map(dice => getTopFace(dice.diceMesh, THREE));
            document.getElementById("dice-value").textContent = "Résultat : " + tops.join(", ");
            if (game) {
                game.rollDice(tops);
            }
        }
    }
}

import Game from './game.js';

let game;

function handleStartGame() {
    const playerName = document.getElementById("player-name").value || "Joueur 1";
    const aiCount = parseInt(document.getElementById("ai-count").value, 10);
    const playerNames = [playerName];
    for (let i = 0; i < aiCount; i++) {
        playerNames.push(`IA ${i + 1}`);
    }

    game = new Game(playerNames);
    game.start();

    document.getElementById("settings-form").style.display = "none";
    document.getElementById("game-area").style.display = "block";

    setup3D();
}

import { toggleDiceKeep } from "./dicemanager.js";

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    if (!camera) return;

    const canvasBounds = diceContainer.getBoundingClientRect();
    mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
    mouse.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const intersectedMesh = intersects[0].object;
        if (diceList.some(d => d.diceMesh === intersectedMesh)) {
            toggleDiceKeep(intersectedMesh);
        }
    }
}


document.getElementById("start-game-btn").addEventListener("click", handleStartGame);
document.getElementById("roll-dice-btn").addEventListener("click", lancer);
document.getElementById("end-turn-btn").addEventListener("click", () => {
    if (game) {
        game.manualEndTurn();
    }
});
document.getElementById("reset-game-btn").addEventListener("click", () => {
    localStorage.removeItem('gameState421');
    window.location.reload();
});

diceContainer.addEventListener('click', onMouseClick, false);

// On page load, check for saved game state
window.addEventListener('load', () => {
    game = new Game([]);
    if (game.loadState()) {
        console.log("Partie sauvegardée chargée.");
        document.getElementById("settings-form").style.display = "none";
        document.getElementById("game-area").style.display = "block";
        setup3D();
        game.updateUI();
    }
});