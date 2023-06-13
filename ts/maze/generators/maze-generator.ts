import { Maze } from "../maze";

export interface MazeGenerator {
    generate(maze: Maze): void;
}