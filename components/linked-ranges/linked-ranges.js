import template from './linked-ranges.tmpl.js';

export class MLinkedRanges extends HTMLElement {
    constructor(options = {}) {
        super();

        const min = Math.ceil(Math.sqrt(this.min));
        const max = Math.ceil(Math.sqrt(this.max));

        this.r1min = this.r2min = min;
        this.r1max = this.r2max = Math.min(this.max / min, max + this.step);
    }

    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        let html = document.importNode(template({
            r1min: this.r1min,
            r1max: this.r1max,
            r1value: this.value1,
            r2min: this.r2min,
            r2max: this.r2max,
            r2value: this.value2,
            step: this.step
        }).content, true);
        this.shadowRoot.append(html);

        this._range1 = this.shadowRoot.querySelector('#range1');
        this._range2 = this.shadowRoot.querySelector('#range2');

        this._r1label = (this.querySelector('[slot=label1]') || {}).textContent || 'Range 1:';
        this._r2label = (this.querySelector('[slot=label2]') || {}).textContent || 'Range 2:';

        // Делений диапазона
        let divs = (this.r1max - this.r1min) / this.step;
        // Половина в меньшую сторону + минимум - начальное значение
        this.value1 = this.r1min + Math.floor(divs / 2) * this.step;

        divs = (this.r2max - this.r2min) / this.step;
        this.value2 = this.r2min + Math.floor(divs / 2) * this.step;

        this._range1.addEventListener('change', this._onChange);
        this._range2.addEventListener('change', this._onChange);
        this._range1.addEventListener('input', this._onInput);
        this._range2.addEventListener('input', this._onInput);
    }

    disconnectedCallback() {
        this._range1.removeEventListener('change', this._onChange);
        this._range2.removeEventListener('change', this._onChange);
        this._range1.removeEventListener('input', this._onInput);
        this._range2.removeEventListener('input', this._onInput);
    }

    _updateLabels() {
        this._range1.previousElementSibling.textContent = this._r1label + ' ' + this._range1.value;
        this._range2.previousElementSibling.textContent = this._r2label + ' ' + this._range2.value;
    }

    _newMinMax(target) {
        const min = Math.ceil(Math.sqrt(this.min));
        const max = Math.ceil(Math.sqrt(this.max));

        const curValue = +target.value;
        let newMax = Math.floor(this.max / curValue);

        const setValues = (value, range, rmax) => {
            if (curValue > max) {
                if (this[value] > newMax) {
                    this[value] = newMax;
                }
            } else {
                newMax = rmax;
            }
            range.setAttribute('max', newMax);
        }

        if (target.id === 'range1') {
            setValues('value2', this._range2, this.r2max);
        } else if (target.id === 'range2') {
            setValues('value1', this._range1, this.r1max);
        }
    }

    _onChange = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const target = event.target;
        const value = Number(event.target.value);
        if (target.id === 'range1') {
            this.value1 = value;
        } else if (target.id === 'range2') {
            this.value2 = value;
        }
    }

    _onInput = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const target = event.target;
        this._newMinMax(target);
        this._updateLabels();

        this._fireEvent('input');
    }

    _fireEvent(type) {
        let detail = {};
        detail.value1 = Number(this._range1.value);
        detail.value2 = Number(this._range2.value);

        const e = new CustomEvent(type, {
            bubbles: false,
            cancelable: true,
            detail: detail
        });

        this.dispatchEvent(e);
    }

    get min() {
        return Number(this.getAttribute('min') || 16);
    }
    set min(v) {
        this.setAttribute('min', v);
    }

    get max() {
        return Number(this.getAttribute('max') || 100);
    }
    set max(v) {
        this.setAttribute('max', v);
    }

    get step() {
        return Number(this.getAttribute('step') || 2);
    }
    set step(v) {
        this.setAttribute('step', v);
    }

    get value1() {
        return this._r1value;
    }
    set value1(v) {
        v = Number(v);
        if (v !== this._r1value) {
            this._r1value = v;
            this._range1.value = v;
            this._updateLabels();
            this._fireEvent('change');
        }
    }

    get value2() {
        return this._r2value;
    }
    set value2(v) {
        v = Number(v);
        if (v !== this._r2value) {
            this._r2value = v;
            this._range2.value = v;
            this._updateLabels();
            this._fireEvent('change');
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
}

customElements.define('m-linked-ranges', MLinkedRanges);