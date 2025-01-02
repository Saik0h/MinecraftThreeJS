import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';


export class Player {
    maxSpeed = 10;
    input = new THREE.Vector2();
    velocity = new THREE.Vector3();

    camera = new THREE.PerspectiveCamera(70, innerWidth / window.innerHeight, 0.1, 200)
    controls = new PointerLockControls(this.camera, document.body)

    /**
     * 
     * @param {THREE.Scene} scene 
     */
    constructor(scene) {
        this.camera.position.set(32, 16, 32)
        scene.add(this.camera)

        document.addEventListener('keyup', this.onKeyUp.bind(this));
        document.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    applyInputs(dt){
        if(this.controls.isLocked){
            this.velocity.x = this.input.x;
            this.velocity.z = this.input.z;
            this.controls.moveRight(this.velocity.x* dt)
            this.controls.moveForward(this.velocity.z* dt)

        }
    }

    /**
     * Returns the current world position of the Player
     * @type {THREE.Vector3}
     */
    get position() {
        return this.camera.position
    }


    /**
     * Event handler for 'keydown' event
     * @param {KeyboardEvent} event
     */
    onKeyDown(event) {
        if (!this.controls.isLocked) {
            this.controls.lock();
        }

        switch (event.code) {
            case 'KeyW':
                this.input.z = this.maxSpeed;
                break;
            case 'KeyA':
                this.input.x = -this.maxSpeed;
                break;
            case 'KeyS':
                this.input.z = -this.maxSpeed;
                break;
            case 'KeyD':
                this.input.x = +this.maxSpeed;
                break;
        }
    }
    /**
         * Event handler for 'keyup' event
         * @param {KeyboardEvent} event
         */
    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
                this.input.z = 0;
                break;
            case 'KeyA':
                this.input.x = 0;
                break;
            case 'KeyS':
                this.input.z = 0;
                break;
            case 'KeyD':
                this.input.x = 0;
                break;
        }
    }
}