/*export*/
function findCycle(adjlist, start, minPathLen) {
    const visited = [];
    const path = [];

    function dfs(v) {
        path.push(v);
        let av = adjlist[v];
        if (path.length >= minPathLen && ~av.indexOf(start)) {
            path.push(start);
            return true;
        }

        visited[v] = true;
        for (let i = 0; i < av.length; i++) {
            let next = av[i];
            if (!visited[next]) {
                if (dfs(next)) {
                    return true;
                }
            }
        }
        visited[v] = false;
        path.pop();
        return false;
    }

    dfs(start);
    return path;
}

function onMessageG(worker, data) {
    const { adjlist, minPathLen, startVertex } = data;

    switch (data.func) {
        case 'findCycle': {
            const path = findCycle(adjlist, startVertex, minPathLen);
            worker.postMessage({ path });
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
        onMessageG(worker, e.data);
    }
} catch (e) {
}

// Worker в FF не умеет работать с модулями.
// https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker#browser_compatibility
try {
    window.MWorker = { findCycle };
} catch (e) {
}
