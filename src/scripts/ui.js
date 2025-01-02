import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { blocks, resources } from "./blocks";

export function createUI(world) {
    const gui = new GUI() 
    

    gui.onChange(() => {
        world.generate();
    })
}