import { Graph } from './graph.js';
import { shuffle } from './utils.js';
import { AdjacencyList } from './adjlist.js';
import { Vertex, VertexId, Vertices } from './vertices.js';
import { Path } from './path.js';

export type MVertices = Vertices<MVertex>;
export interface MVertex extends Vertex {
    pearl: Pearl,
    // выполнено ли условие для жемчужины, undefined - не имеет значения
    cond?: boolean | undefined
}
const mvertex = (id: VertexId = 0): MVertex => {
    return {
        id: id,
        pearl: Pearl.None,
        cond: undefined
    }
}

export interface MGraphParams {
    rows: number,
    cols: number,
    pattern?: Pattern
}

type SortFunc<T> = (arr: T[]) => T[];
export type Pattern = SortFunc<string> | string[];

let _patterns: {
    [key: string]: Pattern
} = {
    random: shuffle,
    trbl: ['top', 'right', 'bottom', 'left'],
    ltrb: ['left', 'top', 'right', 'bottom'],
    rblt: ['right', 'bottom', 'left', 'top'],
    bltr: ['bottom', 'left', 'top', 'right']
}
_patterns.default = _patterns.trbl;
export const Patterns = _patterns;

// Конвертирует описание паттерна в сортирующую функцию
export function pattern2Sort(ptrn: string[]): SortFunc<string> {
    return function (arr: string[]): string[] {
        const pr = ptrn.reduce((prev, curr, i) => {
            prev[curr] = i;
            return prev;
        }, {} as { [key: string]: number });

        arr.sort((a, b) => {
            return pr[a] - pr[b];
        });
        return arr;
    }
}

export class MGraph extends Graph {
    private _wPearls: number = 0;
    private _bPearls: number = 0;
    private readonly _rows: number = 0;
    private readonly _cols: number = 0;

    private constructor(A: AdjacencyList, Vs: MVertices, params: MGraphParams) {
        super(A, Vs);

        ({
            rows: this._rows = 0,
            cols: this._cols = 0,
        } = params);

        for (let i = 0; i < Vs.length; i++) {
            let V = Vs[i];
            if (V.pearl === Pearl.White) this._wPearls++;
            if (V.pearl === Pearl.Black) this._bPearls++;
        }
    }

