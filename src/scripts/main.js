import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { World } from "./world";
import { createUI } from "./ui";
import { shadow } from "three/tsl";
import { Player } from "./player";
import { Physics } from "./physics";
import { update } from "three/examples/jsm/libs/tween.module.js";

const stats = new Stats();
document.body.append(stats.dom)
// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x80a0e0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild(renderer.domElement);
// Camera setup
const orbitCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
orbitCamera.position.set(-16, 16, -16);
orbitCamera.lookAt(-64, 0, -64);

const controls = new OrbitControls(orbitCamera, renderer.domElement)
controls.target.set(16, 0, 16);
controls.update()
// Scene setup
const scene = new THREE.Scene();
const world = new World();
world.generate();
scene.add(world)


const player = new Player(scene)

const physics = new Physics(scene)

const setupLights = () => {
    const sun = new THREE.DirectionalLight();
    sun.position.set(50, 50, 50);
    sun.castShadow = true;
    sun.shadow.camera.left = -50;
    sun.shadow.camera.right = 50;
    sun.shadow.camera.bottom = -50;
    sun.shadow.camera.top = 50;
    sun.shadow.camera.near = 0.1;
    sun.shadow.camera.far = 100;
    sun.shadow.bias = -0.0005;
    sun.shadow.mapSize = new THREE.Vector2(512, 512);
    scene.add(sun);

    // const shadowHelper = new THREE.CameraHelper(sun.shadow.camera);
    // scene.add(shadowHelper)
    const ambient = new THREE.AmbientLight();
    ambient.intensity = 0.1;
    scene.add(ambient)
}

//Render loop
let previousTime = performance.now();

const animate = () => {
    let currentTime = performance.now();
    let dt = (currentTime - previousTime) / 1000000;

    renderer.setAnimationLoop(animate);
    physics.update(dt, player, world)
    renderer.render(scene, player.controls.isLocked ? player.camera : orbitCamera)

    addEventListener('resize', () => {
        orbitCamera.aspect = window.innerWidth / innerHeight;
        orbitCamera.updateProjectionMatrix();
        player.camera.aspect = window.innerWidth / innerHeight;
        player.camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        stats.update()
    })
}
setupLights()
createUI(world, player)
animate()
