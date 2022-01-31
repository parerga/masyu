import { MGraph, MVertex, MVertices, Patterns } from './mgraph.js';
import { Graph } from './graph.js';
import { BoardData, cardinalDirection, CardinalDirection, Cell } from './btypes.js';
import { genShortUid, shuffle } from './utils.js';
import { BoardModel } from './model.js';
import { AdjacencyList } from './adjlist.js';
import { VertexId } from './vertices.js';
import { Path } from './path.js';

interface Pearls {
    wPearls: number,
    bPearls: number
}

export class Board {
    // Текущие состояние доски
    // true - решение найдено, false - решение не найдено, undefined - в процессе поиска
    private _solved: boolean | undefined;
    private _graph: MGraph;
    private _model: BoardModel;
    private _startVertex: number | undefined = undefined; // for debug purpose

    readonly id: string;

    constructor(rows: number, cols: number);
    constructor(data: string);
    constructor(rowsOrData: number | string, cols?: number) {
        this._model = new BoardModel();

        let Vs;
        if (typeof rowsOrData === 'string') {
            this._model.deserialize(rowsOrData);
            Vs = this._model.board;
        } else {
            this._model.rows = rowsOrData;
            this._model.cols = cols ?? 0;
        }

        this.id = genShortUid();
        this._graph = MGraph.createGraph({
            rows: this.rows,
            cols: this.cols,
            pattern: Patterns.default
        }, Vs);
    }

    get solution(): Path {
        return this._model.solutions[0] || [];
    }
    private set solution(s: Path) {
        if (!Array.isArray(s)) {
            s = [];
        }
        if (s.length) {
            // Хотя решений может быть много, используем только последнее найденное
            this._model.solutions[0] = s;
        } else {
            this._model.solutions = [];
        }
    }

    get solving(): AdjacencyList {
        return this._model.solving
    }
    private set solving(A: AdjacencyList) {
        this._model.solving = A || [];
    }

    get graph() {
        return this._graph;
    }

    get rows() {
        return this._model.rows;
    }
    get cols() {
        return this._model.cols;
    }

    get solved(): boolean | undefined {
        return this._solved;
    }
    private set solved(v: boolean | undefined) {
        this._solved = v;
    }

    serialize(): string {
        this._graph.resetVerticesCond();
        this._model.board = <MVertices>this._graph.vertices;

        return this._model.serialize();
    }

    // Сбросить текущее решение
    reset() {
        this.solved = undefined;
        this.solving = new AdjacencyList();
    }

    setPearl(cell: Cell, pearl: Pearl) {
        const V: MVertex = {
            id: this.cellToVertex(cell),
            pearl: pearl
        }
        this.solved = undefined;
        this.solution = [];
        this._graph.updateVertex(V);
    }

    getPearl(cell: Cell): Pearl {
        return this._graph.getPearl(this.cellToVertex(cell));
    }

    // Нитка порвалась, жемчуг рассыпался
    scatterPearls() {
        this._graph.clearVertices();

        let vsCount = this._graph.verticesCount();
        let { wPearls, bPearls } = this.calcNumberOfPearls();

        let tries = wPearls * 50;
        while (tries-- && wPearls > 0) {
            if (this._graph.setPearl(Math.floor(Math.random() * vsCount), Pearl.White)) {
                wPearls--;
            }
        }

        tries = bPearls * 50;
        while (tries-- && bPearls > 0) {
            if (this._graph.setPearl(Math.floor(Math.random() * vsCount), Pearl.Black)) {
                bPearls--;
            }
        }
    }

    // Вычисляет количество жемчужин для данной доски, опираясь на выбранную сложность и размер доски
    calcNumberOfPearls(desiredWhitePearls: number = 0, desiredBlackPearls: number = 0): Pearls {
        let vsCount = this._graph.verticesCount();
        let wPearls = desiredWhitePearls;
        let bPearls = desiredBlackPearls;

        // Если желаемое количество жемчужин не указано или превышает количество вершин
        if (((desiredWhitePearls || desiredBlackPearls) && desiredWhitePearls + desiredBlackPearls > vsCount) ||
            (!desiredWhitePearls && !desiredBlackPearls)) {
            wPearls = Math.floor(this.rows * this.cols / 6);
            bPearls = Math.floor(wPearls / 2);
        }

        return { wPearls, bPearls };
    }

