import { choose } from "../../lib/util";
import { Maze } from "../maze";
import { Node } from "../node";
import { MazeGenerator } from "./maze-generator";

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

    /**
     * Returns the index of the next node to try to add a new connection from.
    */
    abstract selectNode(nodes: Node[]): number;

    iterate(maze: Maze): void {
        if (this.isDone(maze)) {
            return;
        }

        if (this.inMaze.size === 0) {
            this.toVisit.push(maze.nodes[0]);
            this.inMaze.add(maze.nodes[0]);
            return;
        }

        const index = this.selectNode(this.toVisit);
        const node = this.toVisit[index];

        const possibleConnections = node.neighbors.filter(
            (n) => !this.inMaze.has(n)
        );
        if (possibleConnections.length === 0) {
            // This node has no unvisited neighbors. Remove it from the list.
            this.toVisit.splice(index, 1);
            return;
        }

        const connection = choose(possibleConnections, Math.random);
        node.connect(connection);
        this.inMaze.add(connection);

        this.toVisit.push(connection);
    }

    isDone(maze: Maze): boolean {
        // The algoirithm finishes when toVisit is empty. But given the way we
        // structured the code, we also need to check that we've started! So we
        // also check that inMaze is not empty.
        return this.toVisit.length === 0 && this.inMaze.size > 0;
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
