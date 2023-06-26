import { choose } from "../../lib/util";
import { Maze } from "../maze";
import { Node } from "../node";
import { MazeGenerator } from "./maze-generator";

export class LoopErasedWalkGenerator extends MazeGenerator {

    current: Node | undefined;
    currentPath: Node[] = [];
    inMaze: Set<Node> = new Set();

    * generate(maze: Maze): Generator<void> {
        // Pick a random node for the start.
        const start = choose(maze.nodes, Math.random);
        this.inMaze.add(start);
        yield;

        while (true) {
            const notInMaze = maze.nodes.filter((n) => !this.inMaze.has(n));
            if (notInMaze.length == 0) {
                // Every node is in the maze. We're done!
                break;
            }
            // Pick random unvisited node for the position to be in.
            // According to Wikipedia: The algorithm remains unbiased no matter
            // how we choose the unvisited node.
            this.current = choose(notInMaze, Math.random);
            // The path we're currently walking on. This will be updated as we walk,
            // and any loops will be erased.
            this.currentPath = [this.current];
            yield;

            // Walk until we hit the maze. This may take a while the first time it runs.
            while (true) {
                this.current = choose(this.current!.neighbors, Math.random);
                if (this.inMaze.has(this.current)) {
                    // We hit the maze. Stop walking.
                    this.currentPath.push(this.current);
                    yield;
                    break;
                }
                // Otherwise, check if this neighbor is in the current path.
                const indexInPath = this.currentPath.indexOf(this.current);
                if (indexInPath >= 0) {
                    // We've looped back to a previous node. Erase the loop.
                    this.currentPath.splice(indexInPath);
                }
                // Continue walking.
                this.currentPath.push(this.current);
                yield;
            }

            // We reached the maze. Add everything in the current path.
            for (let i = 0; i < this.currentPath.length - 1; i++) {
                this.inMaze.add(this.currentPath[i]);
                this.currentPath[i].connect(this.currentPath[i + 1]);
                yield;
            }
        }

        this.current = undefined;
        this.currentPath = [];
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