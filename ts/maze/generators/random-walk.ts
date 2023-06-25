import { choose } from "../../lib/util";
import { Maze } from "../maze";
import { Node } from "../node";
import { MazeGenerator } from "./maze-generator";

export class RandomWalkGenerator extends MazeGenerator {

    current: Node | undefined;

    *generate(maze: Maze): Generator<void> {
        // Pick a random node for the start.
        this.current = choose(maze.nodes, Math.random);
        const inMaze = new Set<Node>([this.current]);
        yield;

        while (inMaze.size < maze.nodes.length) {
            // Pick a random neighbor to move to. All neighbors are fair game.
            const neighbor = choose(this.current!.neighbors, Math.random);
            // If this neighbor isn't already in the maze, connect it to the current one.
            if (!inMaze.has(neighbor)) {
                this.current!.connect(neighbor);
                inMaze.add(neighbor);
            }
            // Move to the neighbor.
            this.current = neighbor;
            yield;
        }
    }

    getNodeColor(node: Node): string {
        if (this.current === node) {
            return "yellow";
        }
        return "white";
    }
}