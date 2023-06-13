import { choose } from "../../lib/util";
import { Maze } from "../maze";

export function generateBinaryMaze(maze: Maze) {
    for (const node of maze.nodes) {
        // Only consider the nodes to the left and above of this node.
        // Turns out filtering by the index is all we need to do this!
        const possibleConnections = node.neighbors.filter(n => n.index < node.index);
        if (possibleConnections.length === 0) {
            continue;
        }
        node.connect(choose(possibleConnections, Math.random));
    }
}