let Graph = require("./graph.js");
let Vertex = require("./vertex.js");
let Edge = require("./edge.js");
let cytoscape = require('cytoscape');
let visual = require("../visualization/makeVisual")

let matching = new Set();
let clickedNode = 0;
let rootMap;
let childMap;
let parentMap;
let heightMap;
let exposedVertexes;
let unmarkedEdges;
let nodesToCheck;
let augPath = [];
let adjacentEdges;
module.exports = adjacentEdges;
module.exports = matching;

let v;

function blossomAlgorithm(graph, cy) {
    findMaxMatching(graph, cy);
}

function findMaxMatching(graph, cy) {
    findAugPath(graph, matching, [], cy);
}

function isEmpty(list) {
    return list.length === 0;
}
function findAugPath(graph, matching, blossomVertexes, cy) {
    augPath = [];
    if (blossomVertexes.length === 0) {
        rootMap = new Map();
        childMap = new Map();
        parentMap = new Map();
        heightMap = new Map();
    }
    unmarkedEdges = getUnmarkedEdges(graph);
    nodesToCheck = getExposedNodes(graph, blossomVertexes, childMap);
    visual.colorExposedVertexes(nodesToCheck, cy);
    exposedVertexes = getExposedNodes(graph, blossomVertexes, childMap);
    console.log("Matching:\n");
    outputMatching();
    for (let vertex of exposedVertexes) {
        console.log("Added to forest: " + vertex);
        rootMap.set(vertex, vertex);
        parentMap.set(vertex, null);
        childMap.set(vertex, []);
        heightMap.set(vertex, 0);
    }
    outputAvailableVertexes(nodesToCheck);
    if (nodesToCheck.size === 0) {
        console.log("The matching is found!");
    }
}

function vertexProcessing(graph, cy) {
    v = graph.getVertex(parseInt(clickedNode.toString(), 10));
    console.log("Working on vertex " + clickedNode);
    adjacentEdges = graph.getAdjacentEdges(v);
    visual.colorAdjacentEdges(cy, adjacentEdges);
    outputAvailableEdges(adjacentEdges);
}

function edgeProcessing(graph, cy, source, target) {
    let w;
    let selectedEdge;
    if (v.value !== parseInt(target.toString(), 10)) {
        selectedEdge =
            graph.getEdge(v, graph.getVertex(parseInt(target.toString(), 10)));
    } else {
        selectedEdge =
            graph.getEdge(v, graph.getVertex(parseInt(source.toString(), 10)));
    }
    if (unmarkedEdges.has(selectedEdge)) {
        w = selectedEdge.getOtherEnd(v);
        console.log("    Looking at vertices " + v + " and " + w);
        if (!rootMap.has(w)) {
            let x = findOtherNodeInMatching(matching, w);
            addToForest(rootMap, parentMap, heightMap, childMap, v, w, x);
            nodesToCheck.add(x);
            visual.drawAddingToForest(v, w, x, cy);
            if (adjacentEdges.size === 1) {
                for (let node of nodesToCheck) {
                    if (node.value !== v.value) {
                        cy.getElementById(node.value).selectify();
                    }
                }
            }
        } else {
            if (heightMap.get(w) % 2 === 0) {
                if (rootMap.get(v) !== rootMap.get(w)) {
                    augPath = returnAugPath(graph, rootMap, parentMap, heightMap, v, w);
                    for (let node of cy.nodes()) {
                        node.unselectify();
                    }
                    for (let edge of cy.edges()) {
                        edge.unselectify();
                    }
                    matching = addAltEdges(augPath, graph, matching);
                    visual.unColorAdjacentEdges(cy, matching);
                    visual.drawAugmentingPath(augPath, cy);
                    visual.finalColoring(cy, matching);
                    findAugPath(graph, matching,[], cy);

                } else {
                    augPath = blossom(graph, matching, rootMap, parentMap, childMap, heightMap, v, w, cy);
                }
                console.log("augPath: " + augPath + "\n");
                return augPath;
            } else {
                console.log("We do nothing");
            }
        }
    }
    adjacentEdges.delete(selectedEdge);
    visual.unColorEdge(selectedEdge, cy);
    unmarkedEdges.delete(selectedEdge);
    if (adjacentEdges.size === 0) {
        nodesToCheck.delete(v);
        if (nodesToCheck.size === 0) {
            findAugPath(graph, [], cy)
        } else {
            for (let node of nodesToCheck) {
                cy.getElementById(node.value).selectify();
            }
        }
    } else {
        visual.colorAdjacentEdges(cy);
    }
}

