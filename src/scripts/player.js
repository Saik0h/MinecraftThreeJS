import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';
import { Matrix2, Vector2 } from 'three/webgpu';

const CENTER_SCREEN = new Vector2();
export class Player {
    radius = 0.5;
    height = 1.75;
    jumpSpeed = 10;
    onGround = false;

    maxSpeed = 10;
    input = new THREE.Vector2();
    velocity = new THREE.Vector3();
    #worldVelocity = new THREE.Vector3();

    camera = new THREE.PerspectiveCamera(70, innerWidth / window.innerHeight, 0.1, 200)
    controls = new PointerLockControls(this.camera, document.body)
    cameraHelper = new THREE.CameraHelper(this.camera)


    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(), 0, 4);
    selectedCoords = null;
    /**
     * 
     * @param {THREE.Scene} scene 
     */
    constructor(scene, world) {
        this.world = world;
        this.camera.position.set(32, 32, 32)
        this.cameraHelper.visible = false
        scene.add(this.camera)
        scene.add(this.cameraHelper)

        // Hide/show instructions based on pointer controls locking/unlocking
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        document.addEventListener('keydown', this.onKeyDown.bind(this));

        this.boundsHelper = new THREE.Mesh(
            new THREE.CylinderGeometry(this.radius, this.radius, this.height, 16),
            new THREE.MeshBasicMaterial({ wireframe: true }))

        scene.add(this.boundsHelper)
        this.boundsHelper.visible = false

        const selectionMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.3,
            color: 0xffffaa
        });
        const selectionGeometry = new THREE.BoxGeometry(1.001, 1.001, 1.001)
        this.selectionHelper = new THREE.Mesh(selectionGeometry, selectionMaterial)
        scene.add(this.selectionHelper)
    }

    get worldVelocity() {
        this.#worldVelocity.copy(this.velocity);
        this.#worldVelocity.applyEuler(new THREE.Euler(0, this.camera.rotation.y, 0));
        return this.#worldVelocity;

    }

    update(world) {
        this.updateRaycaster(world);
    }

    updateRaycaster(world) {
        this.raycaster.setFromCamera(CENTER_SCREEN, this.camera);
        const intersections = this.raycaster.intersectObject(world, true);

        if (intersections.length > 0) {

            const intersection = intersections[0];

            // Get the position of the chunk that the block is contained in
            const chunk = intersection.object.parent;

            // Get transformation matrix of the intersected block
            const blockMatrix = new THREE.Matrix4();
            intersection.object.getMatrixAt(intersection.instanceId, blockMatrix);

            //Extract the position from the block transformation matrix and stores' it in selected coords
            this.selectedCoords = chunk.position.clone();
            this.selectedCoords.applyMatrix4(blockMatrix);

            this.selectionHelper.position.copy(this.selectedCoords)
            this.selectionHelper.visible = true;

            // console.log(this.selectedCoords)
        } else{
            this.selectedCoords = null;
            this.selectionHelper.visible = false;
        }
    }
    /**
     * 
     * @param {THREE.Vector3} dv 
     */
    applyWorldDeltaVelocity(dv) {
        dv.applyEuler(new THREE.Euler(0, -this.camera.rotation.y, 0));
        this.velocity.add(dv);
    }

    applyInputs(dt) {
        if (this.controls.isLocked) {
            this.velocity.x = this.input.x;
            this.velocity.z = this.input.z;
            this.controls.moveRight(this.velocity.x * dt)
            this.controls.moveForward(this.velocity.z * dt)
            this.position.y += this.velocity.y * dt;
            document.getElementById('player-position').innerHTML = this.toString();
        }
    }

    updateBoundsHelper() {
        this.boundsHelper.position.copy(this.position);
        this.boundsHelper.position.y -= this.height / 2;
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
                this.input.x = this.maxSpeed;
                break;
            case 'KeyR':
                this.position.set(32, 16, 32);
                this.velocity.set(0, 0, 0)
                break;
            case 'Space':
                // if (this.onGround) {
                this.velocity.y = this.jumpSpeed;
                // }
                break;
            case 'Escape':
                return
                break;
            case 'ShiftLeft':
                this.velocity.y = -10;
                // this.height = 1.50;
                // this.velocity.x = (this.velocity.x / 2)
                // this.velocity.z = (this.velocity.z / 2)
                break;
            case 'ControlLeft':
                this.velocity.x = 20
                this.velocity.z = 20
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
            case 'KeyD': ""
                this.input.x = 0;
                break;
            case 'ShiftLeft':
                // this.height = 1.75
                // this.velocity.x = (this.velocity.x * 2)
                // this.velocity.z = (this.velocity.z * 2)
                this.velocity.y = 0;
                break;
            case 'Escape':
                return
                break;
            case 'Space':
                // if (this.onGround) {
                this.velocity.y = 0;
                // }
                break;
            case 'ControlLeft':
                this.velocity.x = 10
                this.velocity.z = 10
                break;
        }
    }

    /**
     * @returns {string}
     */
    toString() {
        let str = '';
        str += `X: ${this.position.x.toFixed(3)}`
        str += `Y: ${this.position.y.toFixed(3)}`
        str += `Z: ${this.position.z.toFixed(3)}`
        return str;
    }
}