    // Найти подходящие для размещения жемчужин вершины
    findValidVertices() {
        const whites = [];
        const blacks = [];
        const path = this.solution;
        const pathLen = path.length;

        // Закольцевать индекс с учетом того, что this.solution - цикл
        const index = (i: number) => {
            let idx = i;
            if (i < 0) {
                idx = pathLen + i - 1;
            }
            if (i >= pathLen) {
                idx = i - pathLen + 1;
            }
            return idx;
        }

        let psl = Math.abs(path[0] - path[1]) === Math.abs(path[2] - path[1]);
        let csl = Math.abs(path[1] - path[2]) === Math.abs(path[3] - path[2]);
        for (let i = 3; i < pathLen + 2; i++) {
            let v = path[index(i - 1)];
            let n = path[index(i)];

            let nsl = Math.abs(v - n) === Math.abs(path[index(i + 1)] - n);

            // если в текущей ячейке прямая
            if (csl) {
                // в предыдущей или в следующей есть уголок
                if (!psl || !nsl) {
                    // значит в вершине может находится белая жемчужина
                    whites.push(v);
                }
            } else {
                if (psl && nsl) {
                    blacks.push(v);
                }
            }
            psl = csl;
            csl = nsl;
        }

        return { whites, blacks };
    }

    // Нанизываем жемчуг на готовый цикл
    beadPearls({ wPearls, bPearls }: Pearls) {
        const { whites, blacks } = this.findValidVertices();

        // Тасуем
        shuffle(whites);
        shuffle(blacks);

        // Помещаем жемчужины в первые wPearls/bPearls вершины
        this._graph.updateVertices(whites.slice(0, wPearls).map(v => { return { id: v, pearl: Pearl.White }; }));
        this._graph.updateVertices(blacks.slice(0, bPearls).map(v => { return { id: v, pearl: Pearl.Black }; }));
    }

    // Генерация новой головоломки.
    // Генерится "случайный" список смежности, в котором ищется цикл, на который нанизываются жемчужины.
    async generate(whitePearls?: number, blackPearls?: number) {
        const vsCount = this._graph.verticesCount();

        // Отношение количества вершин к минимальной длине пути.
        // Влияет на сложность головоломки.
        const d = Math.round(vsCount / 10 * 1.5);
        const minPathLen = vsCount - d;

        this.solved = undefined;
        this.solving = new AdjacencyList();

        // "Случайный" список смежности
        this._graph = MGraph.createGraph({
            rows: this.rows,
            cols: this.cols,
            pattern: Patterns.random
        });

        // При неблагополучных начальных условиях поиск цикла может затянуться,
        // поэтому запускаем параллельно несколько и используем первый завершившийся
        const svs = [];
        for (let i = 0; i < 4; i++) {
            svs[i] = Math.floor(Math.random() * vsCount);
        }
        this.solution = await this._graph.findCycle(svs, minPathLen);
        this.beadPearls(this.calcNumberOfPearls());
    }

    // Поиск решения для текущей доски
    async solve(): Promise<boolean> {
        if (!this.solution.length) {
            this.solution = await this._graph.findCycleEx(this._startVertex);
        }

        this.solving = new AdjacencyList(this.solution);
        this.solved = this.solution.length > 0;

        return this.solved;
    }

    vertexToCell(v: VertexId): Cell {
        return v >= 0 && v < this._graph.verticesCount() ? {
            row: Math.floor(v / this.cols),
            col: v % this.cols
        } : { row: -1, col: -1 };
    }

    cellToVertex(cell: Cell): VertexId {
        const v = cell.row * this.cols + cell.col;
        return v < 0 || v >= this._graph.verticesCount() ? -1 : v;
    }

    // Получить направления для вершины
    dirsByVertex(v: number, A: AdjacencyList = this.solving): CardinalDirection {
        let avs = A[v] || [];
        let dirs = cardinalDirection();
        for (let j = 0; j < avs.length; j++) {
            switch (v - avs[j]) {
                case 1: dirs.west = true; break;
                case -1: dirs.east = true; break;
                case this.cols: dirs.north = true; break;
                case -this.cols: dirs.south = true; break;
            }
        }

        return dirs;
    }

    // Проверка условий игры для жемчужины в вершине v
    checkPearl(A: AdjacencyList, pearl: Pearl = Pearl.None, v: VertexId) {
        let res = true;
        if (pearl === Pearl.None) {
            return true;
        }

        const avs = A[v] || [];
        const prev = avs[0];
        const next = avs[1];

        if (prev === undefined || next === undefined) {
            return res;
        }

        const offsetp = prev - v;
        const offsetn = next - v;
        const straightLine = Math.abs(offsetn) === Math.abs(offsetp);

        if (pearl === Pearl.White) {
            if (!straightLine) {
                res = false;
            } else {
                if ((A[prev].indexOf(prev + offsetp) >= 0 && A[next].indexOf(next + offsetn) >= 0)) {
                    res = false;
                }
            }
        } else if (pearl === Pearl.Black) {
            if (straightLine) {
                res = false;
            } else {
                if (A[prev].indexOf(prev + offsetn) >= 0 || A[prev].indexOf(prev - offsetn) >= 0 ||
                    A[next].indexOf(next + offsetp) >= 0 || A[next].indexOf(next - offsetp) >= 0) {
                    res = false;
                }
            }
        }

        return res;
    }

