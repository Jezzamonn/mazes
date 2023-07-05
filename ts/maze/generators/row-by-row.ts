import { lerp } from "../../lib/util";
import { Maze } from "../maze";
import { Node } from "../node";
import { Color, Colors, ObjectColorer } from "../renderers/colors";
import { MazeGenerator } from "./maze-generator";
import { rng } from "./rng";

/** Eller's algorithm. */
export class RowByRowGenerator extends MazeGenerator {

    allRowSets: Array<Array<Set<Node> | undefined>> = [];

    setColorer = new ObjectColorer();

    *generate(maze: Maze): Generator<void> {
        const firstRowSets: Array<Set<Node>> = [];
        this.allRowSets.push(firstRowSets);
        // In the first row, each node starts in its own set.
        for (let x = 0; x < maze.width; x++) {
            const newSet = new Set<Node>([maze.grid[0][x]]);
            firstRowSets.push(newSet);
            yield;
        }
        // Randomly connect nodes in the first row.
        yield* this.randomlyConnectAcrossRow(maze, 0, firstRowSets, 0.5);

        let prevRowSets = firstRowSets;
        for (let y = 1; y < maze.height - 1; y++) {
            const thisRowSets: Array<Set<Node> | undefined> = Array(maze.width).fill(undefined);
            this.allRowSets.push(thisRowSets);

            // Randomly connect nodes down.
            yield* this.randomlyConnectDown(maze, y, prevRowSets, thisRowSets);

            // Fill in any nodes that didn't get a connection down.
            yield* this.fillRemainingSets(maze, y, thisRowSets);

            // Now randomly connect nodes in this row.
            yield* this.randomlyConnectAcrossRow(maze, y, thisRowSets as Set<Node>[], 0.5);

            // Move on to the next row.
            prevRowSets = thisRowSets as Set<Node>[];
        }

        // Connect the last row.
        const lastRowSets: Array<Set<Node> | undefined> = Array(maze.width).fill(undefined);
        this.allRowSets.push(lastRowSets);

        // Randomly connect nodes down.
        yield* this.randomlyConnectDown(maze, maze.height - 1, prevRowSets, lastRowSets);

        // Fill in any nodes that didn't get a connection down.
        yield* this.fillRemainingSets(maze, maze.height - 1, lastRowSets);

        // Now connect all nodes that are not already connected.
        yield* this.randomlyConnectAcrossRow(maze, maze.height - 1, lastRowSets as Set<Node>[], 1);
    }

    *randomlyConnectAcrossRow(maze: Maze, y: number, rowSets: Set<Node>[], connectionChance: number): Generator<void> {
        for (let x = 0; x < maze.width - 1; x++) {
            // Can't connect nodes that are already connected somehow, indicated
            // by them being in the same set.
            if (rowSets[x] === rowSets[x + 1]) {
                continue;
            }
            if (rng() < connectionChance) {
                maze.grid[y][x]!.connect(maze.grid[y][x + 1]!);
                // Merge the sets
                for (const node of rowSets[x + 1]) {
                    rowSets[x].add(node);
                    rowSets[node.x] = rowSets[x];
                }
            }
            yield;
        }
    }

    *randomlyConnectDown(maze: Maze, y: number, prevRowSets: Set<Node>[], thisRowSets: Array<Set<Node> | undefined>): Generator<void> {
        // Randomly move down to the next row. Loop over each set in the previous row.
        for (const set of new Set(prevRowSets)) {
            // Randomly choose how many connections to make from this set.
            // Must have at least one connection.
            const numConnections = Math.floor(lerp(1, set.size, rng()));
            const moveDownSet = new Set<Node>();
            this.setColorer.copyObjectColor(set, moveDownSet);
            // Randomly connect nodes down.
            const nodes = Array.from(set);
            for (let i = 0; i < numConnections; i++) {
                const r = Math.floor(rng() * nodes.length);
                const topNode = nodes[r];
                const bottomNode = maze.grid[y][topNode.x];
                topNode.connect(bottomNode!);
                thisRowSets[topNode.x] = moveDownSet;
                moveDownSet.add(bottomNode!);

                nodes.splice(r, 1);
                yield;
            }
        }
    }

    *fillRemainingSets(maze: Maze, y: number, thisRowSets: Array<Set<Node> | undefined>): Generator<void> {
        // Fill the undefined sets in this row
        for (let x = 0; x < maze.width; x++) {
            if (thisRowSets[x] === undefined) {
                thisRowSets[x] = new Set<Node>([maze.grid[y][x]]);
                yield;
            }
        }
    }

    getNodeColor(node: Node): Color {
        const row = this.allRowSets[node.y];
        if (row === undefined) {
            return Colors.Transparent;
        }
        const set = row[node.x];
        if (set === undefined) {
            return Colors.Transparent;
        }

        return this.setColorer.getObjectColor(set);

    }
}