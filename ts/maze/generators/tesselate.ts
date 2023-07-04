import { Maze } from "../maze";
import { Node } from "../node";
import { Color, Colors } from "../renderers/colors";
import { MazeGenerator } from "./maze-generator";
import { rng } from "./rng";

interface Rect {
    left: number;
    top: number;
    width: number;
    height: number;
}

export class TessellateGenerator extends MazeGenerator {
    filledSize: { x: number; y: number } = { x: 0, y: 0 };
    partiallyFilledSize: { x: number; y: number } = { x: 0, y: 0 };

    lastToRect: Rect | undefined;

    lastFromNode: Node | undefined;
    lastToNode: Node | undefined;

    *generate(maze: Maze): Generator<void> {
        // Copy and connect until we've done it for the size of the maze.
        this.filledSize = {
            x: 1,
            y: 1,
        };
        const widthFactors = factorize(maze.width);
        const heightFactors = factorize(maze.height);

        // let startDimension: "x" | "y" = rng() < 0.5 ? "x" : "y";
        // if (widthFactors.length > heightFactors.length) {
        //     startDimension = "x";
        // }
        // else if (widthFactors.length < heightFactors.length) {
        //     startDimension = "y";
        // }

        // TODO: numCopies is not a good name because it's actually 1 more than the number of copies.
        // e.g. when numCopies is 2 we should only copy once.
        const copiesToDo: { dimension: "x" | "y"; numCopies: number }[] = [];

        while (widthFactors.length > 0 && heightFactors.length > 0) {
            copiesToDo.push({
                dimension: "x",
                numCopies: widthFactors.shift()!
            });
            copiesToDo.push({
                dimension: "y",
                numCopies: heightFactors.shift()!,
            });
        }
        while (widthFactors.length > 0) {
            copiesToDo.push({
                dimension: "x",
                numCopies: widthFactors.shift()!
            });
        }
        while (heightFactors.length > 0) {
            copiesToDo.push({
                dimension: "y",
                numCopies: heightFactors.shift()!,
            });
        }

        while (copiesToDo.length > 0) {
            const from: Rect = {
                left: 0,
                top: 0,
                width: this.filledSize.x,
                height: this.filledSize.y,
            };

            const { dimension, numCopies } = copiesToDo.shift()!;
            for (let i = 1; i < numCopies; i++) {
                const to: Rect = {
                    left: dimension === "x" ? this.filledSize.x * i : 0,
                    top: dimension === "y" ? this.filledSize.y * i : 0,
                    width: this.filledSize.x,
                    height: this.filledSize.y,
                };
                this.lastToRect = to;
                this.partiallyFilledSize.x = Math.max(this.partiallyFilledSize.x, to.left + to.width);
                this.partiallyFilledSize.y = Math.max(this.partiallyFilledSize.y, to.top + to.height);
                yield* this.copySection(maze, from, to);
            }
            for (let i = 1; i < numCopies; i++) {
                const to: Rect = {
                    left: dimension === "x" ? this.filledSize.x * i : 0,
                    top: dimension === "y" ? this.filledSize.y * i : 0,
                    width: this.filledSize.x,
                    height: this.filledSize.y,
                };
                this.lastToRect = to;
                // Connect the sections together at a random wall.
                if (dimension === "x") {
                    const randomY = Math.floor(rng() * from.height);
                    const leftNode = maze.grid[randomY][to.left - 1];
                    const rightNode = maze.grid[randomY][to.left];
                    leftNode.connect(rightNode);
                } else {
                    const randomX = Math.floor(rng() * from.width);
                    const topNode = maze.grid[to.top - 1][randomX];
                    const bottomNode = maze.grid[to.top][randomX];
                    topNode.connect(bottomNode);
                }
                yield;
            }

            if (dimension === "x") {
                this.filledSize.x *= numCopies;
            } else {
                this.filledSize.y *= numCopies;
            }
        }
    }

    *copySection(maze: Maze, from: Rect, to: Rect): Generator<void> {
        if (to.width != from.width || to.height != from.height) {
            throw new Error("Can't copy sections of different sizes.");
        }
        // From and to must be within the maze bounds (not asserted though).

        // Copy everything to the next section.
        for (let y = 0; y < from.height; y++) {
            for (let x = 0; x < from.width; x++) {
                let fromX = from.left + x;
                let fromY = from.top + y;
                let toX = to.left + x;
                let toY = to.top + y;
                let fromNode = maze.grid[fromY][fromX];
                let toNode = maze.grid[toY][toX];
                this.lastFromNode = fromNode;
                this.lastToNode = toNode;
                yield;

                // Connect the new node like the existing node is connected.
                for (const connection of fromNode.connections) {
                    const fromDX = connection.x - fromNode.x;
                    const fromDY = connection.y - fromNode.y;
                    // Try to find a neighbor of the new node that's in the
                    // same direction as this connection for the old node.
                    for (const toNodeNeighbor of toNode.neighbors) {
                        const toDX = toNodeNeighbor.x - toNode.x;
                        const toDY = toNodeNeighbor.y - toNode.y;

                        // Ok to use exact equality here because so far all
                        // the positions are integers.
                        if (fromDX === toDX && fromDY === toDY) {
                            toNode.connect(toNodeNeighbor);
                            break;
                        }
                    }
                }
                yield;
            }
        }
    }

    getNodeColor(node: Node): Color {
        if (this.filledSize == null) {
            return Colors.Transparent;
        }

        if (this.lastFromNode === node || this.lastToNode === node) {
            return Colors.Yellow;
        }
        if (
            this.lastToRect &&
            node.x >= this.lastToRect.left &&
            node.x < this.lastToRect.left + this.lastToRect.width &&
            node.y >= this.lastToRect.top &&
            node.y < this.lastToRect.top + this.lastToRect.height
        ) {
            return Colors.Green;
        }
        if (node.x < this.partiallyFilledSize.x && node.y < this.partiallyFilledSize.y) {
            return Colors.White;
        }
        return Colors.Transparent;
    }
}

function factorize(num: number): number[] {
    const factors: number[] = [];
    for (let i = 2; i <= num; i++) {
        while (num % i === 0) {
            factors.push(i);
            num /= i;
        }
    }
    return factors;
}