    private _initData(): BoardData {
        return {
            solved: undefined,
            cells: new Array(this.rows).fill('')
                .map(value => {
                    const arr = new Array(this.cols);
                    for (let i = 0; i < this.cols; i++) {
                        arr[i] = {};
                    }
                    return arr;
                })
        };
    }

    // Собирает и возвращает данные доски для последующей отрисовки
    getData(): BoardData {
        const data = this._initData();
        const Vs = <MVertices>this._graph.vertices;
        Vs.forEach(V => {
            let pearl = V.pearl;
            if (pearl !== Pearl.None) {
                let { row, col } = this.vertexToCell(V.id);
                data.cells[row][col].pearl = { kind: pearl };
            }
        });

        data.solved = this.solved;
        const A = this.solving;
        A.forEach((avs, v) => {
            const { row, col } = this.vertexToCell(v);
            const dirs = this.dirsByVertex(v, A);

            data.cells[row][col].path = { directions: dirs };
        });

        return data;
    }

    // Проверить прогресс пользовательского решения
    checkSolving(): BoardData {
        const data = this._initData();
        const Vs = <MVertices>this._graph.vertices;
        const A = this.solving;
        const sGraph = new Graph(A);
        const visited = [];

        let wPearls = 0;
        let bPearls = 0
        let cycles = 0;
        let solved = true;
        let cycle: Path = [];

        let cc = sGraph.connectedComponents();
        // Пройдемся по всем компонентам связности и проверим на соответствие правилам игры
        for (let i = 0; i < cc.length; i++) {
            let p = cc[i];

            for (let j = 0; j < p.length; j++) {
                let v = p[j];
                let V = Vs[v];
                let avs = A[v];

                visited[v] = true;

                // Путь не может пересекать сам себя (размерность вершины не больше 2)
                let { row, col } = this.vertexToCell(v);
                let dirs = this.dirsByVertex(v);
                data.cells[row][col].path = {
                    fail: cycles > 0 || avs.length > 2,
                    directions: dirs
                }

                if (solved) {
                    solved = avs.length <= 2;
                }

                // Проверка жемчужины
                if (V.pearl) {
                    V.pearl === Pearl.Black ? bPearls++ : wPearls++;
                    let r = this.checkPearl(A, V.pearl, V.id);
                    data.cells[row][col].pearl = {
                        fail: !r || cycles > 1,
                        kind: V.pearl
                    }

                    if (solved && !r) {
                        solved = false;
                    }
                }
            }

            // Является ли первая компонента связности циклом?
            // Если да, все последующие помечаем невалидными
            cycle = sGraph.findCycle(p[0]);
            if (cycle.length > 0) {
                cycles++;
            }
        }

        // Проверим остальные вершины, не попавшие в компоненты
        for (let v = 0; v < Vs.length; v++) {
            let V = Vs[v];
            if (visited[v]) {
                continue;
            }

            let { row, col } = this.vertexToCell(v);
            data.cells[row][col].path = {
                directions: cardinalDirection()
            }

            if (V.pearl) {
                data.cells[row][col].pearl = {
                    fail: cc.length > 1 && cycles > 1,
                    kind: V.pearl
                }
            }
        }

        // Циклов не найдено
        if (cc.length > 1 || cycles < 1) {
            solved = false;
        }

        // Цикл проходит через все жемчужины
        solved = solved && (wPearls + bPearls === this._graph.pearls);
        if (solved) {
            this.solution = cycle;
        }

        data.solved = this.solved = solved || undefined;
        return data;
    }

    // Связать две соседние ячейки
    linkNeighborsCells(startCell: Cell, endCell: Cell, split: boolean = false) {
        const v = this.cellToVertex(startCell);
        const v2 = this.cellToVertex(endCell);

        if (v === v2) {
            return;
        }

        // Интересуют соседние только по горизонтали и вертикали
        let m = Math.abs(v - v2);
        if (m !== 1 && m !== this.cols) {
            return;
        }

        const A = this.solving;
        if (!split) {
            split = A[v] && A[v].indexOf(v2) !== -1;
        }

        if (split) {
            A.removeEdge(v, [v2]);
            A.removeEdge(v2, [v]);
        } else {
            A.addEdge(v, [v2]);
            A.addEdge(v2, [v]);
        }
    }
}
