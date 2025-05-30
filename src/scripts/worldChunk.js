import * as THREE from "three"
import { RNG } from "./rng.js";
import { SimplexNoise } from "three/examples/jsm/Addons.js";
import { blocks, resources} from "./blocks.js";

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshLambertMaterial();

export class WorldChunk extends THREE.Group {
    /**
    *@type {{
    *id:number,
    *instanceId: number
    *}[][][]}
    */

    data = [];

    constructor(size, params) {
        super();
        this.loaded = false;
        this.size = size;
        this.params = params;
    }

    generate() {
        const rng = new RNG(this.params.seed)
        this.initializeTerrrain();
        this.generateResources(rng);
        this.generateTerrrain(rng);
        this.generateMeshes();

        this.loaded = true;
    }

    /**
     * Initializing the world terrain data 
     */
    generateResources(rng) {
        const simplex = new SimplexNoise(rng);
        resources.forEach(resource =>{
            for (let x = 0; x < this.size.width; x++) {
                for (let y = 0; y < this.size.height; y++) {
                    for (let z = 0; z < this.size.width; z++) {
                        const value = simplex.noise3d(
                           (this.position.x + x) / resource.scale.x,
                           (this.position.y + y) / resource.scale.y,
                            (this.position.z + z) / resource.scale.z)
                    if(value > resource.scarcity){
                        this.setBlockId(x, y, z, resource.id);
                    }
                    }
                }
            }
        })
        
    }
    initializeTerrrain() {
        this.data = [];
        for (let x = 0; x < this.size.width; x++) {
            const slice = [];
            for (let y = 0; y < this.size.height; y++) {
                const row = [];
                for (let z = 0; z < this.size.width; z++) {
                    row.push({
                        id: blocks.empty.id,
                        instanceId: null
                    });
                }
                slice.push(row);
            }
            this.data.push(slice)
        }
    }
    generateTerrrain(rng) {
        const simplex = new SimplexNoise(rng);
        for (let x = 0; x < this.size.width; x++) {
            for (let z = 0; z < this.size.width; z++) {
                const value = simplex.noise(
                    (this.position.x + x) / this.params.terrain.scale,
                    (this.position.z + z) / this.params.terrain.scale
                );

                //Scale the noise based on the magnitude/offset
                const scaledNoise = this.params.terrain.offset +
                    this.params.terrain.magnitude * value;

                //Computes the height of the terrain at this x-z location
                let height = Math.floor(this.size.height * scaledNoise);

                //Clamps the height between 0 and max height
                height = Math.max(0, Math.min(height, this.size.height - 1));

                //Fills in all blocks at or below the terrain height
                for (let y = 0; y <= this.size.height; y++) {
                    if (y < height && this.getBlock(x, y, z).id === blocks.empty.id) {
                        this.setBlockId(x, y, z, blocks.dirt.id);
                    } else if (y === height) {
                        this.setBlockId(x, y, z, blocks.grass.id);
                    } else if (y > height){
                        this.setBlockId(x, y, z, blocks.empty.id)
                    }
                }
            }
        }

    }

    generateMeshes() {
        this.clear();

        const maxCount = this.size.width * this.size.width * this.size.height;

        //Creates a Lookup table where the kew is the block id
        const meshes = {};

        Object.values(blocks)
        .filter(blockType => blockType.id !== blocks.empty.id)
        .forEach(blockType => {
            const mesh = new THREE.InstancedMesh(geometry, blockType.material, maxCount);
            mesh.name = blockType.name;
            mesh.count = 0;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            meshes[blockType.id] = mesh;
        })

       

        const matrix = new THREE.Matrix4();
        for (let x = 0; x < this.size.width; x++) {
            for (let y = 0; y < this.size.height; y++) {
                for (let z = 0; z < this.size.width; z++) {
                    const blockId = this.getBlock(x, y, z).id;
                
                    if(blockId === blocks.empty.id) continue;

                    const mesh = meshes[blockId];
                    const instanceId = mesh.count;

                    if (!this.isBlockObscured(x, y, z)) {
                        matrix.setPosition(x, y, z)
                        mesh.setMatrixAt(instanceId, matrix);
                        this.setBlockInstanceId(x, y, z, instanceId);
                        mesh.count++;
                    }
                }
            }
        }
        this.add(...Object.values(meshes));
    }

   
    /**
     * Gets the block data at (x, y, z)
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {{id:number, instanceId}}
     */

    getBlock(x, y, z) {
        if (this.inBounds(x, y, z)) {
            return this.data[x][y][z];
        } else {
            return null;
        }
    }

    /**
     * Removes a block in a specific position
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    removeBlock(x, y, z){
        const block = this.getBlock(x, y, z);
            if(block && block.id !== blocks.empty){
                this.deleteBlockInstance
            }
        }

    /**
     * Sets the block id for the block at (x, y, z)
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} id
     */
    setBlockId(x, y, z, id) {
        if (this.inBounds(x, y, z)) {
            this.data[x][y][z].id = id;
        }
    }

    /**
     * Sets the block id for the block at (x, y, z)
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} instanceId
     */
    setBlockInstanceId(x, y, z, instanceId) {
        if (this.inBounds(x, y, z)) {
            this.data[x][y][z].instanceId = instanceId;
        }
    }

    inBounds(x, y, z) {
        if (x >= 0 && x < this.size.width &&
            y >= 0 && y < this.size.height &&
            z >= 0 && z < this.size.width) {
            return true;
        } else {
            return false;

        }
    }

    isBlockObscured(x, y, z) {
        const up = this.getBlock(x, y + 1, z)?.id ?? blocks.empty.id;
        const down = this.getBlock(x, y - 1, z)?.id ?? blocks.empty.id;
        const left = this.getBlock(x + 1, y, z)?.id ?? blocks.empty.id;
        const right = this.getBlock(x - 1, y, z)?.id ?? blocks.empty.id;
        const forward = this.getBlock(x, y, z + 1)?.id ?? blocks.empty.id;
        const back = this.getBlock(x, y, z - 1)?.id ?? blocks.empty.id;

        //If any of the block's sides is exposed, then its not obscured
        if (up === blocks.empty.id ||
            down === blocks.empty.id ||
            back === blocks.empty.id ||
            forward === blocks.empty.id ||
            right === blocks.empty.id ||
            left === blocks.empty.id) {
            return false
        } else {
            return true
        }
    }
    
    disposeInstances(){
        this.traverse((obj) =>{
            if (obj.dispose) obj.dispose();
        });
        this.clear();
    }
}


