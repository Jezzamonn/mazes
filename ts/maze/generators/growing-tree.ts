import { choose } from "../../lib/util";
import { Maze } from "../maze";
import { Node } from "../node";
import { Color } from "../renderers/colors";
import { MazeGenerator } from "./maze-generator";
import { rng } from "./rng";

/**
 * The order we pick to visit changes the vibe of the mazes that are
 * generated. Start with just picking from the end (equivalent to the
 * recursive backtracker algorithm).
 *
 * Another slight nuance would be to sort the node and potential
 * connection in the toVisit array. But for now we'll just pick a random
 * connection from that node.
 */
abstract class GrowingTreeGenerator extends MazeGenerator {

    toVisit: Node[] = [];
    inMaze: Set<Node> = new Set();
    startNode: Node | undefined;

    /**
     * Returns the index of the next node to try to add a new connection from.
    */
    abstract selectNode(nodes: Node[]): number;

    * generate(maze: Maze): Generator<void> {
        this.toVisit = [this.getStartNode(maze)];
        this.inMaze = new Set(this.toVisit);

        // Another slight nuance would be to store the node and potential
        // connection in the toVisit array. But for now we'll just pick a random
        // connection from that node.
        while (this.toVisit.length > 0) {
            yield;
            const index = this.selectNode(this.toVisit);
            const node = this.toVisit[index];

            const possibleConnections = node.neighbors.filter(
                (n) => !this.inMaze.has(n)
            );
            if (possibleConnections.length === 0) {
                this.toVisit.splice(index, 1);
                continue;
            }

            const connection = choose(possibleConnections, rng);
            node.connect(connection);
            this.inMaze.add(connection);

            this.toVisit.push(connection);
        }
    }

    getNodeColor(node: Node): Color {
        if (this.toVisit.includes(node)) {
            return Color.Green;
        }
        if (this.inMaze.has(node)) {
            return Color.White;
        }
        return Color.Transparent;
    }

    getStartNode(maze: Maze): Node {
        if (this.startNode == undefined) {
            this.startNode = choose(maze.nodes, rng);
        }
        return this.startNode;
    }
}

export class DepthFirstGenerator extends GrowingTreeGenerator {
    selectNode(nodes: Node[]): number {
        return nodes.length - 1;
    }
}

export class BreadthFirstGenerator extends GrowingTreeGenerator {
    selectNode(nodes: Node[]): number {
        return 0;
    }
}

export class RandomGrowingTreeGenerator extends GrowingTreeGenerator {
    selectNode(nodes: Node[]): number {
        return Math.floor(rng() * nodes.length);
    }
}

export class BranchingMazeGenerator extends GrowingTreeGenerator {

    branches: number;

    constructor(branches: number) {
        super();
        this.branches = branches;
    }

    selectNode(nodes: Node[]): number {
        // This used to be this:
        //
        // return Math.max(0, nodes.length - this.branches);
        //
        // but it has trouble moving through tight spaces when the maze is
        // almost full, as it never picks the most recently placed node.

        if (nodes.length <= this.branches) {
            return nodes.length - 1;
        }

        return nodes.length - this.branches;
    }
}
