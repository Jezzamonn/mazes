import { choose } from "../../lib/util";
import { Maze } from "../maze";
import { Node } from "../node";
import { MazeGenerator } from "./maze-generator";

export class LoopErasedWalkGenerator extends MazeGenerator {

    inMaze: Set<Node> = new Set();
    current: Node | undefined;

    // The path we're currently walking on. This will be updated as we walk,
    // and any loops will be erased.
    currentPath: Node[] = [];

    iterate(maze: Maze): void {
        if (this.isDone(maze)) {
            return;
        }

        if (this.inMaze.size == 0) {
            // Pick a random node for the start.
            const start = choose(maze.nodes, Math.random);
            this.inMaze.add(start);
            return;
        }

        if (this.current == undefined) {
            // Pick random unvisited node for the position to be in.

            // Fun fact: The algorithm remains unbiased no matter how we choose
            // the unvisited node.
            const notInMaze = maze.nodes.filter((n) => !this.inMaze.has(n));
            this.current = choose(notInMaze, Math.random);
            this.currentPath.push(this.current);
            return;
        }

        // Pick a random neighbor to move to.
        const neighbor = choose(this.current.neighbors, Math.random);
        if (this.inMaze.has(neighbor)) {
            this.currentPath.push(neighbor);
            // We reached the maze. Add everything in the current path to the
            // maze, and start a new path.
            for (let i = 0; i < this.currentPath.length - 1; i++) {
                this.inMaze.add(this.currentPath[i]);
                this.currentPath[i].connect(this.currentPath[i + 1]);
            }

            this.currentPath = [];
            this.current = undefined;
            return;
        }

        // Otherwise, check if this neighbor is in the current path.
        const indexInPath = this.currentPath.indexOf(neighbor);
        if (indexInPath >= 0) {
            // We've looped back to a previous node. Erase the loop.
            this.currentPath = this.currentPath.slice(0, indexInPath);
        }

        this.currentPath.push(neighbor);
        this.current = neighbor;
    }

    isDone(maze: Maze): boolean {
        return this.inMaze.size >= maze.nodes.length;
    }

    getNodeColor(node: Node): string {
        if (this.current === node) {
            return "yellow";
        }
        if (this.currentPath.includes(node)) {
            return "lightgreen";
        }
        return "white";
    }

}