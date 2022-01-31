export type VertexId = number;
export interface Vertex {
    id: VertexId
}

export class Vertices<T extends Vertex> extends Array<T> {
    constructor(count: number = 0, vertex: (v: VertexId) => T = () => <T>{}) {
        super();

        for (let i = 0; i < count; i++) {
            this[i] = vertex(i);
        }
    }
}

