import { choose } from "../../lib/util";
import { Maze } from "../maze";
import { MazeGenerator } from "./maze-generator";

export class BinaryMazeGenerator extends MazeGenerator {

    * generate(maze: Maze): Generator<void> {
        for (const node of maze.nodes) {
            // Only consider the nodes to the left and above of this node.
            // Turns out filtering by the index is all we need to do this!
            const possibleConnections = node.neighbors.filter(n => n.index < node.index);
            if (possibleConnections.length > 0) {
                node.connect(choose(possibleConnections, Math.random));
            }
            yield;
        }
    }
}
