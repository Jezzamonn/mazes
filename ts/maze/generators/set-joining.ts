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
            const aSet = this.sets.get(a)!;
            const bSet = this.sets.get(b)!;
            // If a and b are in the same set, then connecting them would create a cycle.
            if (aSet === bSet) {
                continue;
            }
            // Otherwise, connect them.
            a.connect(b);
            // And merge the sets.
            // For the convenience of the algorithm, we'll merge the smaller set into the larger one.
            const mergedSet = aSet.size > bSet.size ? aSet : bSet;
            const removedSet = aSet.size > bSet.size ? bSet : aSet;

            for (const node of removedSet) {
                mergedSet.add(node);
                this.sets.set(node, mergedSet);
            }
            yield;
        }
        this.comparedNodes = undefined;
    }

    getNodeColor(node: Node): Color {
        if (this.sets == undefined) {
            return Colors.Transparent;
        }
        const set = this.sets.get(node);
        if (set == undefined) {
            return Colors.Transparent;
        }
        const hue = getSetHue(set);
        const color = Colors.withHue(hue);

        if (this.comparedNodes?.includes(node)) {
            return {
                lineColor: 'white',
                fillColor: color.fillColor
            }
        }
        return color;

        // if (this.comparedNodes?.map(n => this.sets?.get(n)?.has(node)).some(b => b ?? false)) {
        //     return Colors.Green;
        // }
        // // We can treat nodes that haven't been connected to anything as outside
        // // the maze. Not sure I like the visual effect of it though.
        // // if (node.connections.length == 0) {
        // //    return Colors.Transparent;
        // // }
        // return Colors.White;
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

const setHues: Map<any, number> = new Map();

function getSetHue(set: any): number {
    if (!setHues.has(set)) {
        setHues.set(set, rng());
    }
    return setHues.get(set)!;
}