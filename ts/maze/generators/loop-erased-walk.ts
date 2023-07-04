import { choose } from "../../lib/util";
import { Maze } from "../maze";
import { Node } from "../node";
import { Color, Colors } from "../renderers/colors";
import { MazeGenerator } from "./maze-generator";
import { rng } from "./rng";

export class LoopErasedWalkGenerator extends MazeGenerator {

    current: Node | undefined;
    currentPath: Node[] = [];
    inMaze: Set<Node> = new Set();
    startNode: Node | undefined;

    * generate(maze: Maze): Generator<void> {
        // Pick a random node for the start.
        this.inMaze.add(this.getStartNode(maze));
        yield;

        while (true) {
            const notInMaze = maze.nodes.filter((n) => !this.inMaze.has(n));
            if (notInMaze.length == 0) {
                // Every node is in the maze. We're done!
                break;
            }
            // Pick random unvisited node for the position to be in.
            // According to Wikipedia: The algorithm remains unbiased no matter
            // how we choose the unvisited node.
            this.current = choose(notInMaze, rng);
            // The path we're currently walking on. This will be updated as we walk,
            // and any loops will be erased.
            this.currentPath = [this.current];
            yield;

            // Walk until we hit the maze. This may take a while the first time it runs.
            while (true) {
                this.current = choose(this.current!.neighbors, rng);
                if (this.inMaze.has(this.current)) {
                    // We hit the maze. Stop walking.
                    this.currentPath.push(this.current);
                    if (this.currentPath.length > 1) {
                        this.currentPath[this.currentPath.length - 2].connect(this.current);
                    }
                    yield;
                    break;
                }
                // Otherwise, check if this neighbor is in the current path.
                const indexInPath = this.currentPath.indexOf(this.current);
                if (indexInPath >= 0) {
                    // We've looped back to a previous node. Erase the loop.
                    // Undo all the connecting we did.
                    for (let i = Math.max(indexInPath - 1, 0); i < this.currentPath.length - 1; i++) {
                        this.currentPath[i].disconnect(this.currentPath[i + 1]);
                    }
                    this.currentPath.splice(indexInPath);
                }
                // Continue walking.
                this.currentPath.push(this.current);
                // Just for the sake of the visual we do the connecting here.
                if (this.currentPath.length > 1) {
                    this.currentPath[this.currentPath.length - 2].connect(this.current);
                }

                yield;
            }

            // We reached the maze. Add everything in the current path.
            for (let i = 0; i < this.currentPath.length - 1; i++) {
                this.inMaze.add(this.currentPath[i]);
                // It probably makes the most sense for the algorithm to
                // connect the nodes here too. But we already connected them
                // earlier so we don't need to do that here.

                // this.currentPath[i].connect(this.currentPath[i + 1]);
                // yield;
            }
        }

        this.current = undefined;
        this.currentPath = [];
    }

    getStartNode(maze: Maze): Node {
        if (this.startNode == undefined) {
            this.startNode = choose(maze.nodes, rng);
        }
        return this.startNode;
    }

    getNodeColor(node: Node): Color {
        if (this.current === node) {
            return Colors.Yellow;
        }
        if (this.inMaze.has(node)) {
            return Colors.White;
        }
        if (this.currentPath.includes(node)) {
            return Colors.Green;
        }
        return Colors.Transparent;
    }

}