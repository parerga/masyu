import { Events } from './events.js';

export class WorkerManager extends Events {
    private _workers: Worker[] = [];

    constructor() {
        super();
    }

    run(job: string, data: any): Worker {
        const [cls, func] = job.split('.');

        const worker = new Worker(`./src/workers/${cls.toLowerCase()}-worker.js`, { name: cls, type: 'module' });
        worker.onmessage = (e: MessageEvent) => {
            this.fire('completed', worker, e.data);
        };
        worker.onerror = (e: ErrorEvent) => {
            this.fire('error', e);
        };

        data.func = func;
        this._workers.push(worker);
        worker.postMessage(data);

        return worker;
    }

    terminate(w?: Worker): void {
        if (!w) {
            this._workers.forEach(w => w.terminate());
            this._workers = [];
        } else {
            let idx = this._workers.indexOf(w);
            if (idx >= 0) {
                w.terminate();
                this._workers.splice(idx, 1);
            }
        }

        this.fire('terminated');
    }
}