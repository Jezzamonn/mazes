import { MazeRenderInfo } from "../maze-render-info";
import { Node } from "../node";

// Build a tree from a maze and render it to a canvas.
export class TreeRenderer {
    root: TreeNode;
    nodes: TreeNode[] = [];

    constructor(root: Node) {
        // Create a tree from the maze.
        const visited = new Set<Node>();

        this.root = new TreeNode(root);
        this.root.depth = 0;
        visited.add(root);
        this.nodes.push(this.root);

        const queue = [this.root];
        while (queue.length > 0) {
            const node = queue.shift()!;
            for (const connection of node.mazeNode.connections) {
                if (visited.has(connection)) {
                    continue;
                }
                const child = new TreeNode(connection);
                child.depth = node.depth! + 1;
                node.children.push(child);

                visited.add(connection);
                this.nodes.push(this.root);

                queue.push(child);
            }
        }

        this.root.calculateTreeLayout();
        this.root.setAbsolutePosition(0, 0);
    }

    render(context: CanvasRenderingContext2D) {
        const fillWidth = 8;
        const lineWidth = 1.5;
        const spacing = 12;

        // Shift things so it's centered.
        context.translate(
            0.75 * context.canvas.clientWidth, 20);

        this.root.render(context, {
            spacing,
            thickness: fillWidth + lineWidth,
            color: "black",
        });
        this.root.render(context, {
            spacing,
            thickness: fillWidth,
            color: "white",
        });
    }
}

export class TreeNode {
    mazeNode: Node;
    children: TreeNode[] = [];
    // If the tree is shown with the root at the top, this is the x position of
    // each child relative to this node.
    childPositions: number[] = [];

    // The depth of this node in the tree. To be set outside this class when the
    // tree is built.
    depth: number | undefined;
    // The left-most coordinate of each layer of the subtree starting at this
    // node. Excluding this node, as it'll always be 0.
    leftEdge: number[] | undefined;
    // The right-most coordinate of each layer of the subtree starting at this
    // node. Excluding this node, as it'll always be 0.
    rightEdge: number[] | undefined;

    // The absolute position of this node.
    x: number | undefined;
    y: number | undefined;

    constructor(mazeNode: Node) {
        this.mazeNode = mazeNode;
    }

    calculateTreeLayout() {
        // First need to update the info for the children.
        for (const child of this.children) {
            child.calculateTreeLayout();
        }
        this.calculatePositionOfChildren();
        this.calculateEdges();
    }

    /** Sets the absolution position of this node and its descendants */
    setAbsolutePosition(x: number, y: number) {
        this.x = x;
        this.y = y;

        for (let c = 0; c < this.children.length; c++) {
            const child = this.children[c];
            const childPosition = this.childPositions[c]!;

            child.setAbsolutePosition(
                x + childPosition,
                y + 1
            );
        }
    }

    // Calculate the position of each child node. This spaces out the nodes so
    // that each of their subtrees are as close as they can be without touching.
    //
    // Requires that the children's edges are already calculated.
    calculatePositionOfChildren() {
        if (this.children.length === 0) {
            return;
        }

        // 1 arbitrary unit of space between each child.
        const padding = 1;

        const gapsBetweenChildren: number[] = [];
        for (let i = 0; i < this.children.length - 1; i++) {
            gapsBetweenChildren[i] =
                getMinimumRequiredGap(
                    this.children[i].rightEdge!,
                    this.children[i + 1].leftEdge!
                ) + padding;
        }

        const totalGaps = gapsBetweenChildren.reduce((a, b) => a + b, 0);
        let runningTotal = 0;
        for (let i = 0; i < this.children.length; i++) {
            this.childPositions[i] = runningTotal - totalGaps / 2;
            runningTotal += gapsBetweenChildren[i];
        }
    }

    // At this point, childPositions need to be set, and the children's edges
    // should also be calculated.
    calculateEdges() {
        this.leftEdge = [];
        this.rightEdge = [];

        if (this.children.length === 0) {
            return;
        }

        for (let c = 0; c < this.children.length; c++) {
            const child = this.children[c];
            const childPosition = this.childPositions[c]!;

            // Update this node's edges.
            // Start with a new layer for the child nodes.
            this.leftEdge[0] = Math.min(
                this.leftEdge[0] ?? Infinity,
                childPosition
            );
            this.rightEdge[0] = Math.max(
                this.rightEdge[0] ?? -Infinity,
                childPosition
            );

            // Combine the child node edges.
            for (let i = 0; i < child.leftEdge!.length; i++) {
                this.leftEdge![i + 1] = Math.min(
                    this.leftEdge![i + 1] ?? Infinity,
                    childPosition + child.leftEdge![i]
                );
            }
            for (let i = 0; i < child.rightEdge!.length; i++) {
                this.rightEdge![i + 1] = Math.max(
                    this.rightEdge![i + 1] ?? -Infinity,
                    childPosition + child.rightEdge![i]
                );
            }
        }
    }

    /**
     * Render the tree to a canvas.
     *
     * TODO: It would be nice if this had square nodes.
     */
    render(
        context: CanvasRenderingContext2D,
        mazeRenderInfo: MazeRenderInfo
    ) {
        context.lineCap = 'round';
        context.lineWidth = mazeRenderInfo.thickness;
        context.strokeStyle = mazeRenderInfo.color;

        context.beginPath();
        for (const child of this.children) {
            // Draw a line from this node to the child.
            context.moveTo(this.x! * mazeRenderInfo.spacing, this.y! * mazeRenderInfo.spacing);
            context.lineTo(child.x! * mazeRenderInfo.spacing, child.y! * mazeRenderInfo.spacing);
        }
        context.stroke();

        for (const child of this.children) {
            child.render(context, mazeRenderInfo);
        }
    }
}

/**
 * The minimum gap needed to separate two subtrees, given the left edge of one
 * and the right edge of the other. Which is actually the maximum of the gap
 * needed for each layer.
 *
 * There's no padding here. Add to the result returned to handle padding.
 *
 * Essentially this solves for leftEdge[i] <= rightEdge[i] + gap for all i.
 */
function getMinimumRequiredGap(
    leftEdge: number[],
    rightEdge: number[]
): number {
    // This can start at 0 because each edge implicitly has a root node at 0,
    // and the minimum gap needed there is 0.
    let minGap = 0;
    let minLength = Math.min(leftEdge.length, rightEdge.length);
    for (let i = 0; i < minLength; i++) {
        minGap = Math.max(minGap, leftEdge[i] - rightEdge[i]);
    }
    return minGap;
}
