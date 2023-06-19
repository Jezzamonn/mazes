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
            this.renderNodeConnections(context, node, {
                spacing,
                thickness: fillWidth + lineWidth,
                color: "black",
            });
        }
        for (const node of maze.nodes) {
            this.renderNodeConnections(context, node, {
                spacing,
                thickness: fillWidth,
                color: "white",
            });
        }
        for (const node of maze.nodes) {
            this.renderNodeColor(context, node, {
                spacing,
                thickness: fillWidth,
                color: generator.getNodeColor(node)
            });
        }

        context.restore();
    }

    renderNodeConnections(
        context: CanvasRenderingContext2D,
        node: Node,
        mazeRenderInfo: MazeRenderInfo
    ) {
        context.beginPath();
        context.lineCap = "square";
        context.lineWidth = mazeRenderInfo.thickness;
        context.strokeStyle = mazeRenderInfo.color;

        for (const connection of node.connections) {
            if (connection.index < node.index) {
                continue;
            }
            context.moveTo(
                node.x * mazeRenderInfo.spacing,
                node.y * mazeRenderInfo.spacing
            );
            context.lineTo(
                connection.x * mazeRenderInfo.spacing,
                connection.y * mazeRenderInfo.spacing
            );
        }
        context.stroke();
    }

    renderNodeColor(
        context: CanvasRenderingContext2D,
        node: Node,
        mazeRenderInfo: MazeRenderInfo
    ) {
        context.fillStyle = mazeRenderInfo.color;
        context.fillRect(
            node.x * mazeRenderInfo.spacing - mazeRenderInfo.thickness / 2,
            node.y * mazeRenderInfo.spacing - mazeRenderInfo.thickness / 2,
            mazeRenderInfo.thickness,
            mazeRenderInfo.thickness
        );
    }
}
