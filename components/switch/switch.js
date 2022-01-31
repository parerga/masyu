import template from './switch.tmpl.js';

export class MSwitch extends HTMLElement {
    constructor(options = {}) {
        super();

        this.addEventListener('click', e => {
            if (this.disabled) {
                return;
            }

            this._toggle();
        });
    }

    static get observedAttributes() {
        return ['checked'];
    }

    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.append(document.importNode(template({}).content, true));
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'checked': {
                this.dispatchEvent(new CustomEvent('change', {
                    bubbles: false,
                    cancelable: true,
                    detail: this.checked
                }));
                break;
            }
            default:
        }
    }

    get disabled() {
        return this.hasAttribute('disabled');
    }
    set disabled(val) {
        if (val) {
            this.setAttribute('disabled', '');
        } else {
            this.removeAttribute('disabled');
        }
    }

    get checked() {
        return this.hasAttribute('checked');
    }
    set checked(val) {
        if (val) {
            this.setAttribute('checked', '');
        } else {
            this.removeAttribute('checked');
        }
    }

    _toggle() {
        this.checked = !this.checked;
    }
}

customElements.define('m-switch', MSwitch);