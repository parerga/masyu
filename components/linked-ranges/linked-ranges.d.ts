interface HTMLElementEventMap {
    'change': CustomEvent;
}

declare class MLinkedRanges extends HTMLElement {
    get min(): number;
    set min(v: number);
    get max(): number;
    set max(v: number);
    get step(): number;
    set step(v: number);
    get value1(): number;
    get value2(): number;
    get disabled(): boolean;
    set disabled(v: boolean);
}