export type Cell = {
    row: number,
    col: number
}

export interface BoardCellData {
    pearl?: {
        fail?: boolean,
        kind: Pearl
    },
    path?: {
        fail?: boolean;
        directions: CardinalDirection
    }
}

export interface BoardData {
    solved: boolean | undefined,
    cells: BoardCellData[][]
}

// Направления
export interface CardinalDirection  {
    north: boolean,
    south: boolean,
    west: boolean,
    east: boolean
}
export const cardinalDirection = (left: boolean = false, top: boolean = false, right: boolean = false, bottom: boolean = false): CardinalDirection => {
    return {
        north: top,
        south: bottom,
        west: left,
        east: right
    }
}