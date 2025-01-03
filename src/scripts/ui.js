import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { blocks, resources } from "./blocks";

export function createUI(world, player) {
    const gui = new GUI() 
    
const playerFolder = gui.addFolder('Player');
playerFolder.add(player, 'maxSpeed', 1, 20).name('Max Speed');
playerFolder.add(player.cameraHelper, 'visible', 1, 20).name('Show Camera Helper');
    gui.onChange(() => {
        world.generate();
    })
}