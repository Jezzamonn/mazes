import { choose } from "../../lib/util";
import { Maze } from "../maze";
import { Node } from "../node";
import { MazeGenerator } from "./maze-generator";

export class RandomWalkGenerator extends MazeGenerator {

    *generate(maze: Maze): Generator<void> {
        // Pick a random node for the start.
        let current = choose(maze.nodes, Math.random);
        const inMaze = new Set<Node>([current]);
        yield;

        while (inMaze.size < maze.nodes.length) {
            // Pick a random neighbor to move to. All neighbors are fair game.
            const neighbor = choose(current.neighbors, Math.random);
            // If this neighbor isn't already in the maze, connect it to the current one.
            if (!inMaze.has(neighbor)) {
                current.connect(neighbor);
                inMaze.add(neighbor);
            }
            // Move to the neighbor.
            current = neighbor;
            yield;
        }
    }

    // getNodeColor(node: Node): string {
    //     if (this.current === node) {
    //         return "yellow";
    //     }
    //     return "white";
    // }
}