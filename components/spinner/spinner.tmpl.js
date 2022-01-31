const html = String.raw;
const template = (options) => {
    const tmpl = document.createElement('template');
    tmpl.innerHTML = html`
        <style>
            .spinner {
                display: inline-block;
                width: 2rem;
                height: 2rem;
                z-index: 2048;


                vertical-align: text-bottom;

                border: 0.3rem solid transparent;
                border-top: 0.3rem solid var(--spinner-color, #0075ff); 
                border-bottom: 0.3rem solid var(--spinner-color, #0075ff);
                border-radius: 50%;

                animation: spinner-s 1s cubic-bezier(0, 0, 0.4, 1) infinite;
            }

            @keyframes spinner-s {
                to { 
                    transform: rotate(360deg) }; 
                }
            }
        </style>

        <span class="spinner"></span>
    `;
    return tmpl;
}

export default template;