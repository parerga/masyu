import template from './tabs.tmpl.js';

class MTabs extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.append(document.importNode(template({}).content, true));

        this.addEventListener('click', this._onClick);

        this._tabSlot = this.shadowRoot.querySelector('slot[name=tab]');
        this._panelSlot = this.shadowRoot.querySelector('slot[name=panel]');
        this._tabSlot.addEventListener('slotchange', this._onSlotChange);
        this._panelSlot.addEventListener('slotchange', this._onSlotChange);

        Promise.all([
            customElements.whenDefined('m-tab'),
            customElements.whenDefined('m-panel'),
        ]).then(() => this.initTabs());
    }

    disconnectedCallback() {
        this.removeEventListener('click', this._onClick);
    }

    _onClick = (e) => {
        const target = e.target;
        if (target.getAttribute('slot') !== 'tab') {
            return ;
        }

        this.select(target);
    }

    _onSlotChange = (e) => {
        this.initTabs();
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

    initTabs() {
        let tabs = this.tabs();
        tabs.forEach((tab, i) => {
            const panel = tab.nextElementSibling;
            if (panel.tagName.toLowerCase() !== 'm-panel') {
                return;
            }

            tab.setAttribute('aria-controls', panel.id);
            panel.setAttribute('aria-labelledby', tab.id);
            tab.setAttribute('id', tab.id);
            tab.dataset.index = i;
            panel.setAttribute('id', panel.id);
        });

        this.deselectAll();
    }

    tabs() {
        return Array.from(this.querySelectorAll('m-tab')) || [];
    }

    tabByIndex(i) {
        if (typeof i !== 'number') {
            return void 0;
        }

        let tabs = this.tabs();
        if (i < 0) {
            i = 0;
        } else if (i >= tabs.length) {
            i = tabs.length - 1;
        }

        return tabs[i];
    }

    panels() {
        return Array.from(this.querySelectorAll('m-panel')) || [];
    }

    panelByTab(tab) {
        const pid = tab.getAttribute('aria-controls');
        return this.querySelector(`m-panel[id=${pid}]`);
    }

    deselect(tab = 0) {
        if (typeof tab === 'number') {
            tab = this.tabByIndex(tab);
        }
        if (!(tab instanceof MTab)) {
            return;
        }

        const panel = this.panelByTab(tab);
        if (!panel) {
            return;
        }

        tab.selected = false;
        panel.hidden = true;

        this.dispatchEvent(new CustomEvent('deselect', {
            bubbles: false,
            cancelable: true,
            detail: tab
        }));
    }

    deselectAll() {
        const tabs = this.tabs();
        const panels = this.panels();

        tabs.forEach(tab => tab.selected = false);
        panels.forEach(panel => panel.hidden = true);
    }

    select(tab = 0) {
        if (typeof tab === 'number') {
            tab = this.tabByIndex(tab);
        }

        if (!(tab instanceof MTab) || tab === this.selected) {
            return;
        }

        const panel = this.panelByTab(tab);
        if (!panel) {
            return;
        }

        this.deselect(this.selected);
        this.selected = tab;

        tab.selected = true;
        panel.hidden = false;

        this.dispatchEvent(new CustomEvent('select', {
            bubbles: false,
            cancelable: true,
            detail: tab
        }));
    }
}
customElements.define('m-tabs', MTabs);

///////////////////////////////////////////////////////////////////////////////
let tabIdCounter = 0;
let genTabId = () => tabIdCounter++;
class MTab extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        if (!this.id) {
            this.id = 'tab-id' + genTabId();
        }
    }

    set selected(value) {
        value = Boolean(value);
        if (value)
            this.setAttribute('selected', '');
        else
            this.removeAttribute('selected');
    }
    get selected() {
        return this.hasAttribute('selected');
    }

    get index() {
        return +this.dataset.index;
    }
}
customElements.define('m-tab', MTab);

///////////////////////////////////////////////////////////////////////////////
let panelIdCounter = 0;
let genPanelId = () => panelIdCounter++;
class MPanel extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        if (!this.id) {
            this.id = 'panel-id' + genPanelId();
        }
    }

    set hidden(value) {
        value = Boolean(value);
        if (value)
            this.setAttribute('hidden', '');
        else
            this.removeAttribute('hidden');
    }
    get hidden() {
        return this.hasAttribute('hidden');
    }
}
customElements.define('m-panel', MPanel);
