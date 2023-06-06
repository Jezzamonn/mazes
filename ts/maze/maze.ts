import { Node } from "./node";

export class Maze {

    width: number = 0;
    height: number = 0;
    // 2D array of nodes
    nodes: (Node | undefined)[][] = [];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.nodes = [];
        let i = 0;
        for (let y = 0; y < height; y++) {
            this.nodes[y] = [];
            for (let x = 0; x < width; x++) {
                this.nodes[y][x] = new Node(i, x, y);
                i++;
            }
        }
    }

    generateMaze() {
        // Just randomly connect nodes to start with
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const node = this.nodes[y][x]!;

                const neighbors = [
                    this.nodes[y - 1]?.[x],
                    this.nodes[y + 1]?.[x],
                    this.nodes[y]?.[x - 1],
                    this.nodes[y]?.[x + 1],
                ].filter((node) => node !== undefined) as Node[];

                const randomIndex = Math.floor(Math.random() * neighbors.length);
                const randomNeighbor = neighbors[randomIndex];
                node.linkNeighbor(randomNeighbor);
            }
        }
    }

    render(context: CanvasRenderingContext2D) {
        const mazeRenderInfo = {
            fillWidth: 18,
            lineWidth: 2,
            spacing: 22,
        };

        for (const row of this.nodes) {
            for (const node of row) {
                node?.renderOutline(context, mazeRenderInfo);
            }
        }
        for (const row of this.nodes) {
            for (const node of row) {
                node?.renderFill(context, mazeRenderInfo);
            }
        }
    }
}