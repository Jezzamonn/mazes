import { Maze } from "../maze";
import { Node } from "../node";
import { Color } from "../renderers/colors";

export abstract class MazeGenerator {

    /** Generates a maze using a JavaScript generator, which allows for the code
     * to be paused so we can animate it. */
    abstract generate(maze: Maze): Generator<void>;

    /**
     * Implementations can use this to color things like the current node, or
     * nodes that are in different sets.
     */
    getNodeColor(node: Node): Color {
        return Color.White;
    }
}