    static createGraph(params: MGraphParams, Vs?: MVertices): MGraph {
        const { rows: n, cols: m, pattern = Patterns.default } = params;
        const A = new AdjacencyList();

        if (!Vs) {
            Vs = new Vertices<MVertex>(n * m, mvertex);
        }

        const sort = Array.isArray(pattern) ? pattern2Sort(pattern) : pattern;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                let v = i * m + j;
                MGraph._setAdjacencyVertices(n, m, A, Vs[v], sort);
            }
        }

        return new MGraph(A, Vs, params);
    }

    get pearls(): number {
        return this._wPearls + this._bPearls;
    }

    clearVertices(): void {
        this._wPearls = 0;
        this._bPearls = 0;
        this.Vs = new Vertices<MVertex>(this._rows * this._cols, mvertex);
    }

    // Добавить жемчужину с проверкой возможности добавления.
    // Если вершина уже занята жемчужиной или же в вершине нельзя проставить жемчужину,
    // функция вернет false, иначе true
    setPearl(v: VertexId, p: Pearl): boolean {
        const vsCount = this.verticesCount();
        if (v === undefined || v < 0 || v > vsCount) {
            return false;
        }

        let res = true;
        let V = <MVertex>this.Vs[v];
        if (V.pearl === Pearl.None) {
            if (p === Pearl.White && (v === 0 || v === this._cols - 1 || v === vsCount - this._cols || v === vsCount - 1)) {
                res = false;
            } else {
                V.pearl = p;
                p === Pearl.White ? this._wPearls++ : this._bPearls++;
            }
        } else {
            res = false;
        }

        return res;
    }

    getPearl(v: VertexId): Pearl {
        const V = <MVertex>this.Vs[v];
        return V.pearl;
    }

    updateVertex(V: MVertex) {
        const id = V.id;
        const vsCount = this.verticesCount();
        if (id === undefined || id < 0 || id > vsCount) {
            return;
        }

        const _V = <MVertex>this.Vs[id];
        if (_V.pearl === Pearl.White) this._wPearls--;
        if (_V.pearl === Pearl.Black) this._bPearls--;

        this.Vs[id] = V;
        if (V.pearl === Pearl.White) this._wPearls++;
        if (V.pearl === Pearl.Black) this._bPearls++;
    }

    findCycleEx(start?: VertexId, pattern?: Pattern): Promise<Path> {
        return new Promise((resolve, reject) => {
            let s = start ?? this.chooseStartVertex();
            if (s === undefined) {
                console.warn('Failed to find starting vertex.');
                return Promise.resolve([]);
            }

            this.worker.once('completed', (w: Worker, data: any) => {
                // Цикл найден, прервем остальные воркеры
                this.worker.terminate();
                resolve(data.path ?? []);
            });
            this.worker.once('error', (e: ErrorEvent) => {
                reject(e);
            });

            ['trbl', 'ltrb', 'rblt', 'bltr'].forEach((ptrn) => {
                this._adjustAList(Patterns[ptrn]);
                this.worker.run('mgraph.findCycle', {
                    vertices: this.Vs,
                    adjlist: this.A,
                    allPearls: this._wPearls + this._bPearls,
                    startVertex: s,
                    pattern: ptrn
                });
            });
        });
    }

    // Выбрать паттерн по вершине
    choosePattern(v: VertexId): Pattern {
        let row = ~~(v / this._cols);
        let col = v % this._cols;

        // Грид поделен на 4 сектора (треугольника) двумя прямыми,
        // проходящими через центр и противоположные углы.
        // Для каждого сектора свой паттерн.
        let pattern = Patterns.default;
        if (col >= row) {
            if (col < this._rows - row) {
                // верх
                pattern = Patterns.trbl;
            } else {
                // право
                pattern = Patterns.rblt;
            }
        } else {
            if (col < this._rows - row) {
                // лево
                pattern = Patterns.ltrb;
            } else {
                // низ
                pattern = Patterns.bltr;
            }
        }

        return pattern;
    }

    // Чем меньше смежных вершин имеет вершина, а также, чем она дальше от центра,
    // тем она предпочтительнее в качестве стартовой.
    chooseStartVertex(): VertexId | undefined {
        const row0 = this._rows / 2;
        const col0 = this._cols / 2;
        // Массив вершин, претендующих на звание стартовой.
        // Чем индекс ниже, тем вершина предпочтительнее.
        const svs = new Array(3).fill(0).map(_ => ({ v: -1, quasiLen: 0 }));

        for (let v = 0; v < this.Vs.length; v++) {
            let V = <MVertex>this.Vs[v];
            let avsLen = this.A[v].length;

            if (V.pearl !== Pearl.None) {
                let row = Math.floor(v / this._cols) + 0.5;
                let col = v % this._cols + 0.5;
                let quasiLen = Math.abs(row0 - row) + Math.abs(col0 - col);

                if (svs[2].quasiLen < quasiLen) {
                    svs[2] = { v, quasiLen };
                }
                if (avsLen < 4 && svs[1].quasiLen < quasiLen) {
                    svs[1] = { v, quasiLen };
                }
                if (avsLen < 3 && svs[0].quasiLen < quasiLen) {
                    svs[0] = { v, quasiLen };
                }
            }
        }

        return svs.find(value => value.v >= 0)?.v;
    }

    resetVerticesCond() {
        for (let i = 0; i < this.verticesCount(); i++) {
            const V = <MVertex>this.Vs[i];
            V.cond = undefined;
        }
    }

    private _adjustAList(pattern: Pattern) {
        const sort = Array.isArray(pattern) ? pattern2Sort(pattern) : pattern;
        for (let i = 0; i < this.verticesCount(); i++) {
            MGraph._setAdjacencyVertices(this._rows, this._cols, this.A, <MVertex>this.Vs[i], sort);
        }
    }

    // Для вершины V установить смежные вершины по правилам:
    // 1. В зависимости от положения и цвета жемчужины. Белые, находящиеся на границах, например, могут иметь всего две смежные вершины.
    // 2. Очередность обхода смежных вершин. В зависимости от того, какие вершины посещаются первыми,
    // меняется рисунок (паттерн) обхода, что может сильно менять количество итераций в поиске верного пути.
    private static _setAdjacencyVertices(n: number, m: number, A: AdjacencyList, V: MVertex, sf?: SortFunc<string>) {
        const vsCount = n * m;

        const v = V.id;
        const pearl = V.pearl;
        const adjs = {
            left: v - 1,
            right: v + 1,
            top: v - m,
            bottom: v + m
        } as { [key: string]: number };

        const sort = (v: string[]): number[] => {
            v = sf ? sf(v) : v;
            return v.map((v: string) => {
                return adjs[v];
            });
        }

        // левый верхний угол
        if (v === 0)                A[v] = sort(['bottom', 'right']);
        // правый верхний угол
        else if (v === m - 1)       A[v] = sort(['bottom', 'left']);
        // левый нижний угол
        else if (v === vsCount - m) A[v] = sort(['right', 'top']);
        // правый нижний угол
        else if (v === vsCount - 1) A[v] = sort(['left', 'top']);
        // левый столбец
        else if (v % m === 0)       A[v] = pearl === Pearl.White ? sort(['bottom', 'top']) : sort(['bottom', 'right', 'top']);
        // правый столбец
        else if (v % m === m - 1)   A[v] = pearl === Pearl.White ? sort(['bottom', 'top']) : sort(['bottom', 'top', 'left']);
        // верхний ряд
        else if (v < m)             A[v] = pearl === Pearl.White ? sort(['right', 'left']) : sort(['bottom', 'right', 'left']);
        // нижний ряд
        else if (v > (n - 1) * m)   A[v] = pearl === Pearl.White ? sort(['right', 'left']) : sort(['top', 'right', 'left']);
        else {
            // все, что внутри
            if (pearl === Pearl.Black) {
                // Аналогично для второй строки/столбца со всех сторон
                if (v === m + 1)                      A[v] = sort(['bottom', 'right']);
                else if (v === 2 * m - 2)             A[v] = sort(['bottom', 'left']);
                else if (v === vsCount - (2 * m - 1)) A[v] = sort(['top', 'right']);
                else if (v === vsCount - m - 2)       A[v] = sort(['top', 'left']);
                else if (v % m === 1)                 A[v] = sort(['bottom', 'right', 'top']);
                else if (v % m === m - 2)             A[v] = sort(['bottom', 'top', 'left']);
                else if (v < 2 * m)                   A[v] = sort(['bottom', 'right', 'left']);
                else if (v > vsCount - 2 * m)         A[v] = sort(['top', 'right', 'left']);
                else
                    A[v] = sort(['right', 'bottom', 'left', 'top']);
            } else
                A[v] = sort(['right', 'bottom', 'left', 'top']);
        }
    }
}

