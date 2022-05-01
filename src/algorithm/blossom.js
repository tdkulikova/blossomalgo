let Graph = require("./graph.js");
let Vertex = require("./vertex.js");
let Edge = require("./edge.js");
let cytoscape = require('cytoscape');

let {getForest} = require("../visualization/forest");
let visual = require("../visualization/makeVisual");
const {drawAugmentingPath, drawAddingEdgeToForest, drawAddingNodeToForest} = require("../visualization/makeVisual");

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
let adjacentEdges = new Set([]);
let matchings = [];

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
    let forest = getForest();
    for (let node of forest.nodes()) {
        forest.remove(node);
    }
    unmarkedEdges = getUnmarkedEdges(graph);
    nodesToCheck = getExposedNodes(graph, blossomVertexes, childMap);
    visual.colorExposedVertexes(nodesToCheck, cy);
    exposedVertexes = getExposedNodes(graph, blossomVertexes, childMap);
    console.log("Matching:\n");
    outputMatching();
    let number = 0;
    for (let vertex of exposedVertexes) {
        drawAddingNodeToForest(getForest(), vertex, exposedVertexes.size, number);
        rootMap.set(vertex, vertex);
        parentMap.set(vertex, null);
        childMap.set(vertex, []);
        heightMap.set(vertex, 0);
        ++number;
    }
    outputAvailableVertexes(nodesToCheck);
    if (nodesToCheck.size === 0) {
        console.log("The matching is found!");
    }
}

function findAugPathWithBlossom(contractedGraph, contractedMatching, blossomVertexes, cy) {
    let augPath = [];
    let forest = getForest();
    unmarkedEdges = getUnmarkedEdges(graph);
    nodesToCheck = getExposedNodes(graph, blossomVertexes, childMap);
    visual.colorExposedVertexes(nodesToCheck, cy);
    exposedVertexes = getExposedNodes(graph, blossomVertexes, childMap);
    console.log("Matching:\n");
    outputMatching();
    let number = 0;
    outputAvailableVertexes(nodesToCheck);
    if (nodesToCheck.size === 0) {
        console.log("The matching is found!");
    }
}

let contrMatching = matching;

function vertexProcessing(cy) {
    v = graph.getVertex(parseInt(clickedNode.toString(), 10));
    document.getElementById('algoSvg').innerText = "Working on vertex " + clickedNode +"\n";
    adjacentEdges = graph.getAdjacentEdges(v, matching);
    if (adjacentEdges.size === 0) {
        cy.getElementById(v.value).style({
            'background-color': 'red'
        });
        findAugPath(graph, matching, [], cy);
    } else {
        visual.colorAdjacentEdges(cy, adjacentEdges, matching);
        outputAvailableEdges(adjacentEdges);
    }
}

let globalBlossom = [];
let notContractedGraph;
let contractedVertex;
let blossoms = [];
let contractedVertexes = [];
let graphConditions = [];

