import { choose } from "../../lib/util";
import { Maze } from "../maze";
import { MazeGenerator } from "./maze-generator";

export class GrowingTreeGenerator implements MazeGenerator {
    generate(maze: Maze): void {
        const visited = new Set();
        const toVisit = [maze.nodes[0]];
        // The order we pick to visit changes the vibe of the mazes that are
        // generated. Start with just picking from the end (equivalent to the
        // recursive backtracker algorithm).

        // Another slight nuance would be to sort the node and potential
        // connection in the toVisit array. But for now we'll just pick a random
        // connection from that node.

        // TODO: Think about how this could be animated. (I guess just store the
        // state in this class and have a function that does one iteration).
        while (toVisit.length > 0) {
            const index = toVisit.length - 1;
            const node = toVisit[index];
            visited.add(node);

            const possibleConnections = node.neighbors.filter(
                (n) => !visited.has(n)
            );
            if (possibleConnections.length === 0) {
                toVisit.splice(index, 1);
                continue;
            }

            const connection = choose(possibleConnections, Math.random);
            node.connect(connection);
            toVisit.push(connection);
        }
    }
}
