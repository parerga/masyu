import { Events } from './events.js';
import { BoardData, CardinalDirection, cardinalDirection, Cell } from './btypes.js';
import { getStyleVar } from './utils.js';
import { Layer } from './layer.js';

const CELL_SIZE = 50;
const BOARD_OFFSET_X = 50;
const BOARD_OFFSET_Y = 50;

const WIDTH_BORDER = 4;
const WIDTH_STROKE = 2;
const WIDTH_CELL = 1;
const WIDTH_PATH = 4;

const BACKGROUND_COLOR = getStyleVar('primary-background-color') || '#ffffff';

const STROKE_COLOR = getStyleVar('stroke-color') || '#000000';
const FAIL_COLOR = getStyleVar('fail-color') || '#e23c3c';
const SOLVED_COLOR = getStyleVar('solve-color') || '#6de23c';
const PATH_COLOR = getStyleVar('path-color') || STROKE_COLOR;

const WHITE_PEARL_COLOR = getStyleVar('white-pearl-fill-color') || '#ffffff';
const BLACK_PEARL_COLOR = getStyleVar('black-pearl-fill-color') || '#000000';

interface DrawOptions {
    strokeStyle: string | CanvasGradient | CanvasPattern;
}

export interface IBoardView {
    refresh(board: BoardData): void;
    attach(type: string, listener: Function, options?: any): void;
    detach(type: string, listener?: Function): void;
}

export class BoardView extends Events implements IBoardView {
    private _startCell: Cell = { row: -1, col: -1 };
    private _currentCell: Cell = { row: -1, col: -1 };
    private _leaveCell: boolean = false;

    protected bgLayer: Layer;
    protected pearlLayer: Layer;
    protected pathLayer: Layer;

    constructor(private _rows: number = 0, private _cols: number = 0) {
        super();

        const w = this.width;
        const h = this.height;
        const container = <HTMLElement>document.querySelector('.puzzle-board');

        this.bgLayer = new Layer(container, {
            id: 'background-layer', width: w, height: h, background: BACKGROUND_COLOR, index: 0
        });
        this.pearlLayer = new Layer(container, {
            id: 'pearl-layer', width: w, height: h, background: 'transparent', index: 1
        });
        this.pathLayer = new Layer(container, {
            id: 'path-layer', width: w, height: h, background: 'transparent', index: 2
        });

        this.clear();
        this.pathLayer.addEventListener('contextmenu', (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            return false;
        });
        this.pathLayer.addEventListener('mousedown', this._onMouseDown);
        this.pathLayer.addEventListener('mouseup', this._onMouseUp);
    }

    get width(): number {
        return this._cols * CELL_SIZE + BOARD_OFFSET_Y * 2;
    }
    get height(): number {
        return this._rows * CELL_SIZE + BOARD_OFFSET_X * 2;
    }

    // Перерисовать данные игровой доски
    refresh(grid: BoardData) {
        const cells = grid.cells;
        const rows = cells.length;
        if (!rows) {
            this.setGridSize(0, 0);
            this.clear();
            return;
        }

        const cols = grid.cells[0].length;
        // Если размеры доски изменились
        if (this._rows !== rows || this._cols !== cols) {
            this.setGridSize(rows, cols);
            this.drawGrid();
        }

        this.drawBorder({ strokeStyle: grid.solved === undefined ? STROKE_COLOR : grid.solved ? SOLVED_COLOR : FAIL_COLOR });

        for (let i = 0; i < this._rows; i++) {
            let row = cells[i];
            for (let j = 0; j < this._cols; j++) {
                let cell = row[j];
                this.drawPearl(i, j, cell.pearl?.kind, { strokeStyle: cell.pearl?.fail ? FAIL_COLOR : STROKE_COLOR });
                this.drawDirections(i, j, cell.path?.directions, { strokeStyle: cell.path?.fail ? FAIL_COLOR : STROKE_COLOR });
            }
        }
    }

    setGridSize(rows: number, cols: number) {
        this._rows = rows < 0 ? 0 : rows;
        this._cols = cols < 0 ? 0 : cols;

        this.pathLayer.width = this.pearlLayer.width = this.bgLayer.width = this.width;
        this.pathLayer.height = this.pearlLayer.height = this.bgLayer.height = this.height;
    }

    // Нарисовать границу сетки игрового поля.
    // Используется для цветовой индикации успешности решения.
    drawBorder(options: Partial<DrawOptions> = {}) {
        const ctx = this.bgLayer.ctx;
        if (!ctx) {
            return;
        }

        ctx.beginPath();
        ctx.strokeStyle = options.strokeStyle ?? STROKE_COLOR;
        ctx.lineWidth = WIDTH_BORDER;
        ctx.rect(BOARD_OFFSET_X, BOARD_OFFSET_Y, CELL_SIZE * this._cols, CELL_SIZE * this._rows);
        ctx.stroke();
    }

