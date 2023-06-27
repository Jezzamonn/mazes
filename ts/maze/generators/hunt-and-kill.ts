import { choose } from "../../lib/util";
import { Maze } from "../maze";
import { Node } from "../node";
import { Color } from "../renderers/colors";
import { MazeGenerator } from "./maze-generator";
import { rng } from "./rng";

export class HuntAndKillGenerator extends MazeGenerator {
    inMaze: Set<Node> = new Set();
    current: Node | undefined;

    *generate(maze: Maze): Generator<void> {
        this.current = maze.nodes[0];
        this.inMaze.add(this.current);
        yield;

        while (true) {
            const possibleConnections = this.current!.neighbors.filter(
                (n) => !this.inMaze.has(n)
            );
            if (possibleConnections.length > 0) {
                const connection = choose(possibleConnections, rng);
                this.current!.connect(connection);
                this.inMaze.add(connection);
                this.current = connection;
                yield;
            } else {
                // We've hit a dead end. Time to hunt!
                this.current = this.findNewStart(maze, this.inMaze);

                if (this.current != undefined) {
                    // Connect this new start to the maze.
                    const inMazeNeighbors = this.current.neighbors.filter((n) =>
                        this.inMaze.has(n)
                    );
                    this.current.connect(choose(inMazeNeighbors, rng));
                    this.inMaze.add(this.current);
                    yield;
                }
                else {
                    // If this.current is undefined, then the generation is complete.
                    break;
                }
            }
        }
    }

    /**
     * Loop over all the nodes in the maze and find the first one that:
     * - Is not in the maze
     * - Has a neighbor that is in the maze
     */
    private findNewStart(maze: Maze, inMaze: Set<Node>): Node | undefined {
        for (const node of maze.nodes) {
            if (inMaze.has(node)) {
                continue;
            }
            if (node.neighbors.some((n) => inMaze.has(n))) {
                return node;
            }
        }
        return undefined;
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
