const html = String.raw;
const template = (options) => {
    const tmpl = document.createElement('template');
    tmpl.innerHTML = html`
        <style>
            :host {
            }
            .overlay {
                position: absolute;
                inset: 0px;
                z-index: 1024;
                background-color: rgba(255, 255, 255, var(--overlay-opacity, 0.3));
            }
            .overlay > button {
                position: relative;
                top: calc(50% + 50px);
                left: calc(50% - 50px);
                width: 100px;
                padding: 7px;
                box-shadow: 0px 0px 10px rgb(200, 200, 200);
            }
        </style>

        <div class="overlay">
            <slot></slot>
            <button type="button">Abort</button>
        </div>
    `;
    return tmpl;
}

export default template;