    // Нарисовать сетку игрового поля
    drawGrid(options: Partial<DrawOptions> = {}) {
        const ctx = this.bgLayer.ctx;
        if (!ctx) {
            return;
        }

        this.clear();
        this.drawBorder();

        ctx.setLineDash([1, 1]);
        ctx.beginPath();
        ctx.lineWidth = WIDTH_CELL;

        const rowsPlus1 = this._rows + 1;
        const colsPlus1 = this._cols + 1;
        for (let i = 2; i < rowsPlus1; i++) {
            ctx.moveTo(BOARD_OFFSET_X, CELL_SIZE * i + 0.5);
            ctx.lineTo(CELL_SIZE * colsPlus1, CELL_SIZE * i + 0.5);
        }
        for (let i = 2; i < colsPlus1; i++) {
            ctx.moveTo(CELL_SIZE * i + 0.5, BOARD_OFFSET_Y);
            ctx.lineTo(CELL_SIZE * i + 0.5, CELL_SIZE * rowsPlus1);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Нарисовать жемчужину
    drawPearl(row: number, col: number, pearl: Pearl = Pearl.None, options: Partial<DrawOptions> = {}) {
        const ctx = this.pearlLayer.ctx;
        if (!ctx) {
            return;
        }

        const x = BOARD_OFFSET_X + col * CELL_SIZE + CELL_SIZE / 2;
        const y = BOARD_OFFSET_Y + row * CELL_SIZE + CELL_SIZE / 2;

        ctx.fillStyle = BACKGROUND_COLOR;
        ctx.fillRect((x - CELL_SIZE / 2) + WIDTH_BORDER / 2,
            (y - CELL_SIZE / 2) + WIDTH_BORDER / 2,
            CELL_SIZE - WIDTH_BORDER, CELL_SIZE - WIDTH_BORDER);

        if (pearl !== Pearl.None) {
            ctx.beginPath();
            ctx.lineWidth = WIDTH_STROKE;
            ctx.arc(x, y, 20, 0, Math.PI * 2, true);
            ctx.fillStyle = pearl === Pearl.Black ? BLACK_PEARL_COLOR : WHITE_PEARL_COLOR;
            ctx.fill();
            ctx.strokeStyle = options.strokeStyle ?? STROKE_COLOR;
            ctx.stroke();
        }
    }

    // Нарисовать линии из центра ячейки в направлении сторон света
    drawDirections(row: number, col: number, dirs: CardinalDirection = cardinalDirection(), options: Partial<DrawOptions>) {
        const ctx = this.pathLayer.ctx;
        if (!ctx) {
            return;
        }

        const x = BOARD_OFFSET_X + col * CELL_SIZE + CELL_SIZE / 2;
        const y = BOARD_OFFSET_Y + row * CELL_SIZE + CELL_SIZE / 2;

        ctx.beginPath();
        ctx.clearRect(x - CELL_SIZE / 2, y - CELL_SIZE / 2, CELL_SIZE, CELL_SIZE);

        ctx.beginPath();
        ctx.lineWidth = WIDTH_PATH;
        ctx.strokeStyle = options.strokeStyle ?? STROKE_COLOR;

        if (dirs.north) {
            ctx.moveTo(x, y);
            ctx.lineTo(x, y - CELL_SIZE / 2);
        }
        if (dirs.west) {
            ctx.moveTo(x, y);
            ctx.lineTo(x - CELL_SIZE / 2, y);
        }
        if (dirs.east) {
            ctx.moveTo(x, y);
            ctx.lineTo(x + CELL_SIZE / 2, y);
        }
        if (dirs.south) {
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + CELL_SIZE / 2);
        }
        ctx.stroke();

        if (dirs.north || dirs.west || dirs.east || dirs.south) {
            ctx.fillStyle = ctx.strokeStyle;
            ctx.beginPath();
            ctx.arc(x, y, WIDTH_PATH / 2, 0, Math.PI * 2, true);
            ctx.fill();
        }
    }

    // Очистить все слои
    clear() {
        this.bgLayer.clear();
        this.pearlLayer.clear();
        this.pathLayer.clear();
    }

    private _onMouseDown = (event: MouseEvent) => {
        const row = Math.floor((event.offsetY - BOARD_OFFSET_Y) / CELL_SIZE);
        const col = Math.floor((event.offsetX - BOARD_OFFSET_X) / CELL_SIZE);

        if (row < 0 || col < 0 || row > this._rows - 1 || col > this._cols - 1) {
            return;
        }

        this._startCell = this._currentCell = { row, col };
        this._leaveCell = false;
        this.fire('mousedown', event, this._currentCell);
        this.pathLayer.addEventListener('mousemove', this._onMouseMove);
    }

    private _onMouseUp = (event: MouseEvent) => {
        if (this._startCell.row === this._currentCell.row && this._startCell.col === this._currentCell.col && !this._leaveCell) {
            this.fire('click', event, this._currentCell);
        } else {
            this.fire('mouseup', event, this._currentCell);
        }

        this._currentCell = this._startCell = { row: -1, col: -1 };
        this.pathLayer.removeEventListener('mousemove', this._onMouseMove);
    }

    private _onMouseMove = (event: MouseEvent) => {
        if (this._currentCell.row < 0 || this._currentCell.col < 0) {
            return;
        }

        const x = event.offsetX;
        const y = event.offsetY;
        const row = Math.floor((y - BOARD_OFFSET_Y) / CELL_SIZE);
        const col = Math.floor((x - BOARD_OFFSET_X) / CELL_SIZE);

        if (row < 0 || col < 0 || row > this._rows - 1 || col > this._cols - 1) {
            return;
        }

        let offsetRow = row - this._currentCell.row;
        let offsetCol = col - this._currentCell.col;

        if (offsetRow || offsetCol) {
            const cell = { row, col };
            this._leaveCell = true;
            this.fire('mousemove', event, this._currentCell, cell);
            this._currentCell = cell;
        }
    }
}
