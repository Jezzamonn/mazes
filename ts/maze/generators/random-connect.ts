import { choose } from "../../lib/util";
import { Maze } from "../maze";
import { Node } from "../node";

export function randomConnect(maze: Maze) {
    // Just randomly connect nodes to start with
    for (const node of maze.nodes) {
        node.connect(choose(node.neighbors, Math.random));
    }
}