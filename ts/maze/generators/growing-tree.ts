import { choose } from "../../lib/util";
import { Maze } from "../maze";
import { Node } from "../node";
import { MazeGenerator } from "./maze-generator";

abstract class GrowingTreeGenerator implements MazeGenerator {

    /**
     * Returns the index of the next node to try to add a new connection from.
    */
    abstract selectNode(nodes: Node[]): number;

    generate(maze: Maze): void {
        const toVisit = [maze.nodes[0]];
        const inMaze = new Set(toVisit);
        // The order we pick to visit changes the vibe of the mazes that are
        // generated. Start with just picking from the end (equivalent to the
        // recursive backtracker algorithm).

        // Another slight nuance would be to sort the node and potential
        // connection in the toVisit array. But for now we'll just pick a random
        // connection from that node.

        // TODO: Think about how this could be animated. (I guess just store the
        // state in this class and have a function that does one iteration).
        while (toVisit.length > 0) {
            const index = this.selectNode(toVisit);
            const node = toVisit[index];

            const possibleConnections = node.neighbors.filter(
                (n) => !inMaze.has(n)
            );
            if (possibleConnections.length === 0) {
                toVisit.splice(index, 1);
                continue;
            }

            const connection = choose(possibleConnections, Math.random);
            node.connect(connection);
            inMaze.add(connection);

            toVisit.push(connection);
        }
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
        return Math.floor(Math.random() * nodes.length);
    }
}

export class BranchingMazeGenerator extends GrowingTreeGenerator {

    branches: number;

    constructor(branches: number) {
        super();
        this.branches = branches;
    }

    selectNode(nodes: Node[]): number {
        return Math.max(0, nodes.length - this.branches);
    }
}
