const MAX_LISTENERS = 8;

export class Events {
    private _events: { [key: string]: Function[] } = {};

    constructor() {
    }

    attach(type: string, listener: Function, options: any = {}) {
        let existing = this._events[type];
        if (!existing) {
            this._events[type] = [];
        } else if (existing.length >= MAX_LISTENERS) {
            console.warn(`Possible memory leak detected. Added ${existing.length} ${type} listeners.`);
        }
        this._events[type].push(listener);
    }

    detach(type: string, listener?: Function) {
        if (!listener) {
            delete this._events[type];
        } else {
            let handlers = this._events[type] || [];
            let idx = handlers.indexOf(listener);
            if (idx >= 0) {
                handlers.splice(idx, 1);
            }
        }
    }

    once(type: string, listener: Function, options: any = {}) {
        const wrapper = (...args: any[]) => {
            this.detach(type, wrapper);
            return listener.apply(this, args);
        }

        this.attach(type, wrapper, options);
    }

    fire<T extends any[]>(type: string, ...args: T) {
        let listeners = this._events[type] || [];
        for (let i = 0; i < listeners.length; i++) {
            let l = listeners[i];
            Function.prototype.apply.call(l, this, args);
        }
    }
}