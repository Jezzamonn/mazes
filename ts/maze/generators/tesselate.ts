import { Maze } from "../maze";
import { Node } from "../node";
import { Color } from "../renderers/colors";
import { MazeGenerator } from "./maze-generator";
import { rng } from "./rng";

export class TessellateGenerator extends MazeGenerator {
    dimensionToCopy: "x" | "y" = "x";
    filledDimensions: { x: number; y: number } | undefined;

    lastCopiedExisting: Node | undefined;
    lastCopiedNew: Node | undefined;

    get sizeAfterCopying(): { x: number; y: number } | undefined {
        if (this.filledDimensions == undefined) {
            return undefined;
        }
        if (this.dimensionToCopy === "x") {
            return {
                x: this.filledDimensions.x * 2,
                y: this.filledDimensions.y,
            };
        }
        else {
            return {
                x: this.filledDimensions.x,
                y: this.filledDimensions.y * 2,
            };
        }
    }

    *generate(maze: Maze): Generator<void> {
        // Copy and connect until we've done it for the size of the maze.
        this.filledDimensions = {
            x: 1,
            y: 1,
        };
        while (true) {
            yield* this.copySection(maze, this.filledDimensions.x, this.filledDimensions.y, this.dimensionToCopy);
            yield;
            // Connect the sections together at a random wall.
            if (this.dimensionToCopy === "x") {
                const randomY = Math.floor(rng() * this.filledDimensions.y);
                const leftNode = maze.grid[randomY][this.filledDimensions.x - 1];
                const rightNode = maze.grid[randomY][this.filledDimensions.x];
                leftNode.connect(rightNode);
            } else {
                const randomX = Math.floor(rng() * this.filledDimensions.x);
                const topNode = maze.grid[this.filledDimensions.y - 1][randomX];
                const bottomNode = maze.grid[this.filledDimensions.y][randomX];
                topNode.connect(bottomNode);
            }
            yield;

            this.filledDimensions = this.sizeAfterCopying!;
            // Clamp to the size of the maze.
            this.filledDimensions.x = Math.min(this.filledDimensions.x, maze.width);
            this.filledDimensions.y = Math.min(this.filledDimensions.y, maze.height);

            const hasFilledWidth = this.filledDimensions.x === maze.width;
            const hasFilledHeight = this.filledDimensions.y === maze.height;

            if (hasFilledWidth && hasFilledHeight) {
                break;
            }
            else if (hasFilledWidth) {
                this.dimensionToCopy = "y";
            }
            else if (hasFilledHeight) {
                this.dimensionToCopy = "x";
            }
            else {
                this.dimensionToCopy = this.dimensionToCopy === "x" ? "y" : "x";
            }
        }
    }

    *copySection(maze: Maze, width: number, height: number, dimensionToCopy: "x" | "y"): Generator<void> {
        // Copy everything to the next section.
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let nx = x;
                let ny = y;
                if (dimensionToCopy === "x") {
                    nx += width;
                } else {
                    ny += height;
                }
                // Bound check nx and ny
                if (nx >= maze.width || ny >= maze.height) {
                    continue;
                }
                const existingNode = maze.grid[y][x];
                const newNode = maze.grid[ny][nx];
                this.lastCopiedExisting = existingNode;
                this.lastCopiedNew = newNode;
                yield;

                // Connect the new node like the existing node is connected.
                for (const connection of existingNode.connections) {
                    const edx = connection.x - existingNode.x;
                    const edy = connection.y - existingNode.y;
                    // Try to find a neighbor of the new node that's in the
                    // same direction as this connection for the old node.
                    for (const neighbor of newNode.neighbors) {
                        const ndx = neighbor.x - newNode.x;
                        const ndy = neighbor.y - newNode.y;
                        // Ok to use exact equality here because so far all
                        // the positions are integers.
                        if (ndx === edx && ndy === edy) {
                            newNode.connect(neighbor);
                            break;
                        }
                    }
                }
                yield;
            }
        }
    }


    getNodeColor(node: Node): Color {
        if (this.filledDimensions == null) {
            return Color.Transparent;
        }

        if (this.lastCopiedExisting === node || this.lastCopiedNew === node) {
            return Color.Yellow;
        }
        if (node.x < this.filledDimensions.x && node.y < this.filledDimensions.y) {
            return Color.White;
        }
        const copySize = this.sizeAfterCopying!;
        if (node.x < copySize.x && node.y < copySize.y) {
            return Color.Green;
        }
        return Color.Transparent;
    }
}
