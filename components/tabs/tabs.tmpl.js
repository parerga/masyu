const html = String.raw;
const template = (options) => {
    const tmpl = document.createElement('template');
    tmpl.innerHTML = html`
        <style>
            :host {
                display: flex;
                flex-wrap: wrap;
            }
            ::slotted(m-panel) {
                flex-basis: 100%;
                padding: 20px;

                border-left: 1px solid var(--stroke-color, #8c8c8c);
                border-right: 1px solid var(--stroke-color, #8c8c8c);
                border-top: 1px solid var(--stroke-color, #8c8c8c);
            }

            ::slotted(m-tab) {
                border-top-left-radius: 5px;
                border-top-right-radius: 5px;
                padding: 20px;
            
                cursor: pointer;
            
                color: var(--foreground-color);
                border-top: 1px solid var(--stroke-color, #8c8c8c);
                border-right: 1px solid var(--stroke-color, #8c8c8c);
                border-left: 1px solid var(--stroke-color, #8c8c8c);
            }

            ::slotted(m-tab:hover) {
                color: var(--tab-hover-color);
                background-color: var(--tab-hover-bg-color, #efefef);
            }
            ::slotted(m-tab[selected]) {
                margin-top: -3px;

                color: var(--tab-selected-color);
                border-bottom: 4px solid var(--tab-selected-secondary-color, #0075ff);
            }
            ::slotted(m-tab[selected]:hover) {
                color: var(--tab-selected-hover-color);
                background-color: var(--tab-selected-hover-bg-color, #efefef);
                border-bottom: 4px solid var(--tab-selected-hover-secondary-color, #0075ff);
            }

        </style>
        <slot name="tab"></slot>
        <slot name="panel"></slot>
    `;
    return tmpl;
}

export default template;