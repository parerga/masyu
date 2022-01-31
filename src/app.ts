import { BoardView } from './bview.js';
import { BoardController } from './bcontroller.js';

const view = new BoardView();
const controller = new BoardController(view);

///////////////////////////////////////////////////////////////////////////////
const editMode = <MSwitch>document.getElementById('editMode');
editMode.addEventListener('change', (event: CustomEvent) => {
    controller.editMode = event.detail;
});

///////////////////////////////////////////////////////////////////////////////
const lrCreatePuzzle = <MLinkedRanges>document.getElementById('lrCreatePuzzle');
const lrGenPuzzle = <MLinkedRanges>document.getElementById('lrGenPuzzle');
lrCreatePuzzle?.addEventListener('change', onBoardSizeChange);
lrGenPuzzle?.addEventListener('change', onBoardSizeChange);

///////////////////////////////////////////////////////////////////////////////
const tabs = <MTabs>document.getElementById('controls');
tabs.addEventListener('select', (event: CustomEvent) => {
    const tab = event.detail;
    const panel = tabs.panelByTab(tab);

    const boardSizeEl = <MLinkedRanges>panel.querySelector(`m-linked-ranges`);
    controller.createBoard(boardSizeEl?.value1, boardSizeEl?.value2);

    editMode.checked = panel.id === 'panelCreatePuzzle';
    editMode.disabled = panel.id === 'panelGenPuzzle';
});
tabs.select(0);

///////////////////////////////////////////////////////////////////////////////
const flLoadPuzzle = <HTMLInputElement>document.getElementById('flLoadPuzzle');
flLoadPuzzle.addEventListener('change', (event) => {
    let file = flLoadPuzzle.files?.[0];
    if (file) {
        controller.load(file);
    }
});
document.getElementById('btnLoadPuzzle')?.addEventListener('click', (event) => {
    flLoadPuzzle.click();
});

document.getElementById('btnNewPuzzle')?.addEventListener('click', (event) => {
    controller.generate();
});

document.getElementById('btnScatterPearls')?.addEventListener('click', (event) => {
    controller.scatterPearls();
});

document.getElementById('btnReset')?.addEventListener('click', (event) => {
    controller.reset();
});

document.getElementById('btnSolve')?.addEventListener('click', (event) => {
    controller.solve();
});

document.getElementById('btnSaveBoard')?.addEventListener('click', (event) => {
    controller.save();
});

function onBoardSizeChange(event: CustomEvent) {
    const t = <MLinkedRanges>event.target;
    controller.createBoard(t.value1, t.value2);
}
