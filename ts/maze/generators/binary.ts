import { choose } from "../../lib/util";
import { Maze } from "../maze";
import { Node } from "../node";
import { Color } from "../renderers/colors";
import { MazeGenerator } from "./maze-generator";
import { rng } from "./rng";

export class BinaryMazeGenerator extends MazeGenerator {

    inMaze: Set<Node>;
    currentNode: Node | undefined;

    * generate(maze: Maze): Generator<void> {
        this.inMaze = new Set();

        for (const node of maze.nodes) {
            // Just for the visual.
            this.currentNode = node;
            this.inMaze.add(node);
            // Only consider the nodes to the left and above of this node.
            // Turns out filtering by the index is all we need to do this!
            const possibleConnections = node.neighbors.filter(n => n.index < node.index);
            if (possibleConnections.length > 0) {
                const connection = choose(possibleConnections, rng);
                node.connect(connection);

                this.inMaze.add(connection);
            }
            yield;
        }
        this.currentNode = undefined;
    }

    getNodeColor(node: Node): Color {
        if (this.currentNode === node) {
            return Color.Yellow;
        }
        if (this.inMaze.has(node)) {
            return Color.White;
        }
        return Color.Transparent
    }
}
