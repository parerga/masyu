import { AdjacencyList } from './adjlist.js';
import { VertexId } from './vertices.js';
import { Path } from './path.js';

declare global {
    const enum Pearl {
        None = 0,
        White = 1,
        Black = 2
    }

    interface Window {
        MWorker: {
            findCycle: (adjlist: AdjacencyList, start: VertexId, minPathLen: number) => Path;
        }
    }
}

