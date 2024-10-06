export function primsAlgorithm(nodes) {
    const edges = [];
    const visited = new Set();
    visited.add(0);

    while (visited.size < nodes.length) {
        let minEdge = null;
        for (let i of visited) {
            for (let j = 0; j < nodes.length; j++) {
                if (!visited.has(j)) {
                    const distance = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
                    if (!minEdge || distance < minEdge.distance) {
                        minEdge = { source: nodes[i], target: nodes[j], distance };
                    }
                }
            }
        }
        if (minEdge) {
            edges.push(minEdge);
            visited.add(nodes.indexOf(minEdge.target));
        }
    }

    return edges;
}
