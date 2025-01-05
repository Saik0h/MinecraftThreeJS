import * as THREE from 'three'
import { WorldChunk } from './worldChunk'

export class World extends THREE.Group {

    asyncLoading = true;


    drawDistance = 8;
    chunkSize = {
        width: 16,
        height: 16
    }

    params = {
        seed: 0,
        terrain: {
            scale: 50,
            magnitude: 0.2,
            offset: 0.4
        }
    };

    constructor(seed = 0) {
        super();
        this.seed = seed;
    }

    generate() {
        this.disposeChunks()

        for (let x = this.drawDistance; x <= this.drawDistance; x++) {
            for (let z = -this.drawDistance; z <= this.drawDistance; z++) {
                this.generateChunk(x, z)
            }
        }
    }

    /**
     * Updates the visible portions of the world based on the
     * current player position
     * @param {Player} player 
     */
    update(player) {
        const visibleChunks = this.getVisibleChunks(player)
        const chunksToAdd = this.getChunksToAdd(visibleChunks)
        this.removeUnusedChunks(visibleChunks)

        for (const chunk of chunksToAdd) {
            this.generateChunk(chunk.x, chunk.z);
        }
    }

    /**
       * Returns an array containing the coordinates of the chunks that 
       * are currently visible to the player
       * @param {Player} player 
       * @returns {{ x: number, z: number}[]}
       */
    getVisibleChunks(player) {

        const visibleChunks = [];

        const coords = this.worldToChunkCoords(
            player.position.x,
            player.position.y,
            player.position.z
        );

        const chunkX = coords.chunk.x;
        const chunkZ = coords.chunk.z;

        for (let x = chunkX - this.drawDistance; x <= chunkX + this.drawDistance; x++) {
            for (let z = chunkZ - this.drawDistance; z <= chunkZ + this.drawDistance; z++) {
                visibleChunks.push({ x, z });
            }
        }


        return visibleChunks;

    }


    getChunksToAdd(visibleChunks) {
        return visibleChunks.filter((chunk) => {
            const chunkExists = this.children
                .map((obj) => obj.userData)
                .find(({ x, z }) => (
                    chunk.x === x && chunk.z === z
                ));

            return !chunkExists;
        })
    }

    /**
    * Removes current loaded chunks that are no longer visible to the player
    * @param {{ x: number, z: number}[]} visibleChunks 
    */
    removeUnusedChunks(visibleChunks) {
        const chunksToRemove = this.children.filter((chunk) => {
            const { x, z } = chunk.userData;
            const chunkExists = visibleChunks
                .find((visibleChunk) => (
                    visibleChunk.x === x && visibleChunk.z === z
                ));

            return !chunkExists;
        });

        for (const chunk of chunksToRemove) {
            chunk.disposeInstances();
            this.remove(chunk);
            // console.log(`Removing chunk at X: ${chunk.userData.x} Z: ${chunk.userData.z}`);
        }
    };

    /**
   * Generates the chunk at the (x, z) coordinates
   * @param {number} x 
   * @param {number} z
   */
    generateChunk(x, z) {
        const chunk = new WorldChunk(this.chunkSize, this.params);
        chunk.position.set(
            x * this.chunkSize.width,
            0,
            z * this.chunkSize.width);
        chunk.userData = { x, z };

        if (this.asyncLoading) {
            requestIdleCallback(chunk.generate.bind(chunk), { timeout: 1000 })
        } else {
            chunk.generate();
        }

        this.add(chunk);

        // console.log(`Adding chunk at X: ${x} Z: ${z}`);
    }

    /**
  * Gets the block data at (x, y, z)
  * @param {number} x 
  * @param {number} y 
  * @param {number} z 
  * @returns {{id: number, instanceId: number} | null}
  */
    getBlock(x, y, z) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);
        if (chunk && chunk.loaded) {

            return chunk.getBlock(
                coords.block.x,
                coords.block.y,
                coords.block.z
            );
        } else {
            return null
        }
    }

    /**
   * Returns the coordinates of the block at world (x,y,z)
   *  - `chunk` is the coordinates of the chunk containing the block
   *  - `block` is the coordinates of the block relative to the chunk
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   * @returns {{
   *  chunk: { x: number, z: number},
    *  block: { x: number, y: number, z: number}
    * }}
    */
    worldToChunkCoords(x, y, z) {
        const chunkCoords = {
            x: Math.floor(x / this.chunkSize.width),
            z: Math.floor(z / this.chunkSize.width)
        };

        const blockCoords = {
            x: x - this.chunkSize.width * chunkCoords.x,
            y,
            z: z - this.chunkSize.width * chunkCoords.z
        }

        return {
            chunk: chunkCoords,
            block: blockCoords
        }
    }

    /**
     * 
     * @param {number} chunkX 
     * @param {number} chunkZ
     * @returns {WorldChunk | null} 
     */
    getChunk(chunkX, chunkZ) {
        return this.children.find((chunk) => (
            chunk.userData.x === chunkX &&
                chunk.userData.z === chunkZ
        ));
    }


    disposeChunks() {
        this.traverse((chunk) => {
            if (chunk.disposeInstances) {
                chunk.disposeInstances();
            }
        });
        this.clear();
    }

    removeBlock(x, y, z){
       const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z)
        
        if (!chunk){
            chunk.removeBlock(
                coords.block.x,
                coords.block.y,
                coords.block.z
            )
        };
    }

}