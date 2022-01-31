import template from './overlay.tmpl.js';

export class MOverlay extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.append(document.importNode(template({}).content, true));

        this.btnAbort = this.shadowRoot.querySelector('button');
        this.btnAbort.addEventListener('click', this._onAbortClick);

        this.hide();
    }

    _onAbortClick = (e) => {
        this.dispatchEvent(new UIEvent('abort', e));
        this.hide();
    }

    get abort() {
        return Number(this.getAttribute('abort') || 0);
    }
    set abort(v) {
        this.setAttribute('abort', v);
    }

    get hidden() {
        return this.hasAttribute('hidden');
    }
    set hidden(val) {
        if (val) {
            this.setAttribute('hidden', '');
        } else {
            let canceled = !this.dispatchEvent(new CustomEvent('beforeShow', {
                bubbles: false,
                cancelable: true
            }));
            if (!canceled) {
                this.removeAttribute('hidden');
            }
        }
    }

    show() {
        this.hidden = false;

        if (this.abort > 0) {
            this.timeout = setTimeout(() => {
                this.btnAbort.hidden = false;
            }, this.abort);
        }
    }

    hide() {
        this.hidden = true;
        this.btnAbort.hidden = true;
        clearTimeout(this.timeout);
    }

    toggle() {
        this.hidden = !this.hidden;
    }
}

customElements.define('m-overlay', MOverlay);