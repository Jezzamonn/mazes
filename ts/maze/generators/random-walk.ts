import { choose } from "../../lib/util";
import { Maze } from "../maze";
import { Node } from "../node";
import { Color } from "../renderers/colors";
import { MazeGenerator } from "./maze-generator";

export class RandomWalkGenerator extends MazeGenerator {

    current: Node | undefined;
    inMaze: Set<Node>;

    *generate(maze: Maze): Generator<void> {
        // Pick a random node for the start.
        this.current = choose(maze.nodes, Math.random);
        this.inMaze = new Set<Node>([this.current]);
        yield;

        while (this.inMaze.size < maze.nodes.length) {
            // Pick a random neighbor to move to. All neighbors are fair game.
            const neighbor = choose(this.current!.neighbors, Math.random);
            // If this neighbor isn't already in the maze, connect it to the current one.
            if (!this.inMaze.has(neighbor)) {
                this.current!.connect(neighbor);
                this.inMaze.add(neighbor);
            }
            // Move to the neighbor.
            this.current = neighbor;
            yield;
        }
    }

    getNodeColor(node: Node): Color {
        if (this.current === node) {
            return Color.Yellow;
        }
        if (this.inMaze.has(node)) {
            return Color.White;
        }
        return Color.Transparent;
    }
}