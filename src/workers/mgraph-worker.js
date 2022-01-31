let vertices;
let adjlist;
let allPearls = 12;
let startVertex = 0;
let pattern = '';

const visited = [];
const path = [];
let visitedPearls = 0;

// В поиске в глубину используется для оценки соответствия вершины next правилам игры
function _canGoNext(path, next) {
    let res = true;
    const curr = path[path.length - 1];
    const prev = path[path.length - 2];

    if (prev === undefined) {
        return res;
    }

    const offsetn = next - curr;
    const offsetp = prev - curr;
    const straightLine = Math.abs(offsetn) === Math.abs(offsetp);
    const Vc = vertices[curr];

    // Белую жемчужину может пересекать только прямая,
    // черную - только ломаная
    if (Vc.pearl === Pearl.White) {
        res = straightLine;
    } else if (Vc.pearl === Pearl.Black) {
        res = !straightLine;
    }

    if (!res) {
        return res;
    }

    const Vp = vertices[prev];
    const Vn = vertices[next];

    // Перед или после черной должна быть прямая
    if (Vp.pearl === Pearl.Black || Vn.pearl === Pearl.Black) {
        res = straightLine;
    }

    // Запомним линию перед белой
    if (Vn.pearl === Pearl.White) {
        Vn.cond = !straightLine;
    }

    // Если перед белой была прямая, то после может быть только ломаная
    if (Vp.cond === false) {
        res = !straightLine;
    }

    return res;
}

function dfs(v) {
    visited[v] = true;
    path.push(v);
    let V = vertices[v];
    let avs = adjlist[v];
    if (V.pearl !== Pearl.None) {
        visitedPearls++;
    }
    for (let i = 0; i < avs.length; i++) {
        let next = avs[i];
        if (next === startVertex && visitedPearls === allPearls && path.length > 2) {
            let good = true;
            let tmpPath = Array.of(path[path.length - 2], path[path.length - 1]);
            for (let j = 0; j < 4; j++) {
                if (!_canGoNext(tmpPath, path[j])) {
                    good = false;
                    break;
                }
                tmpPath.push(path[j]);
            }
            if (good) {
                path.push(next);
                return true;
            } else {
                continue;
            }
        }

        if (!visited[next] && _canGoNext(path, next)) {
            if (dfs(next)) {
                return true;
            }
        }
    }

    visited[v] = false;
    if (V.pearl !== Pearl.None) {
        visitedPearls--;
    }
    path.pop();
    return false;
}

function onMessageMG(worker, data) {
    ({ vertices, adjlist, allPearls, startVertex, pattern } = data);

    const func = data.func;
    switch (func) {
        case 'findCycle': {
            dfs(startVertex);
            worker.postMessage({ path, pattern });
            break;
        }
        default: {
            worker.postMessage({});
        }
    }
}

try {
    const worker = self;
    worker.onmessage = function (e) {
        onMessageMG(worker, e.data);
    }
} catch (e) {
}
