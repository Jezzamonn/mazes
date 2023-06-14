import { wait } from "./lib/util";
import { BinaryMazeGenerator } from "./maze/generators/binary";
import { BranchingMazeGenerator, BreadthFirstGenerator, DepthFirstGenerator, RandomGrowingTreeGenerator } from "./maze/generators/growing-tree";
import { HuntAndKillGenerator } from "./maze/generators/hunt-and-kill";
import { Maze } from "./maze/maze";
import { TreeRenderer } from "./maze/renderers/tree-renderer";

async function main() {
    const canvas = document.querySelector('.canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d')!;

    const maze = new Maze(10, 10);

    const generator = new HuntAndKillGenerator();

    while (!generator.isDone(maze)) {
        generator.iterate(maze);

        context.resetTransform();
        context.clearRect(0, 0, canvas.width, canvas.height);

        maze.render(context);

        const renderer = new TreeRenderer(maze.nodes[0]);
        renderer.render(context);

        await wait(0.1);
    }
}

window.onload = main;