import { choose } from "../../lib/util";
import { Maze } from "../maze";
import { MazeGenerator } from "./maze-generator";

export class BinaryMazeGenerator extends MazeGenerator {

    index: number = 0;

    iterate(maze: Maze): void {
        if (this.isDone(maze)) {
            return;
        }

        const node = maze.nodes[this.index];
        // Only consider the nodes to the left and above of this node.
        // Turns out filtering by the index is all we need to do this!
        const possibleConnections = node.neighbors.filter(n => n.index < node.index);
        if (possibleConnections.length > 0) {
            node.connect(choose(possibleConnections, Math.random));
        }

        this.index++;
    }

    isDone(maze: Maze): boolean {
        return this.index >= maze.nodes.length;
    }
}