function outputAvailableVertexes(nodesToCheck) {
    console.log("Available vertexes: ")
    for (let vertex of nodesToCheck) {
        console.log(vertex.toString() + " ");
    }
}

function outputAvailableEdges(adjacentEdges) {
    console.log("Available edges: ")
    for (let edge of adjacentEdges) {
        console.log(edge.toString() + " ");
    }
}

function outputMatching() {
    for (let edge of matching) {
        console.log(edge.toString() + " ");
    }
}

function blossom(graph, matching, rootMap, parentMap, childMap, heightMap, v, w, cy) {
    console.log();
    console.log("Starting blossom recursion");
    console.log("--------------------------");
    let augPath = blossomRecursion(graph, cy, matching, rootMap, parentMap, childMap, heightMap, v, w);
    console.log("Done with blossom recursion");
    console.log("---------------------------");
    return augPath;
}

function getUnmarkedEdges(graph) {
    let unmarkedEdges;
    unmarkedEdges = graph.getAllEdges();
    for (let i = 0; i < matching.size; ++i) {
        unmarkedEdges.delete(matching[i]);
    }
    return unmarkedEdges;
}

function getExposedNodes(graph, blossomVertexes, childMap) {
    let exposedNodes;
    exposedNodes = graph.getAllVertexes();
    for (let edge of matching) {
        if (edge.firstVertex !== null) {
            if (childMap.size === 0) {
                exposedNodes.delete(edge.firstVertex);
            } else {
                if (childMap.has(edge.firstVertex) && childMap.get(edge.firstVertex).length !== 0) {
                    exposedNodes.delete(edge.firstVertex);
                } else {
                    if (!childMap.has(edge.firstVertex)) {
                        exposedNodes.delete(edge.firstVertex);
                    }
                }
            }
        }
        if (edge.secondVertex !== null) {
            if (childMap.size === 0) {
                exposedNodes.delete(edge.secondVertex);
            } else {
                if (childMap.has(edge.secondVertex) && childMap.get(edge.secondVertex).length !== 0) {
                    exposedNodes.delete(edge.secondVertex);
                } else {
                    if (!childMap.has(edge.secondVertex)) {
                        exposedNodes.delete(edge.secondVertex);
                    }
                }
            }
        }
    }
    for (let i = 1; i < blossomVertexes.length; ++i) {
        if (exposedNodes.has(blossomVertexes[i])) {
            exposedNodes.delete(blossomVertexes[i]);
        }
    }
    return exposedNodes;
}

function findOtherNodeInMatching(edges, vertex) {
    for (let edge of edges) {
        if (edge.firstVertex === vertex) {
            return edge.secondVertex;
        }
        if (edge.secondVertex === vertex) {
            return edge.firstVertex;
        }
    }
    return null;
}

function addToForest(rootMap, parentMap, heightMap, childMap, v, w, x) {
    console.log("    Adding edges to forest");
    console.log("    v: " + v + " w: " + w + " x: " + x);
    let root = rootMap.get(v);
    rootMap.set(w, root);
    rootMap.set(x, root);
    parentMap.set(w, v);
    if (childMap.has(v)) {
        let children = childMap.get(v);
        children.push(w);
        childMap.set(w, []);
    } else {
        childMap.set(v, []);
        childMap.get(v).push(w);
        childMap.set(w, []);
    }
    parentMap.set(x, w);
    if (childMap.has(w)) {
        childMap.get(w).push(x);
        childMap.set(x, []);
    } else {
        childMap.set(w, []);
        childMap.get(w).push(x);
        childMap.set(w, []);
    }
    heightMap.set(w, heightMap.get(v) + 1);
    heightMap.set(x, heightMap.get(v) + 2);
    return null;
}

