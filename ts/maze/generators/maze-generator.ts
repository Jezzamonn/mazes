import { Maze } from "../maze";

export abstract class MazeGenerator {

    // Does a single iteration of the maze generation algorithm.
    abstract iterate(maze: Maze): void;

    // Whether the maze generator is complete.
    abstract isDone(maze: Maze): boolean;

    // Generates the whole maze.
    generate(maze: Maze): void {
        while (!this.isDone(maze)) {
            this.iterate(maze);
        }
    }
}
