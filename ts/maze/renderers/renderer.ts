import { lerp } from "../../lib/util";
import { MazeGenerator } from "../generators/maze-generator";
import { Maze } from "../maze";
import { MazeRenderInfo } from "./maze-render-info";
import { Node } from "../node";

export class Renderer {
    fillWidth: number;
    lineWidth: number;
    spacing: number;

    constructor({fillWidth, lineWidth, spacing}: {
        fillWidth: number,
        lineWidth: number,
        spacing: number,}) {
            this.fillWidth = fillWidth;
            this.lineWidth = lineWidth;
            this.spacing = spacing;
        }

    render(
        context: CanvasRenderingContext2D,
        maze: Maze,
        generator: MazeGenerator
    ) {
        context.save();
        context.translate(this.spacing, this.spacing);

        for (const node of maze.nodes) {
            const color = generator.getNodeColor(node);

            this.renderNode(context, node, {
                spacing: this.spacing,
                thickness: this.fillWidth + this.lineWidth,
                color: color.lineColor,
            });
        }
        for (const node of maze.nodes) {
            const color = generator.getNodeColor(node);
            this.renderNode(context, node, {
                spacing: this.spacing,
                thickness: this.fillWidth,
                color: color.fillColor,
            });
        }

        context.restore();
    }

    // Renders the base color of the node, along with half of the lines to the other nodes.
    renderNode(context: CanvasRenderingContext2D, node: Node, mazeRenderInfo: MazeRenderInfo) {
        // First draw the connections
        this.renderHalfConnections(context, node, mazeRenderInfo);
        this.renderNodeColor(context, node, mazeRenderInfo);
    }

    renderHalfConnections(
        context: CanvasRenderingContext2D,
        node: Node,
        mazeRenderInfo: MazeRenderInfo
    ) {
        context.beginPath();
        context.lineCap = "butt";
        context.lineWidth = mazeRenderInfo.thickness;
        context.strokeStyle = mazeRenderInfo.color;

        for (const connection of node.connections) {
            const destX = lerp(node.x, connection.x, 0.501);
            const destY = lerp(node.y, connection.y, 0.501);
            context.moveTo(
                node.x * mazeRenderInfo.spacing,
                node.y * mazeRenderInfo.spacing
            );
            context.lineTo(
                destX * mazeRenderInfo.spacing,
                destY * mazeRenderInfo.spacing
            );
        }
        context.stroke();
    }

    renderNodeColor(
        context: CanvasRenderingContext2D,
        node: Node,
        mazeRenderInfo: MazeRenderInfo
    ) {
        context.beginPath();
        context.fillStyle = mazeRenderInfo.color;
        context.fillRect(
            node.x * mazeRenderInfo.spacing - mazeRenderInfo.thickness / 2,
            node.y * mazeRenderInfo.spacing - mazeRenderInfo.thickness / 2,
            mazeRenderInfo.thickness,
            mazeRenderInfo.thickness
        );
        // context.arc(
        //     node.x * mazeRenderInfo.spacing,
        //     node.y * mazeRenderInfo.spacing,
        //     mazeRenderInfo.thickness / 2,
        //     0, 2 * Math.PI
        // );
        // context.fill();
    }
}
