import { Board } from './board.js';
import { IBoardView } from './bview.js';
import { Cell } from './btypes.js';

const enum MOUSE_EVENT_BUTTON {
    Left = 0,
    Middle,
    Right,
    Back,
    Forward
}

const enum MOUSE_EVENT_BUTTONS {
    None = 0,
    Left = 1,
    Middle = 2,
    Right = 4,
    Back = 8,
    Forward = 16
}

export class BoardController {
    protected _board!: Board
    protected _editMode: boolean = false;
    protected _fileName!: string;
    private _overlay: MOverlay;

    constructor(protected view: IBoardView) {
        if (!document) {
            throw new Error('Document is not defined.');
        }

        this.createBoard();

        this.view.attach('click', this.onCanvasClick);
        this.view.attach('mousemove', this.onCanvasMouseMove);

        this._overlay = <MOverlay>document.getElementsByTagName('m-overlay')[0];
        this._overlay.addEventListener('abort', (event: UIEvent) => {
            this.abort();
        });
    }

    set editMode(v: boolean) {
        this._editMode = v;
    }
    get editMode(): boolean {
        return this._editMode;
    }

    onCanvasClick = (event: MouseEvent, cell: Cell) => {
        if (cell && cell.row < 0 || cell.row >= this._board.rows ||
            cell.col < 0 || cell.col >= this._board.cols) {
            return;
        }

        if (this.editMode) {
            let pearl = Pearl.None;
            switch (event.button) {
                case MOUSE_EVENT_BUTTON.Left: pearl = Pearl.White; break;
                case MOUSE_EVENT_BUTTON.Right: pearl = Pearl.Black; break;
            }

            if (pearl != Pearl.None) {
                let cur = this._board.getPearl(cell);
                if (cur === pearl) {
                    pearl = Pearl.None;
                }

                this._board.setPearl(cell, pearl);
                this.view.refresh(this._board.checkSolving());
            }
        }
    }

    onCanvasMouseMove = (event: MouseEvent, prevCell: Cell, currCell: Cell) => {
        if (!prevCell || !currCell) {
            return;
        }

        if (!(event.buttons & MOUSE_EVENT_BUTTONS.Left)) {
            return;
        }

        // Интересуют только соседние ячейки (по горизонтали и вертикали)
        if (Math.abs(currCell.row - prevCell.row) < 2 && Math.abs(currCell.col - prevCell.col) < 2) {
            this._board.linkNeighborsCells(prevCell, currCell);
            this.view.refresh(this._board.checkSolving());
        }
    }

    createBoard(rows: number = 0, cols: number = 0) {
        this._board = new Board(rows, cols);
        this._fileName = `${rows}x${cols}_${this._board.id}.masyu`;

        this.view.refresh(this._board.getData());
    }

    load(file: File) {
        if (!file) {
            return;
        }
        this._fileName = file?.name ?? '';

        let fr = new FileReader();
        fr.onload = (event) => {
            const data = <string>event.target?.result;
            this._board = new Board(data);
            this.view.refresh(this._board.checkSolving());
        };
        fr.readAsText(file, 'text/plain;charset=utf-8');
    }

    save() {
        const a = document.createElement('a');
        const blob = new Blob([this._board.serialize()], { type: 'text/plain;charset=utf-8' });
        a.href = URL.createObjectURL(blob);
        a.download = this._fileName;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    // Сброс к начальному состоянию
    reset() {
        this._board.reset();
        this.view.refresh(this._board.getData());
    }

    abort() {
        this._board.graph.worker.terminate();
    }

    scatterPearls() {
        this._board.reset();
        this._board.scatterPearls();
        this.view.refresh(this._board.getData());
    }

    async generate(whitePearls?: number, blackPearls?: number) {
        this._overlay.show();
        await this._board.generate(whitePearls, blackPearls).catch(reason => console.warn(reason));
        this.view.refresh(this._board.getData());
        this._overlay.hide();
    }

    async solve() {
        this._overlay.show();
        await this._board.solve().catch(reason => console.warn(reason));
        this.view.refresh(this._board.getData());
        this._overlay.hide();
    }
}