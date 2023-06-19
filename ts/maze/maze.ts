import { MazeGenerator } from "./generators/maze-generator";
import { Node } from "./node";

export class Maze {

    width: number = 0;
    height: number = 0;
    // 2D array of nodes
    grid: Node[][] = [];
    // Simple 1D array of nodes.
    nodes: Node[] = [];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.grid = [];
        let i = 0;
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                const node = new Node(i, x, y);
                this.grid[y][x] = node;
                this.nodes.push(node);
                i++;
            }
        }

        // Add all the neighbors
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                    const neighbor = this.grid[y + dy]?.[x + dx];
                    if (neighbor === undefined) {
                        continue;
                    }
                    this.grid[y][x]!.neighbors.push(neighbor);
                }
            }
        }
    }

    isFullyConnected(): boolean {
        const inMaze = new Set<Node>();
        const toVisit = [this.nodes[0]];
        while (toVisit.length > 0) {
            const node = toVisit.pop()!;
            inMaze.add(node);
            for (const connection of node.connections) {
                if (!inMaze.has(connection)) {
                    toVisit.push(connection);
                }
            }
        }
        return inMaze.size === this.nodes.length;
    }
}