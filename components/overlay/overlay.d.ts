interface HTMLElementEventMap {
    'beforeShow': CustomEvent;
}

declare class MOverlay extends HTMLElement {
    show(): void;
    hide(): void;
    toggle(): void;
}