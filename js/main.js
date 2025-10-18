import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js";
import Game from './game.js';
import { init3D, lancerDe, updateGame } from "./threefunctions.js";
import { createDice, syncDiceMeshBody, isDiceStopped, getTopFace, toggleDiceKeep } from "./dicemanager.js";

// --- Global variables ---
let diceList = [];
let world, renderer, camera, scene;
let rolling = false;
let game;

// --- DOM Elements ---
const diceContainer = document.getElementById("dice-container");
const settingsModal = document.getElementById('settings-modal');

// --- Initialization ---
function init() {
    console.log("Initializing application");
    const getDiceValues = () => diceList.map(d => getTopFace(d.diceMesh, THREE));
    game = new Game(updateUI, aiRoll, getDiceValues);
    setupEventListeners();
    if (game.loadState()) {
        console.log("Saved game loaded.");
        startGame();
    } else {
        showSettingsModal();
    }
}

function showSettingsModal() {
    console.log("Showing settings modal");
    if (!game) {
        game = new Game(updateUI, aiRoll);
    }

    if (game.players.length === 0) {
        game.addPlayer();
        game.addAI();
    }

    game.isGameInProgress = false;
    updateUI(game.getState());
    settingsModal.style.display = 'flex';
}

function startGame() {
    console.log("Starting game...");
    const nameInputs = document.querySelectorAll('#player-names-setup .player-name-input');
    nameInputs.forEach(input => {
        const index = parseInt(input.getAttribute('data-index'));
        const newName = input.value;
        if (game.players[index] && newName) {
            game.renamePlayer(index, newName);
        }
    });

    settingsModal.style.display = 'none';
    game.start();
    updateUI(game.getState());

    if (!scene) {
        setup3DScene();
    }
}

function setup3DScene() {
    console.log("Setting up 3D scene");
    ({ scene, camera, renderer, world } = init3D(THREE, CANNON, OrbitControls, diceContainer));
    diceList = [];
    for (let i = 0; i < 3; i++) {
        let { diceBody, diceMesh } = createDice(THREE, CANNON, scene, world, i);
        diceList.push({ diceBody, diceMesh, id: i });
    }
    animate();
}

function lancer(keptDiceValues = []) {
    if (rolling) return;
    if (game) {
        game.turnRolls++;
        updateUI(game.getState()); // Update UI to enable/disable buttons
    }
    rolling = true;

    diceList.forEach(d => {
        if (d.diceMesh.isKept) toggleDiceKeep(d.diceMesh);
    });

    const keptDiceMeshes = [];
    if (keptDiceValues.length > 0) {
        diceList.forEach(d => {
            const topFace = getTopFace(d.diceMesh, THREE);
            if (keptDiceValues.includes(topFace) && !keptDiceMeshes.some(k => k === d.diceMesh)) {
                 toggleDiceKeep(d.diceMesh);
                 keptDiceMeshes.push(d.diceMesh);
            }
        });
    }

    let diceToRoll = diceList.filter(d => !d.diceMesh.isKept);

    diceToRoll.forEach((dice, i) => {
        lancerDe(dice.diceBody, i);
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (world && renderer && camera && scene) {
        updateGame(world);
        diceList.forEach(dice => syncDiceMeshBody(dice.diceMesh, dice.diceBody));
        renderer.render(scene, camera);

        // The game logic is now decoupled from the animation loop
    }
}

function updateUI(gameState) {
    // Reset the rolling flag at the start of a new turn
    if (gameState.turnRolls === 0) {
        rolling = false;
    }

    const playersContainer = document.getElementById('players-container');
    const playerNamesSetup = document.getElementById('player-names-setup');

    playersContainer.innerHTML = '';
    if(playerNamesSetup) playerNamesSetup.innerHTML = '';

    gameState.players.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-area';
        if (gameState.isGameInProgress && index === gameState.currentPlayerIndex) {
            playerDiv.setAttribute('data-current', 'true');
        }

        let renameButtonHTML = !gameState.isGameInProgress ? `<button class="rename-btn" data-index="${index}">✏️</button>` : '';
        let rollsLeftHTML = (gameState.isGameInProgress && index === gameState.currentPlayerIndex && gameState.turnRolls > 0) ? `<span class="rolls-left">${3 - gameState.turnRolls} lancers restants</span>` : '';

        playerDiv.innerHTML = `
            <h3>${player.name} ${renameButtonHTML} ${rollsLeftHTML}</h3>
            <p class="score">Jetons: ${player.score}</p>
        `;
        playersContainer.appendChild(playerDiv);

        if (!gameState.isGameInProgress && playerNamesSetup) {
             playerNamesSetup.innerHTML += `<div><label>${player.isAI ? 'IA' : 'Joueur'} ${index + 1}:</label><input type="text" class="player-name-input" data-index="${index}" value="${player.name}"></div>`;
        }
    });

    if (!gameState.isGameInProgress) {
        document.querySelectorAll('.rename-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const playerIndex = e.target.getAttribute('data-index');
                const newName = prompt("Entrez le nouveau nom :", gameState.players[playerIndex].name);
                if (newName) {
                    game.renamePlayer(playerIndex, newName);
                }
            });
        });
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    document.getElementById('roll-dice-btn').disabled = !gameState.isGameInProgress || !currentPlayer || currentPlayer.isAI;
    document.getElementById('end-turn-btn').disabled = !gameState.isGameInProgress || !currentPlayer || currentPlayer.isAI || gameState.turnRolls === 0;
    document.getElementById('message-text').innerText = gameState.message;
    document.getElementById('dice-value-display').innerText = gameState.diceValue;
}

function aiRoll(keptDice) {
    lancer(keptDice);
}

function onMouseClick(event) {
    if (!camera || !game || !game.isGameInProgress || game.players[game.currentPlayerIndex].isAI) return;

    const canvasBounds = diceContainer.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
    mouse.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const intersectedMesh = intersects[0].object;
        const clickedDice = diceList.find(d => d.diceMesh === intersectedMesh);
        if (clickedDice) {
            console.log(`Dice ${clickedDice.id} clicked.`);
            toggleDiceKeep(clickedDice.diceMesh);
        }
    }
}

function setupEventListeners() {
    console.log("Setting up event listeners");
    document.getElementById("start-game-btn").addEventListener("click", startGame);
    document.getElementById("roll-dice-btn").addEventListener("click", () => {
        if (game && game.isGameInProgress && !game.players[game.currentPlayerIndex].isAI) {
            lancer();
        }
    });
    document.getElementById("end-turn-btn").addEventListener("click", () => {
        if (game && game.isGameInProgress && !game.players[game.currentPlayerIndex].isAI) {
            game.endTurn();
        }
    });
    document.getElementById("new-game-btn").addEventListener("click", showSettingsModal);
    document.getElementById("add-player-btn").addEventListener("click", () => game ? game.addPlayer() : null);
    document.getElementById("remove-player-btn").addEventListener("click", () => game ? game.removePlayer() : null);
    document.getElementById("add-ai-btn").addEventListener("click", () => game ? game.addAI() : null);
    document.getElementById("remove-ai-btn").addEventListener("click", () => game ? game.removeAI() : null);

    diceContainer.addEventListener('click', onMouseClick, false);
}

// --- App Entry Point ---
init();