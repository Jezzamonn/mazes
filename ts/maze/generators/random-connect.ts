import { choose } from "../../lib/util";
import { Maze } from "../maze";
import { MazeGenerator } from "./maze-generator";

// Loop through each node and connect it to another node. This does not create a connected maze though.
export class RandomConnector extends MazeGenerator {

    index: number = 0;

    iterate(maze: Maze): void {
        if (this.isDone(maze)) {
            return;
        }

        const node = maze.nodes[this.index];
        node.connect(choose(node.neighbors, Math.random));
        this.index++;
    }

    isDone(maze: Maze): boolean {
        return this.index >= maze.nodes.length;
    }
}
