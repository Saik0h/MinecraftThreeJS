import * as THREE from "three"
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { World } from "./world";
import { Player } from "./player";
import { Physics } from "./physics";
import { createUI } from "./ui";
import { add } from "three/tsl";


// Ui Setup
const stats = new Stats();
document.body.append(stats.dom)
// Ui Setup________Finish

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x80a0e0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild(renderer.domElement);
// Renderer Setup________Finish


// Scene setup
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x80a0e0, 50, 100);

const world = new World();
world.generate();
scene.add(world)

const player = new Player(scene, world)
const physics = new Physics(scene)
// Scene Setup________Finish

// Camera setup
const orbitCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
orbitCamera.position.set(-16, 16, -16);
orbitCamera.lookAt(-64, 0, -64);

const controls = new OrbitControls(orbitCamera, renderer.domElement)
controls.target.set(16, 0, 16);
controls.update()
// Camera Setup________Finish


let sun;
const setupLights = () => {
    sun = new THREE.DirectionalLight();
    sun.intensity = 1.5;
    sun.position.set(50, 50, 50);
    sun.castShadow = true;

    // Set the size of the sun's shadow box
    sun.shadow.camera.left = -100;
    sun.shadow.camera.right = 100;
    sun.shadow.camera.bottom = -100;
    sun.shadow.camera.top = 100;
    sun.shadow.camera.near = 0.1;
    sun.shadow.camera.far = 200;
    sun.shadow.bias = -0.0001;
    sun.shadow.mapSize = new THREE.Vector2(2048, 2048);
    scene.add(sun);
    scene.add(sun.target);

    const ambient = new THREE.AmbientLight();
    ambient.intensity = 0.2;
    scene.add(ambient);
}
const onMouseDown = (event) =>{
if(player.controls.isLocked && player.selectedCoords){

}
}

addEventListener('mousedown', onMouseDown);
//Render loop
let previousTime = performance.now();
const animate = () => {
    renderer.setAnimationLoop(animate);

    
    let currentTime = performance.now();
    let dt = (currentTime - previousTime) / 1000;
    // Only update physics when player controls are locked
    if (player.controls.isLocked) {
        player.update(world)
        physics.update(dt, player, world);
        world.update(player);

        // Position the sun relative to the player. Need to adjust both the
        // position and target of the sun to keep the same sun angle
        sun.position.copy(player.position);
        sun.position.sub(new THREE.Vector3(-50, -50, -50));
        sun.target.position.copy(player.position)

        // Update positon of the orbit camera to track player 
        orbitCamera.position.copy(player.position).add(new THREE.Vector3(16, 16, 16));
        controls.target.copy(player.position);
    }

    renderer.render(scene, player.controls.isLocked ? player.camera : orbitCamera)
    stats.update();

    previousTime = currentTime;
}

addEventListener('resize', () => {
    // Resize camera aspect ratio and renderer size to the new window size
    orbitCamera.aspect = window.innerWidth / innerHeight;
    orbitCamera.updateProjectionMatrix();
    player.camera.aspect = window.innerWidth / innerHeight;
    player.camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});

createUI(scene, world, player);
setupLights();
animate();
