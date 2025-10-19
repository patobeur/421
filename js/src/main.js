import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js";
import { bus } from './eventbus.js';
import Game from './game.js';
import { init3D } from './threefunctions.js';
import { createDice, syncDiceMeshBody, isDiceStopped, getTopFace } from './dicemanager.js';

let diceList = [];
let world, renderer, camera, scene;
let rolling = false;

document.addEventListener('DOMContentLoaded', () => {
    const startGameButton = document.getElementById('start-game');
    const playerNameInput = document.getElementById('player-name');
    const aiCountSelect = document.getElementById('ai-count');
    const aiNamesDiv = document.getElementById('ai-names');

    function updateAiNameInputs() {
        const aiCount = parseInt(aiCountSelect.value, 10);
        aiNamesDiv.innerHTML = '';
        for (let i = 0; i < aiCount; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Nom IA ${i + 1}`;
            input.id = `ai-name-${i}`;
            input.value = `IA ${i + 1}`;
            aiNamesDiv.appendChild(input);
        }
    }

    aiCountSelect.addEventListener('change', updateAiNameInputs);
    updateAiNameInputs();

    startGameButton.addEventListener('click', () => {
        const playerName = playerNameInput.value;
        const aiCount = parseInt(aiCountSelect.value, 10);
        const players = [{ name: playerName, type: 'human' }];

        for (let i = 0; i < aiCount; i++) {
            const aiName = document.getElementById(`ai-name-${i}`).value;
            players.push({ name: aiName, type: 'ai' });
        }

        bus.emit('startGame', { players });

        document.getElementById('game-menu').style.display = 'none';
        document.getElementById('game-interface').style.display = 'block';

        setup3DScene();
    });
});

function setup3DScene() {
    ({ scene, camera, renderer, world } = init3D(THREE, CANNON, OrbitControls));
    renderer.domElement.id = 'three-canvas';
    document.getElementById('game-container').prepend(renderer.domElement);


    for (let i = 0; i < 3; i++) {
        let { diceBody, diceMesh } = createDice(THREE, CANNON, scene, world, i);
        diceMesh.userData.index = i;
        diceList.push({ diceBody, diceMesh, frozen: false });
    }

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    world.step(1 / 60);
    diceList.forEach(dice => syncDiceMeshBody(dice.diceMesh, dice.diceBody));
    renderer.render(scene, camera);

    if (rolling && diceList.every(dice => isDiceStopped(dice.diceBody))) {
        rolling = false;
        const tops = diceList.map(dice => getTopFace(dice.diceMesh, THREE));
        bus.emit('diceRollComplete', tops);
    }
}

bus.on('rollDice', () => {
    rolling = true;
    diceList.forEach((dice, i) => {
        if (!dice.frozen) {
            lancerDe(dice.diceBody, -1 + i * 1.1);
        }
    });
});

window.addEventListener('click', (event) => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData.index !== undefined) {
            const index = object.userData.index;
            toggleFreeze(index);
        }
    }
});

bus.on('freezeDice', (frozen) => {
    frozen.forEach((isFrozen, i) => {
        if (diceList[i].frozen !== isFrozen) {
            toggleFreeze(i);
        }
    });
});

function toggleFreeze(index) {
    diceList[index].frozen = !diceList[index].frozen;
    diceList[index].diceMesh.material.forEach(material => {
        material.color.set(diceList[index].frozen ? 0xffff00 : 0xffffff);
    });
}

function lancerDe(diceBody) {
    diceBody.position.set(0, 2 + Math.random() * 1, 0);
    diceBody.velocity.set(
        (Math.random() - 0.5) * 8,
        5 + Math.random() * 3,
        (Math.random() - 0.5) * 8
    );
    diceBody.angularVelocity.set(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25
    );
    diceBody.quaternion.setFromEuler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );
}
