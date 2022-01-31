const template = (options) => {
    let opts = '';
    for (let i = options.r1min; i <= options.r1max; i = i + options.step) {
        opts += `<option value="${i}" />\n`;
    }

    const tmpl = document.createElement('template');
    tmpl.innerHTML = `
        <style>
            :host {
                display: block;
            }
            input {
                display: block;
                width: 220px;
                background-color: var(--primary-background-color);
            }
            input[type=range] {
                -webkit-appearance: none;

                height: 26px;
            }

            /* webkit */
            input[type=range]::-webkit-slider-thumb {
                -webkit-appearance: none;

                height: 18px;
                width: 18px;
                margin-top: -6px;

                border: none;
                border-radius: 3px;
                background: var(--accent-color);
                box-shadow: 0 0 2px var(--primary-color);
            }
            input[type=range]::-webkit-slider-runnable-track {
                height: 6px;

                border-radius: 3px;
                border: 1px solid var(--primary-stroke-color);
                background: var(--primary-fill-color);
                box-shadow: none;
            }
            input[type=range]::-webkit-slider-thumb:hover {
                background: var(--accent-hover-color);
            }
            input[type=range]:hover::-webkit-slider-runnable-track { 
                border-color: var(--primary-stroke-hover-color);
                background: var(--primary-fill-hover-color);
            }
            
            /* mozilla */
            input[type=range]::-moz-range-thumb {
                -webkit-appearance: none;

                height: 18px;
                width: 18px;
                margin-top: -6px;

                border: none;
                border-radius: 3px;
                background: var(--accent-color);
                box-shadow: 0 0 2px var(--primary-color);
            }
            input[type=range]::-moz-range-track {
                height: 6px;

                border-radius: 3px;
                border: 1px solid var(--primary-stroke-color);
                background: var(--primary-fill-color);
                box-shadow: none;
            }
            input[type=range]::-moz-range-thumb:hover {
                background: var(--accent-hover-color);
            }
            input[type=range]:hover::-moz-range-track {
                border-color: var(--primary-stroke-hover-color);
                background: var(--primary-fill-hover-color);
            }
        </style>
        
        <datalist id="dimensionMarks">${opts}</datalist>
        <label for="range1"><slot name="label1"></slot></label>
        <input type="range" min="${options.r1min}" max="${options.r1max}" 
               id="range1" step="${options.step}" value="${options.r1value}" list="dimensionMarks">
        <label for="range2"><slot name="label2"></slot></label>
        <input type="range" min="${options.r2min}" max="${options.r2max}" 
               id="range2" step="${options.step}" value="${options.r2value}" list="dimensionMarks">
    `;
    return tmpl;
}

export default template;