function edgeProcessing(cy, source, target) {
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
        adjacentEdges.delete(selectedEdge);
        w = selectedEdge.getOtherEnd(v);
        document.getElementById('algoSvg').innerText += "Looking at vertices " + v + " and " + w + "\n";
        if (!rootMap.has(w)) {
            let x = findOtherNodeInMatching(matching, w);
            addToForest(rootMap, parentMap, heightMap, childMap, v, w, x);
            nodesToCheck.add(x);
            visual.drawAddingToForest(v, w, x, cy);
            let forest = getForest();
            drawAddingEdgeToForest(forest, v, w, rootMap, childMap, parentMap);
            drawAddingEdgeToForest(forest, w, x, rootMap, childMap, parentMap);
            if (adjacentEdges.size === 0) {
                for (let node of nodesToCheck) {
                    if (node.value !== v.value) {
                        cy.getElementById(node.value).selectify();
                    }
                }
            }
        } else {
            if (heightMap.get(w) % 2 === 0) {
                document.getElementById('algoSvg').innerText +=
                    "The distance between the "  + w + "and the root of the tree is even, so we have found the augmenting path" + "\n";
                if (rootMap.get(v) !== rootMap.get(w)) {
                    for (let node of cy.nodes()) {
                        node.unselect();
                        node.unselectify();
                    }
                    for (let edge of cy.edges()) {
                        edge.unselect();
                        edge.unselectify();
                    }
                    visual.unColorAdjacentEdges(cy, matching);
                    let wasBlossomed;
                    augPath = returnAugPath(graph, rootMap, parentMap, heightMap, v, w);
                    for (let i = blossoms.length - 1; i >= 0; --i) {
                        if (containsEdgeWithNode(augPath, contractedVertexes[i])) {
                            wasBlossomed = true;
                            if (i === blossoms.length - 1) {
                                augPath = liftPathWithBlossom(cy, augPath, blossoms[i], graphConditions[i], graph);
                            } else {
                                augPath = liftPathWithBlossom(cy, augPath, blossoms[i], graphConditions[i], graphConditions[i + 1]);
                            }
                        }
                    }
                    if (wasBlossomed) {
                        graph = graphConditions[0];
                        matching = matchings[0];
                        blossoms = [];
                        contractedVertexes = [];
                        graphConditions = [];
                        matchings = [];
                    } else {
                        visual.drawAugmentingPath(augPath, cy);
                    }
                    matching = addAltEdges(augPath, graph, matching);
                    let graphToCheck = graph;
                    visual.finalColoring(cy, matching);
                    if (graphConditions.length > 0) {
                        graphToCheck = graphConditions[0];
                    }
                    if (checking(graphToCheck, matching)) {
                        document.getElementById('algoSvg').innerText += "The augmenting path: " + augPath + "\n";
                        findAugPath(graph, matching, [], cy);
                    } else {
                        if (blossoms.length > 0) {
                            for (let i = blossoms.length - 1; i >= 0; --i) {
                                if (i === blossoms.length - 1) {
                                    augPath = liftPathWithBlossom(cy, augPath, blossoms[i], graphConditions[i], graph);
                                } else {
                                    augPath = liftPathWithBlossom(cy, augPath, blossoms[i], graphConditions[i], graphConditions[i + 1]);
                                }
                            }
                        }
                        matching = addAltEdges(augPath, graph, matching);
                        document.getElementById('algoSvg').innerText += "The augmenting path: " + augPath + "\n";
                        console.log("Matching is found!");
                    }
                } else {
                    document.getElementById('algoSvg').innerText += "The blossom (the odd cycle) is found!"
                    blossom(matching, rootMap, parentMap, childMap, heightMap, v, w, cy);
                }
                return augPath;
            } else {
                console.log("We do nothing");
            }
        }
    }
    //adjacentEdges.delete(selectedEdge);
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
    }
}

function checking(graph, matching) {
    for (let i = 0; i < graph.components.length; ++i) {
        if (checkingComponent(graph.components[i], matching)) {
            return true;
        }
    }
    return false;
}

function checkingComponent(component, matching) {
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
            if (edges.size !== 0) {
                ++amount;
            }
        }
    }
    if (amount >= 2) {
        return true;
    }
    return false;
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