function returnAugPath(graph, rootMap, parentMap, heightMap, v, w) {
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

function blossomRecursion(graph, cy, matching,
                          rootMap, parentMap, childMap, heightMap, v, w) {
    // Construct blossom
    let root = rootMap.get(v);
    let blossom = [];
    console.log("Blossom is: ");
    let curr = v;
    while (curr !== root) {
        blossom.push(curr);
        curr = parentMap.get(curr);
    }
    blossom.push(root);
    blossom.reverse();
    curr = w;
    while (curr !== root) {
        blossom.push(curr);
        curr = parentMap.get(curr);
    }
    blossom.push(root);
    let correctedBlossom = [];
    let rootIndex = -1;
    for (let i = 0; i < blossom.length; ++i) {
        if (blossom[i].value !== blossom[blossom.length - 1 - i].value) {
            correctedBlossom.push(blossom[i]);
            if (rootIndex < 0) {
                rootIndex = i - 1;
            }
        }
    }
    correctedBlossom.unshift(blossom[rootIndex]);
    blossom = correctedBlossom;
    for (let i = 0; i < correctedBlossom.length; ++i) {
        console.log(correctedBlossom[i] + " ");
    }
    console.log();
    let contractedGraph = contractBlossom(graph, blossom, cy);
    let contractedVertex = contractedGraph.getContractedVertex();
    for (let node of blossom) {
        if (node.value !== contractedVertex.value) {
            cy.getElementById(node.value).hide();
        }
    }
    cy.fit();
    let contractedMatching = contractMatching(contractedGraph, matching, blossom, contractedVertex);
    findAugPath(contractedGraph, contractedMatching, blossom, cy);
    /*if (containsEdgeWithNode(augPath, contractedVertex)) {
        augPath = liftPathWithBlossom(augPath, blossom, graph);
        console.log("Lifted augmenting path is: " + augPath);
    }*/
    return augPath;
}

function contractBlossom(graph, blossom, cy) {
    let contracted = new Graph();
    let contractedVertex = blossom[0];
    console.log("Beginning contraction to " + contractedVertex);
    let allEdges = graph.getAllEdges();
    for (let edge of allEdges) {
        contracted.addEdge(edge);
    }
    let removed;
    for (let i = 0; i < blossom.length - 1; i++) {
        removed = contracted.removeEdge(blossom[i], blossom[i + 1]);
        visual.drawRemovingEdge(blossom[i], blossom[i + 1], cy);
    }
    removed = contracted.removeEdge(blossom[blossom.length - 1], blossom[0]);
    visual.drawRemovingEdge(blossom[blossom.length - 1], blossom[0], cy);
    for (let i = 1; i < blossom.length; ++i) {
        let allNodes = graph.getAdjacentVertexes(blossom[i]);
        for (let node of allNodes) {
            let prev = i - 1;
            let next = (i + 1) % blossom.length;
            if (node !== blossom[prev] && node !== blossom[next]) {
                removed = contracted.removeEdge(blossom[i], node);
                visual.drawRemovingEdge(blossom[i], node, cy);
                contracted.addEdge(new Edge(node, contractedVertex, false));
                visual.drawAddingEdge(node, contractedVertex, cy);
            }
        }
    }
    contracted.addContractedVertex(contractedVertex);
    return contracted;
}

function contractMatching(contracted, matching, blossom, contractedVertex) {
    let contractedMatching = new Set();
    let blossomNodes = new Set();
    for (let i = 0; i < blossom.length; ++i) {
        blossomNodes.add(blossom[i]);
    }
    for (let match of matching) {
        if (blossomNodes.has(match.firstVertex)
            && !blossomNodes.has(match.secondVertex)) {
            contractedMatching.add(contracted.getEdge(contractedVertex, match.secondVertex));
        } else {
            if (blossomNodes.has(match.secondVertex)
                && !blossomNodes.has(match.firstVertex)) {
                contractedMatching.add(contracted.getEdge(match.firstVertex, contractedVertex));
            } else {
                if (!blossomNodes.has(match.secondVertex)
                    && !blossomNodes.has(match.firstVertex)) {
                    contractedMatching.add(contracted.getEdge(match.firstVertex, match.secondVertex));
                }
            }
        }
    }
    return contractedMatching;
}

function containsEdgeWithNode(path, vertex) {
    for (let i = 0; i < path.length; ++i) {
        if (path[i] === vertex)
            return true;
    }
    return false;
}

function liftPathWithBlossom(augPath, blossom, graph) {
    let lifted = [];
    let contractedNode = blossom[0];
    for (let i = 0; i < augPath.length; ++i) {
        // lift the blossom
        if (augPath[i] === contractedNode) {
            // leftmost of the augmenting path or in the middle of the augmenting path, right unmatched
            if (i === augPath.length - 1) {
                let outgoingIndex = findOutgoingIndex(augPath[i - 1], blossom, graph);
                if (outgoingIndex % 2 === 0) {
                    for (let j = outgoingIndex; j >= 0; --j) {
                        lifted.push(blossom[j]);
                    }
                } else {
                    for (let j = outgoingIndex; j <= blossom.length - 1; ++j) {
                        lifted.push(blossom[j]);
                    }
                    lifted.push(blossom[0]);
                }
            } else {
                if (i % 2 === 0) {
                    let outgoingIndex = findOutgoingIndex(augPath[i + 1], blossom, graph);
                    if (outgoingIndex % 2 === 0) {
                        for (let j = 0; j <= outgoingIndex; j++) {
                            lifted.push(blossom[j]);
                        }
                    } else {
                        lifted.push(blossom[0]);
                        for (let j = blossom.length - 1; j >= outgoingIndex; j--) {
                            lifted.push(blossom[j]);
                        }
                    }
                }
                // rightmost of the augmenting path or in the middle of the augmenting path, left unmatched
                if (i % 2 === 1) {
                    let outgoingIndex = findOutgoingIndex(augPath[i + 1], blossom, graph);
                    if (outgoingIndex % 2 === 0) {
                        for (let j = outgoingIndex; j >= 0; j--) {
                            lifted.push(blossom[j]);
                        }
                    } else {
                        for (let j = outgoingIndex; j < blossom.length; j++) {
                            lifted.push(blossom[j]);
                        }
                        lifted.push(blossom[0]);
                    }
                }
            }
        }
        // just add the nodes in the augmenting path
        else {
            lifted.push(augPath[i]);
        }
    }
    return lifted;
}

function findOutgoingIndex(vertex, blossom, graph) {
    for (let i = 0; i < blossom.length; i++) {
        if (graph.getEdge(vertex, blossom[i]) != null) {
            return i;
        }
    }
    console.log("Blossom lifting error");
    return -1;
}

function addAltEdges(augPath, graph, matching) {
    for (let i = 0; i < augPath.length - 1; i += 1) {
        if (i % 2 === 0) {
            matching.add(graph.getEdge(augPath[i], augPath[i + 1]));
        }
        if (i % 2 === 1) {
            matching.delete(graph.getEdge(augPath[i], augPath[i + 1]));
        }
    }
    return matching;
}

module.exports = {
    getGraphFromCanvas: function (cy) {
        let graph = new Graph();
        for (let edge of cy.edges()) {
            graph.addEdgeByTwoVertexes(parseInt(edge.source().id()), parseInt(edge.target().id()));
        }
        for (let edge of graph.edgeSet) {
            console.log(edge.toString());
        }
        for (let node of cy.nodes()) {
            node.unselectify();
        }
        for (let edge of cy.edges()) {
            edge.unselectify();
        }
        cy.on('select', 'node', function (evt) {
            cy.getElementById(this.id()).style({
                'width': 40,
                'height': 40,
                'text-valign': 'center',
                'color': 'white',
                'background-color': 'yellow',
                'text-outline-width': 0.5,
                'text-outline-color': '#222'
            })
            clickedNode = this.id();
            for (let node of cy.nodes()) {
                if (node.id() !== this.id()) {
                    node.unselectify();
                }
            }
            vertexProcessing(graph, cy);
        });
        cy.on('select', 'edge', function (evt) {
            this.style({
                'line-color': 'yellow',
            })
            edgeProcessing(graph, cy, this.source().id(), this.target().id());
        });
        start(graph, cy);
    }
}


function start(graph, cy) {
    blossomAlgorithm(graph, cy);
    //console.log("---------Result-------");
    //console.log("Graph Matching size: " + matching.size);
    //console.log(matching);
}

/*function main() {
    //let graph = new Graph();
    /*graph.addEdgeByTwoVertexes(1, 2);
    graph.addEdgeByTwoVertexes(2, 3);
    graph.addEdgeByTwoVertexes(3, 4);
    graph.addEdgeByTwoVertexes(4, 5);
    graph.addEdgeByTwoVertexes(5, 1);
    graph.addEdgeByTwoVertexes(3, 6);
    graph.addEdgeByTwoVertexes(6, 7);*/

/*graph.addEdgeByTwoVertexes(1, 2);
graph.addEdgeByTwoVertexes(2, 3);
graph.addEdgeByTwoVertexes(3, 4);
graph.addEdgeByTwoVertexes(4, 5);
graph.addEdgeByTwoVertexes(5, 6);
graph.addEdgeByTwoVertexes(6, 7);
graph.addEdgeByTwoVertexes(3, 7);
graph.addEdgeByTwoVertexes(5, 8);
graph.addEdgeByTwoVertexes(8, 9);
graph.addEdgeByTwoVertexes(9, 10);*/

/*graph.addEdgeByTwoVertexes(1, 2);
graph.addEdgeByTwoVertexes(2, 3);
graph.addEdgeByTwoVertexes(3, 4);
graph.addEdgeByTwoVertexes(4, 5);
graph.addEdgeByTwoVertexes(5, 6);
graph.addEdgeByTwoVertexes(6, 7);
graph.addEdgeByTwoVertexes(3, 7);
graph.addEdgeByTwoVertexes(7, 8);
graph.addEdgeByTwoVertexes(8, 9);
graph.addEdgeByTwoVertexes(9, 10);*/

/*graph.addEdgeByTwoVertexes(1, 4);
graph.addEdgeByTwoVertexes(4, 5);
graph.addEdgeByTwoVertexes(5, 6);
graph.addEdgeByTwoVertexes(6, 10);
graph.addEdgeByTwoVertexes(10, 9);
graph.addEdgeByTwoVertexes(9, 8);
graph.addEdgeByTwoVertexes(8, 7);
graph.addEdgeByTwoVertexes(7, 4);
graph.addEdgeByTwoVertexes(5, 9);
graph.addEdgeByTwoVertexes(6, 3);
graph.addEdgeByTwoVertexes(3, 2);
graph.addEdgeByTwoVertexes(3, 10);*/

/*graph.addEdgeByTwoVertexes(1, 2);
graph.addEdgeByTwoVertexes(2, 3);
graph.addEdgeByTwoVertexes(3, 4);
graph.addEdgeByTwoVertexes(4, 5);
graph.addEdgeByTwoVertexes(5, 6);
graph.addEdgeByTwoVertexes(6, 7);
graph.addEdgeByTwoVertexes(7, 8);
graph.addEdgeByTwoVertexes(8, 9);
graph.addEdgeByTwoVertexes(6, 10);
graph.addEdgeByTwoVertexes(4, 11);
graph.addEdgeByTwoVertexes(5, 12);
graph.addEdgeByTwoVertexes(3, 7);*/

/*let matching = blossomAlgorithm(graph);
console.log("---------Result-------");
console.log("Graph Matching size: " + matching.size);
console.log(matching);*/
//}

//main();