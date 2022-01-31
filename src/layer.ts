export interface LayerOptions {
    id: string,
    width: number,
    height: number,
    background: string,
    index: number
}

export class Layer {
    protected readonly _el: HTMLCanvasElement;
    protected readonly _ctx: CanvasRenderingContext2D | null = null;
    readonly index: number;
    readonly transparent: boolean;
    readonly background: string;

    constructor(container: HTMLElement, { id, width, height, background, index }: Readonly<LayerOptions>) {
        this._el = document.createElement('canvas');
        this._el.id = id;

        this.width = width;
        this.height = height;
        this.index = index;
        if (index !== undefined) {
            this._el.style.setProperty('z-index', '' + index);
        }

        container.append(this._el);

        this.background = background;
        this.transparent = background === 'transparent';
        this._ctx = this._el?.getContext('2d', { alpha: this.transparent });
        if (!this._ctx) {
            throw new Error('Bad canvas context!');
        }
    }

    get width(): number {
        return this._el.width;
    }
    set width(w: number) {
        this._el.width = w;
    }
    get height(): number {
        return this._el.height;
    }
    set height(h: number) {
        this._el.height = h;
    }
    get ctx() {
        return this._ctx;
    }

    clear() {
        if (!this._ctx) {
            return;
        }

        if (this.transparent) {
            this._ctx.clearRect(0, 0, this._el.width, this._el.height);
        } else {
            this._ctx.fillStyle = this.background;
            this._ctx.fillRect(0, 0, this._el.width, this._el.height);
        }
    }

    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any,
                                                          options?: boolean | AddEventListenerOptions): void {
        this._el.addEventListener(type, listener, options);
    }

    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any,
                                                             options?: boolean | EventListenerOptions): void {
        this._el.removeEventListener(type, listener);
    }
}
