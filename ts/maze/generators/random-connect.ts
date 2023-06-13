import { choose } from "../../lib/util";
import { Maze } from "../maze";
import { MazeGenerator } from "./maze-generator";

export class RandomConnector implements MazeGenerator {

    generate(maze: Maze) {
        // Just randomly connect nodes to start with
        for (const node of maze.nodes) {
            node.connect(choose(node.neighbors, Math.random));
        }
    }

}