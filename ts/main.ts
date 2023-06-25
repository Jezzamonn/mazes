import { wait } from "./lib/util";
import { BinaryMazeGenerator } from "./maze/generators/binary";
import { BranchingMazeGenerator, BreadthFirstGenerator, DepthFirstGenerator, RandomGrowingTreeGenerator } from "./maze/generators/growing-tree";
import { HuntAndKillGenerator } from "./maze/generators/hunt-and-kill";
import { LoopErasedWalkGenerator } from "./maze/generators/loop-erased-walk";
import { MazeGenerator } from "./maze/generators/maze-generator";
import { RandomWalkGenerator } from "./maze/generators/random-walk";
import { Maze } from "./maze/maze";
import { Renderer } from "./maze/renderers/renderer";
import { TreeRenderer } from "./maze/renderers/tree-renderer";

let generatorFunctions = [
    () => new BinaryMazeGenerator(),
    () => new DepthFirstGenerator(),
    () => new BreadthFirstGenerator(),
    () => new RandomGrowingTreeGenerator(),
    () => new BranchingMazeGenerator(2),
    () => new BranchingMazeGenerator(3),
    () => new HuntAndKillGenerator(),
    () => new RandomWalkGenerator(),
    () => new LoopErasedWalkGenerator(),
]

let currentGenerator: MazeGenerator;
let currentGeneratorIndex = 0;

async function main() {
    startGeneratingMaze();

    if (window.devicePixelRatio > 1) {
        // If the device has a high pixel ratio, scale up the canvas.
        const canvas = document.querySelector('.canvas') as HTMLCanvasElement;
        canvas.width *= window.devicePixelRatio;
        canvas.height *= window.devicePixelRatio;
        canvas.style.width = `${canvas.width / window.devicePixelRatio}px`;
        canvas.style.height = `${canvas.height / window.devicePixelRatio}px`;
    }

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
    const generator = generatorFunctions[currentGeneratorIndex]();

    // Update the algorthm name here too.
    // TODO: Figure out how to represent parameters to the algorithm.
    const algorithmNameElem = document.querySelector('.algorithm-name')!;
    algorithmNameElem.textContent = generator.constructor.name;

    generateMaze(generator);
}

async function generateMaze(generator: MazeGenerator) {
    currentGenerator = generator;

    const maze = new Maze(10, 10);

    const canvas = document.querySelector('.canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d')!;

    const it = generator.generate(maze);

    function renderMaze() {
        context.resetTransform();
        context.fillStyle = '#DDD';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Scale by pixel ratio.
        context.scale(window.devicePixelRatio, window.devicePixelRatio);

        const mazeRenderer = new Renderer();
        mazeRenderer.render(context, maze, generator);

        const renderer = new TreeRenderer(maze.nodes[0]);
        renderer.render(context);
    }

    // `currentGenerator == generator` allows this loop to be interrupted when
    // this function is called for a different generator.
    while (generator == currentGenerator && it.next().done == false) {
        renderMaze();
        await wait(0.05);
    }

    renderMaze();
}

window.onload = main;