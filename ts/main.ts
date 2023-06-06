import { Maze } from "./maze/maze";

function main() {
    const maze = new Maze(10, 10);
    maze.generateMaze();
    const canvas = document.querySelector('.canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d')!;
    maze.render(context);
}

window.onload = main;