import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { World } from "./world";
import { createUI } from "./ui";
import { shadow } from "three/tsl";
import { Player } from "./player";

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
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.set(-32, 16, -32);
camera.lookAt(16, 0, 16);

const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(16, 0, 16);
controls.update()
// Scene setup
const scene = new THREE.Scene();
const world = new World();
world.generate();
scene.add(world)


const player = new Player(scene)

const setupLights = ()=> {
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

    const shadowHelper = new THREE.CameraHelper(sun.shadow.camera);
    scene.add(shadowHelper)
    const ambient = new THREE.AmbientLight();
    ambient.intensity = 0.1;
    scene.add(ambient)
}

//Render loop
let previousTime = performance.now();
const animate = () =>{
    let currentTime = performance.now();
    let dt = (currentTime - previousTime) / 100000;
    renderer.setAnimationLoop(animate);
    renderer.render(scene, player.camera)
    player.applyInputs(dt);
    addEventListener('resize', ()=>{
        camera.aspect = window.innerWidth/innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        stats.update()
    })
}
setupLights()
createUI(world)
animate()
