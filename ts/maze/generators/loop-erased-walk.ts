import { choose } from "../../lib/util";
import { Maze } from "../maze";
import { Node } from "../node";
import { MazeGenerator } from "./maze-generator";

export class LoopErasedWalkGenerator extends MazeGenerator {

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
                return;
            }
            // Pick random unvisited node for the position to be in.
            // According to Wikipedia: The algorithm remains unbiased no matter
            // how we choose the unvisited node.
            let current = choose(notInMaze, Math.random);
            // The path we're currently walking on. This will be updated as we walk,
            // and any loops will be erased.
            const currentPath = [current];

            // Walk until we hit the maze. This may take a while the first time it runs.
            while (true) {
                const neighbor = choose(current.neighbors, Math.random);
                if (this.inMaze.has(neighbor)) {
                    // We hit the maze. Stop walking.
                    currentPath.push(neighbor);
                    break;
                }
                // Otherwise, check if this neighbor is in the current path.
                const indexInPath = currentPath.indexOf(neighbor);
                if (indexInPath >= 0) {
                    // We've looped back to a previous node. Erase the loop.
                    currentPath.splice(indexInPath);
                }
                // Continue walking.
                currentPath.push(neighbor);
                current = neighbor;
            }

            // We reached the maze. Add everything in the current path.
            for (let i = 0; i < currentPath.length - 1; i++) {
                this.inMaze.add(currentPath[i]);
                currentPath[i].connect(currentPath[i + 1]);
            }
        }
    }

    // getNodeColor(node: Node): string {
    //     if (this.current === node) {
    //         return "yellow";
    //     }
    //     if (this.currentPath.includes(node)) {
    //         return "lightgreen";
    //     }
    //     return "white";
    // }

}