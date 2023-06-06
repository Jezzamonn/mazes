import { MazeRenderInfo } from "./maze-render-info";

export class Node {
    index: number = 0;
    x: number = 0;
    y: number = 0;
    neighbors: Node[] = [];

    constructor(index: number, x: number, y: number) {
        this.index = index;
        this.x = x;
        this.y = y;
    }

    linkNeighbor(node: Node) {
        this.neighbors.push(node);
        node.neighbors.push(this);
    }

    renderOutline(context: CanvasRenderingContext2D, mazeRenderInfo: MazeRenderInfo) {
        context.beginPath();
        context.lineCap = 'square';
        context.lineWidth = mazeRenderInfo.fillWidth + mazeRenderInfo.lineWidth;
        context.strokeStyle = 'black';
        this.renderPaths(context, mazeRenderInfo);
    }

    renderFill(context: CanvasRenderingContext2D, mazeRenderInfo: MazeRenderInfo) {
        context.beginPath();
        context.lineCap = 'square';
        context.lineWidth = mazeRenderInfo.fillWidth;
        context.strokeStyle = 'white';
        this.renderPaths(context, mazeRenderInfo);
    }

    renderPaths(context: CanvasRenderingContext2D, mazeRenderInfo: MazeRenderInfo) {
        for (const neighbor of this.neighbors) {
            if (neighbor.index < this.index) {
                continue;
            }
            context.moveTo(this.x * mazeRenderInfo.spacing + mazeRenderInfo.spacing, this.y * mazeRenderInfo.spacing + mazeRenderInfo.spacing);
            context.lineTo(neighbor.x * mazeRenderInfo.spacing + mazeRenderInfo.spacing, neighbor.y * mazeRenderInfo.spacing + mazeRenderInfo.spacing);
        }
        context.stroke();
    }

}