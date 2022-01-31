import { AdjacencyList } from './adjlist.js';
import { Vertex, VertexId, Vertices } from './vertices.js';
import { Path } from './path.js';
import { WorkerManager as CWorkerManager } from './worker.js';

// Модуль может использоваться в нескольких окружениях
let WorkerManager = CWorkerManager;

export class Graph {
    worker: CWorkerManager;

    constructor(protected A: AdjacencyList,
                protected Vs: Vertices<Vertex> = new Vertices<Vertex>(A.length, (v) => { return { id: v } })) {
        this.worker = new WorkerManager();
    }

    get adjacencyList(): AdjacencyList {
        return this.A;
    }

    get vertices(): Vertices<Vertex> {
        return this.Vs;
    }

    verticesCount(): number {
        return this.Vs.length;
    }

    updateVertices(Vs: Vertices<Vertex>) {
        if (!Array.isArray(Vs)) {
            return;
        }

        for (let i = 0; i < Vs.length; i++) {
            this.updateVertex(Vs[i]);
        }
    }

    updateVertex(V: Vertex) {
        const id = V.id;
        const vsCount = this.verticesCount();
        if (id === undefined || id < 0 || id > vsCount) {
            return;
        }

        this.Vs[id] = V;
    }

    private _findCycle(start: VertexId, minPathLen: number): Path {
        return window.MWorker.findCycle(this.A, start, minPathLen);
    }

    private _findCycleAsync(start: VertexId[], minPathLen: number): Promise<Path> {
        return new Promise<Path>((resolve, reject) => {
            this.worker.once('completed', (w: Worker, data: any) => {
                const path: Path = data.path ?? [];
                this.worker.terminate();
                resolve(path);
            });
            this.worker.once('error', (e: ErrorEvent) => {
                reject(e);
            });

            // Время поиска цикла может сильно различаться в зависимости от выбранной начальной вершины.
            // Создаем воркеров равное количеству переданных начальных вершин.
            // После первого найденного цикла прервем все остальные воркеры.
            start.forEach(v => {
                this.worker.run('graph.findCycle', {
                    adjlist: this.A,
                    startVertex: v,
                    minPathLen
                });
            });
        });
    }

    // Находит первый простой цикл из начальной вершины поиском в глубину (DFS).
    // Можно указать минимальную длину искомого цикла. Если цикл не найден, возвращается пустой массив.
    findCycle(start: VertexId, minPathLen?: number): Path;
    findCycle(start: VertexId[], minPathLen?: number): Promise<Path>;
    findCycle(start: VertexId[] | VertexId, minPathLen: number = 4): Promise<Path> | Path {
        if (minPathLen < 4) {
            minPathLen = 4;
        }

        const vsCount = this.verticesCount();
        if (vsCount < minPathLen) {
            return start instanceof Array ? Promise.resolve([]) : [];
        }

        if (minPathLen > vsCount) {
            minPathLen = vsCount;
        }

        if (start instanceof Array) {
            return this._findCycleAsync(start, minPathLen);
        } else {
            return this._findCycle(start, minPathLen);
        }
    }

    // Находит все сильно связные компоненты графа, исключая изолированные вершины
    // Используется алгоритм Тарьяна
    // https://en.wikipedia.org/wiki/Tarjan%27s_strongly_connected_components_algorithm
    connectedComponents(): Path[] {
        // Все исходящие из v вершины
        const successors = (v: VertexId): VertexId[] => {
            return this.A[v];
        };

        type VertexParams = {
            [key: number]: {
                onStack: boolean,
                lowlink: number,
                index: number
            }
        }

        let index = 0;
        let stack: VertexId[] = [];
        let visited: VertexParams = {};
        let results: Path[] = [];

        function dfs(v: VertexId) {
            let scs = successors(v) || [];
            // Изолированные вершины (степень вершины == 0) не интересны
            if (scs.length <= 0) {
                return;
            }

            let entry = visited[v] = {
                onStack: true,
                lowlink: index,
                index: index++
            };
            stack.push(v);

            scs.forEach((w) => {
                if (!visited[w]) {
                    dfs(w);
                    // Степень вершины > 0
                    if (visited[w]) {
                        entry.lowlink = Math.min(entry.lowlink, visited[w].lowlink);
                    }
                } else if (visited[w].onStack) {
                    entry.lowlink = Math.min(entry.lowlink, visited[w].index);
                }
            });

            if (entry.lowlink === entry.index) {
                let cc: Path = [];
                let w;
                do {
                    w = stack.pop();
                    if (w === undefined) {
                        break;
                    }
                    visited[w].onStack = false;
                    cc.push(w);
                } while (v !== w);
                results.push(cc);
            }
        }

        this.A.forEach((avs, v) => {
            if (!visited[v]) {
                dfs(v);
            }
        });

        return results;
    }
}