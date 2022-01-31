interface HTMLElementEventMap {
    'change': CustomEvent;
}

declare class MSwitch extends HTMLElement {
    get disabled(): boolean;
    set disabled(val: boolean);
    get checked(): boolean;
    set checked(val: boolean);
}
