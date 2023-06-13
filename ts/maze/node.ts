import { MazeRenderInfo } from "./maze-render-info";

export class Node {
    index: number = 0;
    x: number = 0;
    y: number = 0;
    neighbors: Node[] = [];
    connections: Node[] = [];

    constructor(index: number, x: number, y: number) {
        this.index = index;
        this.x = x;
        this.y = y;
    }

    connect(node: Node) {
        this.connections.push(node);
        node.connections.push(this);
    }

    render(context: CanvasRenderingContext2D, mazeRenderInfo: MazeRenderInfo) {
        context.beginPath();
        context.lineCap = 'square';
        context.lineWidth = mazeRenderInfo.thickness;
        context.strokeStyle = mazeRenderInfo.color;

        for (const connection of this.connections) {
            if (connection.index < this.index) {
                continue;
            }
            context.moveTo(this.x * mazeRenderInfo.spacing + mazeRenderInfo.spacing, this.y * mazeRenderInfo.spacing + mazeRenderInfo.spacing);
            context.lineTo(connection.x * mazeRenderInfo.spacing + mazeRenderInfo.spacing, connection.y * mazeRenderInfo.spacing + mazeRenderInfo.spacing);
        }
        context.stroke();
    }
}