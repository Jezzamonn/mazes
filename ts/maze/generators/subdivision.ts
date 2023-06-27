import { lerp } from "../../lib/util";
import { Maze } from "../maze";
import { Node } from "../node";
import { Color } from "../renderers/colors";
import { MazeGenerator } from "./maze-generator";
import { rng } from "./rng";

export class SubdivisionGenerator extends MazeGenerator {

    toSplit: Bounds[] = [];
    currentBounds: Bounds | undefined;

    *generate(maze: Maze): Generator<void> {
        // This algorithm makes walls instead of corridors. So to start with, connect every node!!
        // Also calculate the bounds of the maze.
        const bounds = new Bounds();
        for (const node of maze.nodes) {
            for (const neighbor of node.neighbors) {
                node.connect(neighbor);
                bounds.extend(node.x, node.y);
            }
        }

        const toSplit = [bounds];
        yield;

        while (toSplit.length > 0) {
            const section = toSplit.pop()!;
            this.currentBounds = section;
            const newSections = yield* this.splitSection(maze, section);
            toSplit.push(...newSections);
            yield;
        }
    }

    *splitSection(maze: Maze, bounds: Bounds): Generator<void, Bounds[]> {
        const possibleSplits = (bounds.width - 1) + (bounds.height - 1);
        // No more splitting can be done!
        if (possibleSplits === 0) {
            return [];
        }
        // Choose a random split
        const splitIndex = Math.floor(rng() * possibleSplits);
        if (splitIndex < bounds.width - 1) {
            // Split horizontally
            const splitX = bounds.minX! + splitIndex;
            for (let y = bounds.minY!; y <= bounds.maxY!; y++) {
                const leftNode = maze.grid[y][splitX];
                const rightNode = maze.grid[y][splitX + 1];
                leftNode.disconnect(rightNode);
                yield;
            }
            // Connect a random node between the two subdivisions
            const connectionY = bounds.minY! + Math.floor(rng() * bounds.height);
            const leftNode = maze.grid[connectionY][splitX];
            const rightNode = maze.grid[connectionY][splitX + 1];
            leftNode.connect(rightNode);
            yield;

            return bounds.splitAtX(splitX);
        }
        else {
            // Split vertically
            const splitY = bounds.minY! + splitIndex - (bounds.width - 1);
            for (let x = bounds.minX!; x <= bounds.maxX!; x++) {
                const topNode = maze.grid[splitY][x];
                const bottomNode = maze.grid[splitY + 1][x];
                topNode.disconnect(bottomNode);
                yield;
            }
            // Connect a random node between the two subdivisions
            const connectionX = bounds.minX! + Math.floor(rng() * bounds.width);
            const topNode = maze.grid[splitY][connectionX];
            const bottomNode = maze.grid[splitY + 1][connectionX];
            topNode.connect(bottomNode);
            yield;

            return bounds.splitAtY(splitY);
        }
    }

    getNodeColor(node: Node): Color {
        if (this.currentBounds?.contains(node.x, node.y) ?? false) {
            return Color.Green;
        }
        return Color.White;
    }
}

class Bounds {
    minX: number | undefined;
    maxX: number | undefined;
    minY: number | undefined;
    maxY: number | undefined;

    extend(x: number, y: number) {
        if (this.minX == undefined || x < this.minX) {
            this.minX = x;
        }
        if (this.maxX == undefined || x > this.maxX) {
            this.maxX = x;
        }
        if (this.minY == undefined || y < this.minY) {
            this.minY = y;
        }
        if (this.maxY == undefined || y > this.maxY) {
            this.maxY = y;
        }
    }

    copy(): Bounds {
        const copy = new Bounds();
        copy.minX = this.minX;
        copy.maxX = this.maxX;
        copy.minY = this.minY;
        copy.maxY = this.maxY;
        return copy;
    }

    contains(x: number, y: number): boolean {
        return x >= this.minX! && x <= this.maxX! && y >= this.minY! && y <= this.maxY!;
    }

    get width(): number {
        return this.maxX! - this.minX! + 1;
    }

    get height(): number {
        return this.maxY! - this.minY! + 1;
    }

    splitAtX(x: number): [Bounds, Bounds] {
        const left = this.copy();
        left.maxX = x;
        const right = this.copy();
        right.minX = x + 1;
        return [left, right];
    }

    splitAtY(y: number): [Bounds, Bounds] {
        const top = this.copy();
        top.maxY = y;
        const bottom = this.copy();
        bottom.minY = y + 1;
        return [top, bottom];
    }
}