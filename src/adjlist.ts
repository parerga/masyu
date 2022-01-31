import { VertexId } from './vertices.js';
import { Path } from './path.js';

// Список смежности
export class AdjacencyList extends Array<VertexId[]> {
    constructor(a?: Path | VertexId[][]) {
        super();

        if (Array.isArray(a)) {
            if (typeof a[0] === 'number') {
                this._fromPath(a as Path);
            } else {
                for (let i = 0; i < a.length; i++) {
                    let avs = <VertexId[]>a[i] || [];
                    this[i] = Array.isArray(avs) ? avs.slice() : [];
                }
            }
        }
    }

    private _fromPath(p: Path) {
        if (Array.isArray(p) && !p.length) {
            return;
        }

        this[p[0]] = [];
        const plen = p.length;
        for (let i = 1; i < plen; i++) {
            let currV = p[i];
            let prevV = p[i - 1];

            if (this[currV] === undefined) {
                this[currV] = [];
            }
            this[currV].push(prevV);
            this[prevV].push(currV);
        }
    }

    addEdge(v: VertexId, avs: VertexId[]) {
        if (!Array.isArray(avs)) {
            return;
        }

        this[v] || (this[v] = []);
        avs.forEach(av => {
            if (!this[v].includes(av)) {
                this[v].push(av);
            }
        });
    }

    removeEdge(v: VertexId, avs: VertexId[]) {
        if (!Array.isArray(avs)) {
            return;
        }

        this[v] || (this[v] = []);
        avs.forEach(av => {
            let idx = this[v].indexOf(av);
            if (~idx) {
                this[v].splice(idx, 1);
            }
        });
    }

    toJSON() {
        // неинициализорованные ячейки заполним пустыми массивами
        for (let i = 0; i < this.length; i++) {
            this[i] || (this[i] = []);
        }

        return this;
    }
}