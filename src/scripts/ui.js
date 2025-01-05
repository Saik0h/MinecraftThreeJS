import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { blocks, resources } from "./blocks";
export function createUI(scene, world, player) {


    const gui = new GUI() 
    
    const sceneFolder = gui.addFolder('Scene');
    sceneFolder.add(scene.fog, 'near', 1, 200, 1).name('Fog Near')
    sceneFolder.add(scene.fog, 'far', 1, 200, 1).name('Fog Far')
    
    const worldFolder = gui.addFolder('World');

    worldFolder.add(world, 'asyncLoading', 0, 5, 1).name('Async Chunk Generation');
    worldFolder.add(world, 'drawDistance', 0, 5, 1).name('Generate Chunks');

    worldFolder.add(world.params.terrain, 'scale', 10, 100).name('Scale');
    worldFolder.add(world.params.terrain, 'offset', 0, 1).name('Offset');
    worldFolder.add(world.params.terrain, 'magnitude', 0, 1).name('Magnitude');
const playerFolder = gui.addFolder('Player');
playerFolder.add(player, 'maxSpeed', 1, 20).name('Max Speed');
playerFolder.add(player.cameraHelper, 'visible', 1, 20).name('Show Camera Helper');
    gui.onChange(() => {
        world.generate();
    })
}