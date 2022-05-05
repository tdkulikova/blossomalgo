module.exports = {
    finalOutput: function (matching) {
        document.getElementById('button-create').disabled = false;
        document.getElementById('button-generate').disabled = false;
        document.getElementById('algoSvg').innerText += "Matching is found!\n";
        document.getElementById('algoSvg').innerText += "Matching Size: " + matching.size + "\n";
    },
    correctingNodesAndEdges: function (cy) {
        for (let node of cy.nodes()) {
            node.unselect();
            node.unselectify();
        }
        for (let edge of cy.edges()) {
            edge.unselect();
            edge.unselectify();
        }
    },
    checking: function (graph, matching) {
        for (let i = 0; i < graph.components.length; ++i) {
            if (this.checkingComponent(graph.components[i], matching, graph)) {
                return true;
            }
        }
        return false;
    },
    checkingComponent: function (component, matching, graph) {
        let amount = 0;
        for (let node of component) {
            let isInMatching = false;
            for (let edge of matching) {

                if (edge.firstVertex.value === node.value ||
                    edge.secondVertex.value === node.value) {
                    isInMatching = true;
                }
            }
            if (!isInMatching) {
                let edges = graph.getAdjacentEdges(node, matching);
                for (let edge of edges) {

                }
                if (edges.size !== 0) {
                    ++amount;
                }
            }
        }
        return amount >= 2;
    },
    findOtherNodeInMatching: function (edges, vertex) {
        for (let edge of edges) {
            if (edge.firstVertex === vertex) {
                return edge.secondVertex;
            }
            if (edge.secondVertex === vertex) {
                return edge.firstVertex;
            }
        }
        return null;
    },
    containsEdgeWithNode: function (path, vertex) {
        for (let i = 0; i < path.length; ++i) {
            if (path[i] === vertex)
                return true;
        }
        return false;
    },
    findOutgoingIndex: function (vertex, blossom, graph) {
        for (let i = 0; i < blossom.length; i++) {
            if (graph.getEdge(vertex, blossom[i]) != null) {
                return i;
            }
        }
        document.getElementById('algoSvg').innerText += "Blossom lifting error!\n\n";
        return -1;
    },

    findIngoingIndex: function (vertex, blossom, graph) {
        for (let i = 0; i < blossom.length; i++) {
            if (graph.getEdge(blossom[i], vertex) != null) {
                return i;
            }
        }
        document.getElementById('algoSvg').innerText += "Blossom lifting error!\n\n";
        return -1;
    },
    addAltEdges: function (augPath, graph, matching) {
        for (let i = 0; i < augPath.length - 1; i += 1) {
            if (i % 2 === 0) {
                matching.add(graph.getEdge(augPath[i], augPath[i + 1]));
            }
            if (i % 2 === 1) {
                matching.delete(graph.getEdge(augPath[i], augPath[i + 1]));
            }
        }
        return matching;
    },

    returnAugPath: function (graph, rootMap, parentMap, heightMap, v, w) {
        let augPath = [];
        let curr = v;
        while (curr != null) {
            augPath.push(curr);
            curr = parentMap.get(curr);
        }
        augPath.reverse();
        curr = w;
        while (curr != null) {
            augPath.push(curr);
            curr = parentMap.get(curr);
        }
        return augPath;
    }
}