const html = String.raw;
const template = (options) => {
    const tmpl = document.createElement('template');
    tmpl.innerHTML = html`
        <style>
            :host {
                display: flex;
                align-items: center;
                user-select: none;
            }
            :host([disabled]) {
                opacity: 0.3;
                cursor: default;
            }
            :host(:not([disabled]) .switch:hover) {
                border-color: var(--stroke-hover-color, #8c8c8c);
            }
            :host([checked]) .switch {
                background-color: var(--checked-background-color, #c6e6ff);
            }
            :host([checked]) .slider {
                float: right;
                background-color: var(--checked-slider-color, #0075ff);
            }
            :host([checked]) .mark > slot[name="mark-off"] {
                display: none;
            }
            :host(:not([checked])) .mark > slot[name="mark-on"] {
                display: none;
            }
            .label {
                margin-inline-end: 5px;
            }
            .switch {
                width: 35px;
                height: 15px;
                padding: 4px;

                cursor: pointer;

                border: 1px solid var(--stroke-color, #b2b2b2);
                border-radius: 3px;
                background-color: var(--background-color, #efefef);
            }
            .slider {
                display: block;

                width: 15px;
                height: 15px;

                border-radius: var(--border-radius, 3px);
                background-color: var(--slider-color, #b2b2b2);
            }
            .mark {
                margin-left: 5px;
            }
        </style>
        <label class="label">
            <slot></slot>
        </label>
        <div class="switch">
            <span class="slider"></span>
        </div>
        <span class="mark">
            <slot name="mark-on">On</slot>
            <slot name="mark-off">Off</slot>
        </span>
    `;
    return tmpl;
}

export default template;