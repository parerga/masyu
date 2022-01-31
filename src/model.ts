import { MVertices } from './mgraph.js';
import { AdjacencyList } from './adjlist.js';
import { Path } from './path.js';

interface BoardProps {
    board: MVertices,
    rows: number,
    cols: number,
    solutions: Path[],
    solving: AdjacencyList,
    desc: string
}

export class BoardModel {
    board: MVertices = [];
    rows: number = 0;
    cols: number = 0;
    // Список смежности содержит процесс пользовательского поиска решения
    solving: AdjacencyList = new AdjacencyList();
    // Массив решений; может включать кроме программно найденных, также, найденные пользователем
    solutions: Path[] = [];
    desc: string = '';
    private _data = {};

    constructor() {
    }

    deserialize(data: string): void {
        let obj = {} as BoardProps;
        try {
            obj = JSON.parse(data)
        } catch (e) {
            console.error(e, data);
        }
        this._data = obj;

        this.desc = obj.desc ?? '';
        this.board = obj.board ?? [];
        this.solutions = obj.solutions ?? [];
        this.solving = new AdjacencyList(obj.solving);

        const rows = obj.rows ?? 0;
        const cols = obj.rows ?? 0;
        if (rows < 1 && cols < 1) {
            this.cols = this.rows = ~~Math.sqrt(this.board.length);
        } else if (rows < 1) {
            this.cols = cols;
            this.rows = this.board.length / cols || 0;
        } else {
            this.rows = rows;
            this.cols = this.board.length / rows || 0;
        }
    }

    serialize(): string {
        const res = Object.assign({}, this._data, {
            size: `${this.rows}*${this.cols}`,
            rows: this.rows,
            cols: this.cols,
            desc: this.desc || undefined,
            board: this.board,
            solutions: this.solutions.length ? this.solutions : undefined,
            solving: this.solving.length ? this.solving : undefined
        });

        return JSON.stringify(res, null, '  ');
    }
}
