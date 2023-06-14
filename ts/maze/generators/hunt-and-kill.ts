import { choose } from "../../lib/util";
import { Maze } from "../maze";
import { Node } from "../node";
import { MazeGenerator } from "./maze-generator";

export class HuntAndKillGenerator implements MazeGenerator {

    generate(maze: Maze): void {
        const inMaze = new Set<Node>();
        let current: Node | undefined = maze.nodes[0];
        inMaze.add(current);

        while (true) {
            const possibleConnections = current!.neighbors.filter(
                (n) => !inMaze.has(n)
            );
            if (possibleConnections.length === 0) {
                // We've hit a dead end. Time to hunt!
                current = this.findNewStart(maze, inMaze);
                if (current === null) {
                    // We're done!
                    return;
                }
                continue;
            }

            const connection = choose(possibleConnections, Math.random);
            current!.connect(connection);
            inMaze.add(connection);
            current = connection;
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


}