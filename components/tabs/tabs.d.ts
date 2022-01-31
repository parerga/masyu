interface HTMLElementEventMap {
    'select': CustomEvent;
    'deselect': CustomEvent;
}

declare class MTabs extends HTMLElement {
    constructor();
    tabs(): MTab[];
    panels(): MPanel[];
    panelByTab(tab: MTab): MPanel;
    select(tab: MTab | number): MTab;

    get disabled(): boolean;
    set disabled(v: boolean);
}

declare class MTab extends HTMLElement {
    get index(): number;
    get selected(): boolean;
    set selected(v: boolean);
}

declare class MPanel extends HTMLElement {
    get hidden(): boolean;
    set hidden(v: boolean);
}
