import { lerp } from "../../lib/util";
import { MazeGenerator } from "../generators/maze-generator";
import { Maze } from "../maze";
import { MazeRenderInfo } from "../maze-render-info";
import { Node } from "../node";

export class Renderer {
    render(
        context: CanvasRenderingContext2D,
        maze: Maze,
        generator: MazeGenerator
    ) {
        const fillWidth = 18;
        const lineWidth = 2;
        const spacing = 22;

        context.save();
        context.translate(spacing, spacing);

        for (const node of maze.nodes) {
            this.renderNode(context, node, {
                spacing,
                thickness: fillWidth + lineWidth,
                color: "black",
            });
        }
        for (const node of maze.nodes) {
            this.renderNode(context, node, {
                spacing,
                thickness: fillWidth,
                color: generator.getNodeColor(node),
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
        // context.fillRect(
        //     node.x * mazeRenderInfo.spacing - mazeRenderInfo.thickness / 2,
        //     node.y * mazeRenderInfo.spacing - mazeRenderInfo.thickness / 2,
        //     mazeRenderInfo.thickness,
        //     mazeRenderInfo.thickness
        // );
        context.arc(
            node.x * mazeRenderInfo.spacing,
            node.y * mazeRenderInfo.spacing,
            mazeRenderInfo.thickness / 2,
            0, 2 * Math.PI
        );
        context.fill();
    }
}
