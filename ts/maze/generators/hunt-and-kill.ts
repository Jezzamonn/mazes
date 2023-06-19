import { choose } from "../../lib/util";
import { Maze } from "../maze";
import { Node } from "../node";
import { MazeGenerator } from "./maze-generator";

export class HuntAndKillGenerator extends MazeGenerator {
    inMaze: Set<Node> = new Set();
    current: Node | undefined;

    *generate(maze: Maze): Generator<void> {
        this.current = maze.nodes[0];
        this.inMaze.add(this.current);
        yield;

        while (this.current != undefined) {
            const possibleConnections = this.current!.neighbors.filter(
                (n) => !this.inMaze.has(n)
            );
            if (possibleConnections.length > 0) {
                const connection = choose(possibleConnections, Math.random);
                this.current!.connect(connection);
                this.inMaze.add(connection);
                this.current = connection;
            } else {
                // We've hit a dead end. Time to hunt!
                this.current = this.findNewStart(maze, this.inMaze);

                if (this.current != undefined) {
                    // Connect this new start to the maze.
                    const inMazeNeighbors = this.current.neighbors.filter((n) =>
                        this.inMaze.has(n)
                    );
                    this.current.connect(choose(inMazeNeighbors, Math.random));
                    this.inMaze.add(this.current);
                }
                // If this.current is undefined, then the generation is complete. In
                // this implementation, the check happens in isDone(). If this was
                // written in one loop, we could end the loop here.
                break;;
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

    getNodeColor(node: Node): string {
        if (this.current === node) {
            return "yellow";
        }
        return "white";
    }
}