function blossom(matching, rootMap, parentMap, childMap, heightMap, v, w, cy) {
    console.log();
    console.log("Starting blossom recursion");
    console.log("--------------------------");
    let augPath = blossomRecursion(cy, matching, rootMap, parentMap, childMap, heightMap, v, w);
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
        if (!edge.firstVertex.visible) {
            exposedNodes.delete(edge.firstVertex);
        }
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
        if (!edge.secondVertex.visible) {
            exposedNodes.delete(edge.secondVertex);
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

function blossomRecursion(cy, matching,
                          rootMap, parentMap, childMap, heightMap, v, w) {
    // Construct blossom
    let root = rootMap.get(v);
    let blossomVertexes = [];
    console.log("Blossom is: ");
    let curr = v;
    while (curr !== root) {
        blossomVertexes.push(curr);
        curr = parentMap.get(curr);
    }
    blossomVertexes.push(root);
    blossomVertexes.reverse();
    curr = w;
    while (curr !== root) {
        blossomVertexes.push(curr);
        curr = parentMap.get(curr);
    }
    blossomVertexes.push(root);
    let correctedBlossom = [];
    let rootIndex = -1;
    for (let i = 0; i < blossomVertexes.length; ++i) {
        if (blossomVertexes[i].value !== blossomVertexes[blossomVertexes.length - 1 - i].value) {
            correctedBlossom.push(blossomVertexes[i]);
            if (rootIndex < 0) {
                rootIndex = i - 1;
            }
        }
    }
    correctedBlossom.unshift(blossomVertexes[rootIndex]);
    blossomVertexes = correctedBlossom;
    globalBlossom = blossomVertexes;
    blossoms.push(blossomVertexes);
    for (let i = 0; i < correctedBlossom.length; ++i) {
        console.log(correctedBlossom[i] + " ");
    }
    console.log();
    let contractedGraph = contractBlossom(graph, blossomVertexes, cy);
    notContractedGraph = graph;
    graphConditions.push(graph);
    matchings.push(matching);
    graph = contractedGraph;
    let contractedVertex = contractedGraph.getContractedVertex();
    for (let node of blossomVertexes) {
        if (node.value !== contractedVertex.value) {
            cy.getElementById(node.value).hide();
        }
    }
    cy.fit();
    let contractedMatching = contractMatching(contractedGraph, contrMatching, blossomVertexes, contractedVertex);
    contrMatching = contractedMatching;
    //this.matching = contractedMatching;
    findAugPathWithBlossom(graph, contractedMatching, blossomVertexes, cy);
    if (containsEdgeWithNode(augPath, contractedVertex)) {
        augPath = liftPathWithBlossom(cy, augPath, blossomVertexes, graph);
        //console.log("Lifted augmenting path is: " + augPath);
    }
    return augPath;
}

function contractBlossom(graph, blossom, cy) {
    let contracted = new Graph();
    contractedVertex = blossom[0];
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
    contractedVertexes.push(contractedVertex);
    contractedVertex.visible = true;
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

function liftPathWithBlossom(cy, augPath, blossom, notContractedGraph, contractedGraph) {
    let lifted = [];
    let contractedNode = blossom[0];
    for (let i = 0; i < augPath.length; ++i) {
        // lift the blossom
        if (augPath[i] === contractedNode) {
            // leftmost of the augmenting path or in the middle of the augmenting path, right unmatched
            if (i === augPath.length - 1) {
                let outgoingIndex = findOutgoingIndex(augPath[i - 1], blossom, notContractedGraph);
                if (outgoingIndex % 2 === 0) {
                    for (let j = outgoingIndex; j >= 0; --j) {
                        lifted.push(blossom[j]);
                        cy.getElementById(blossom[j].value).show();
                    }
                } else {
                    for (let j = outgoingIndex; j <= blossom.length - 1; ++j) {
                        lifted.push(blossom[j]);
                        cy.getElementById(blossom[j].value).show();
                    }
                    lifted.push(blossom[0]);
                    cy.getElementById(blossom[0].value).show();
                }
            } else {
                if (i % 2 === 0) {
                    let outgoingIndex = findOutgoingIndex(augPath[i + 1], blossom, notContractedGraph);
                    if (outgoingIndex % 2 === 0) {
                        for (let j = 0; j <= outgoingIndex; j++) {
                            lifted.push(blossom[j]);
                            cy.getElementById(blossom[j].value).show();
                        }
                    } else {
                        lifted.push(blossom[0]);
                        cy.getElementById(blossom[0].value).show();
                        for (let j = blossom.length - 1; j >= outgoingIndex; j--) {
                            lifted.push(blossom[j]);
                            cy.getElementById(blossom[j].value).show();
                        }
                    }
                }
                // rightmost of the augmenting path or in the middle of the augmenting path, left unmatched
                if (i % 2 === 1) {
                    let outgoingIndex = findOutgoingIndex(augPath[i + 1], blossom, notContractedGraph);
                    if (outgoingIndex % 2 === 0) {
                        for (let j = outgoingIndex; j >= 0; j--) {
                            lifted.push(blossom[j]);
                            cy.getElementById(blossom[j].value).show();
                        }
                    } else {
                        for (let j = outgoingIndex; j < blossom.length; j++) {
                            lifted.push(blossom[j]);
                            cy.getElementById(blossom[j].value).show();
                        }
                        lifted.push(blossom[0]);
                        cy.getElementById(blossom[0].value).show();
                    }
                }
            }
        }
        // just add the nodes in the augmenting path
        else {
            lifted.push(augPath[i]);
            cy.getElementById(augPath[i].value).show();
        }
    }
    for (let node of blossom) {
        cy.getElementById(node.value).show();
    }
    for (let edge of notContractedGraph.edgeSet) {
        visual.drawShowingEdge(edge.firstVertex, edge.secondVertex, cy);
    }
    for (let edge of contractedGraph.edgeSet) {
        if (!notContractedGraph.edgeSet.has(edge)) {
            visual.drawRemovingEdge(edge.firstVertex, edge.secondVertex, cy);
        }
    }
    cy.fit();
    drawAugmentingPath(lifted, cy);
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

let graph = new Graph();

module.exports = {
    getGraphFromCanvas: function (cy) {
        for (let edge of cy.edges()) {
            graph.addEdgeByTwoVertexes(parseInt(edge.source().id()), parseInt(edge.target().id()));
        }
        graph.findComponents();
        for (let edge of graph.edgeSet) {
            console.log(edge.toString());
        }
        for (let node of cy.nodes()) {
            node.unselectify();
        }
        for (let edge of cy.edges()) {
            edge.unselect();
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
            vertexProcessing(cy);
        });
        cy.on('select', 'edge', function (evt) {
            this.style({
                'line-color': 'yellow',
            })
            edgeProcessing(cy, this.source().id(), this.target().id());
        });
        start(graph, cy);
    }
}


function start(graph, cy) {
    blossomAlgorithm(graph, cy);
}