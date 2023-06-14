import { wait } from "./lib/util";
import { BinaryMazeGenerator } from "./maze/generators/binary";
import { BranchingMazeGenerator, BreadthFirstGenerator, DepthFirstGenerator, RandomGrowingTreeGenerator } from "./maze/generators/growing-tree";
import { HuntAndKillGenerator } from "./maze/generators/hunt-and-kill";
import { MazeGenerator } from "./maze/generators/maze-generator";
import { Maze } from "./maze/maze";
import { TreeRenderer } from "./maze/renderers/tree-renderer";

let generatorFunctions = [
    () => new BinaryMazeGenerator(),
    () => new DepthFirstGenerator(),
    () => new BreadthFirstGenerator(),
    () => new RandomGrowingTreeGenerator(),
    () => new BranchingMazeGenerator(2),
    () => new BranchingMazeGenerator(3),
    () => new HuntAndKillGenerator(),
]

let currentGenerator: MazeGenerator;
let currentGeneratorIndex = 0;

async function main() {
    startGeneratingMaze();

    window.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowLeft':
                currentGeneratorIndex--;
                if (currentGeneratorIndex < 0) {
                    currentGeneratorIndex = generatorFunctions.length - 1;
                }
                startGeneratingMaze();
                break;
            case 'ArrowRight':
                currentGeneratorIndex++;
                if (currentGeneratorIndex >= generatorFunctions.length) {
                    currentGeneratorIndex = 0;
                }
                startGeneratingMaze();
                break;
            case ' ':
                // Space restarts the current generator.
                startGeneratingMaze();
                break;
        }
    });
}

function startGeneratingMaze() {
    const generatorFunction = generatorFunctions[currentGeneratorIndex];
    generateMaze(generatorFunction());
}

async function generateMaze(generator: MazeGenerator) {
    currentGenerator = generator;

    const maze = new Maze(10, 10);

    const canvas = document.querySelector('.canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d')!;

    // `currentGenerator == generator` allows this loop to be interrupted when
    // this function is called for a different generator.
    while (currentGenerator == generator && !generator.isDone(maze)) {
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