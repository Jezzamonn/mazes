import { choose } from "../../lib/util";
import { Maze } from "../maze";
import { Node } from "../node";
import { Color, Colors } from "../renderers/colors";
import { MazeGenerator } from "./maze-generator";
import { rng } from "./rng";

export class RandomWalkGenerator extends MazeGenerator {

    current: Node | undefined;
    inMaze: Set<Node>;
    startNode: Node | undefined;

    *generate(maze: Maze): Generator<void> {
        this.current = this.getStartNode(maze);
        this.inMaze = new Set<Node>([this.current]);
        yield;

        while (this.inMaze.size < maze.nodes.length) {
            // Pick a random neighbor to move to. All neighbors are fair game.
            const neighbor = choose(this.current!.neighbors, rng);
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
            return Colors.Yellow;
        }
        if (this.inMaze.has(node)) {
            return Colors.White;
        }
        return Colors.Transparent;
    }

    getStartNode(maze: Maze): Node {
        if (this.startNode == undefined) {
            this.startNode = choose(maze.nodes, rng);
        }
        return this.startNode;
    }
}