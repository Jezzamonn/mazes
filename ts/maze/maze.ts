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

    render(context: CanvasRenderingContext2D) {
        const fillWidth = 18;
        const lineWidth = 2;
        const spacing = 22;

        for (const node of this.nodes) {
            node?.render(context, { spacing, thickness: fillWidth + lineWidth, color: 'black' });
        }
        for (const node of this.nodes) {
            node?.render(context, { spacing, thickness: fillWidth, color: 'white' });
        }
    }
}