import { Maze } from "../maze";
import { Node } from "../node";
import { Color, Colors } from "../renderers/colors";
import { MazeGenerator } from "./maze-generator";
import { rng } from "./rng";

// Krushkal's algorithm.
export class SetJoiningGenerator extends MazeGenerator {

    sets: Map<Node, Set<Node>> | undefined;
    comparedNodes: [Node, Node] | undefined;

    * generate(maze: Maze): Generator<void> {
        // Start with each node in its own set.
        this.sets = new Map<Node, Set<Node>>(maze.nodes.map(n => [n, new Set([n])] as const));
        // To avoid duplicating connections, only add connections with a node from a smaller index to a larger index.
        const allPotentialConnections =
            maze.nodes.flatMap(n => n.neighbors.filter(c => c.index > n.index).map(c => [n, c] as const));
        // Shuffle the connections.
        allPotentialConnections.sort(() => rng() - 0.5);

        for (const [a, b] of allPotentialConnections) {
            this.comparedNodes = [a, b];
            yield;
            // If a and b are in the same set, then connecting them would create a cycle.
            if (this.sets.get(a) === this.sets.get(b)) {
                continue;
            }
            // Otherwise, connect them.
            a.connect(b);
            // And merge the sets.
            const mergedSet = this.sets.get(a)!;
            const removedSet = this.sets.get(b)!;

            for (const node of removedSet) {
                mergedSet.add(node);
                this.sets.set(node, mergedSet);
            }
            yield;
        }
        this.comparedNodes = undefined;
    }

    getNodeColor(node: Node): Color {
        if (this.comparedNodes?.includes(node)) {
            return Colors.Yellow;
        }
        if (this.comparedNodes?.map(n => this.sets?.get(n)?.has(node)).some(b => b ?? false)) {
            return Colors.Green;
        }
        // We can treat nodes that haven't been connected to anything as outside
        // the maze. Not sure I like the visual effect of it though.
        // if (node.connections.length == 0) {
        //    return Colors.Transparent;
        // }
        return Colors.White;
    }

    getStartNode(maze: Maze): Node | undefined {
        if (this.sets == undefined) {
            return undefined;
        }
        const largestSet = [...this.sets!.values()].reduce((a, b) => a.size > b.size ? a : b);
        // The node with the first index within the largest set.
        return [...largestSet].reduce((a, b) => a.index < b.index ? a : b);
    }
}