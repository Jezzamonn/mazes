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

    disconnect(node: Node) {
        this.connections.splice(this.connections.indexOf(node), 1);
        node.connections.splice(node.connections.indexOf(this), 1);
    }
}