import { GrowingTreeGenerator } from "./maze/generators/growing-tree";
import { Maze } from "./maze/maze";
import { TreeRenderer } from "./maze/renderers/tree-renderer";

function main() {
    const canvas = document.querySelector('.canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d')!;

    const maze = new Maze(10, 10);

    const generator = new GrowingTreeGenerator();
    generator.generate(maze);

    maze.render(context);

    const renderer = new TreeRenderer(maze.nodes[0]);
    renderer.render(context);
}

window.onload = main;