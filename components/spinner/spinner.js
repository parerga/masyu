import template from './spinner.tmpl.js';

export class MSpinner extends HTMLElement {
    constructor(options = {}) {
        super();
    }

    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.append(document.importNode(template({}).content, true));
    }
}

customElements.define('m-spinner', MSpinner);