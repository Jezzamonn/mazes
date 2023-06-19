import { choose } from "../../lib/util";
import { Maze } from "../maze";
import { Node } from "../node";
import { MazeGenerator } from "./maze-generator";

export class RandomWalkGenerator extends MazeGenerator {

    inMaze: Set<Node> = new Set();
    current: Node | undefined;

    iterate(maze: Maze): void {
        if (this.isDone(maze)) {
            return;
        }

        if (this.current == undefined) {
            // Pick a random node for the start.
            this.current = choose(maze.nodes, Math.random);
            this.inMaze.add(this.current);
            return;
        }

        // Pick a random neighbor to move to. All neighbors are fair game.
        const neighbor = choose(this.current.neighbors, Math.random);
        // If this neighbor isn't already in the maze, connect it to the current one.
        if (!this.inMaze.has(neighbor)) {
            this.current.connect(neighbor);
            this.inMaze.add(neighbor);
        }
        // Move to the neighbor.
        this.current = neighbor;
    }

    isDone(maze: Maze): boolean {
        return this.inMaze.size >= maze.nodes.length;
    }

    getNodeColor(node: Node): string {
        if (this.current === node) {
            return "yellow";
        }
        return "white";
    }
}