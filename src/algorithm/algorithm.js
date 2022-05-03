const visual = require("../visualization/makeVisual");
const {drawAddingNodeToForest, drawAddingEdgeToForest, drawAugmentingPath} = require("../visualization/makeVisual");
const Graph = require("./graph");
let {getForest} = require("../visualization/forest");
const auxiliaryFunc = require("./auxiliaryFunctions");
const Edge = require("./edge");


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
let matchingConditions = [];
let blossoms = [];
let contractedVertexes = [];
let graphConditions = [];
let contrMatching = matching;
let graph = new Graph();
let v;
let contractedVertex;
let notContractedGraph;

function blossomAlgorithm(graph, cy) {
    findAugPath(graph, matching, [], cy);
}

function findAugPath(graph, matching, blossomVertexes, cy) {
    augPath = [];
    if (blossomVertexes.length === 0) {
        rootMap = new Map();
        childMap = new Map();
        parentMap = new Map();
        heightMap = new Map();
    }
    cleanForest();
    manageExposedVertexes(blossomVertexes, cy);
}

function cleanForest() {
    let forest = getForest();
    for (let node of forest.nodes()) {
        forest.remove(node);
    }
}

function manageExposedVertexes(blossomVertexes, cy) {
    nodesToCheck = getExposedNodes(graph, blossomVertexes, childMap);
    if (nodesToCheck.size === 0) {
        auxiliaryFunc.finalOutput(matching);
    }
    visual.colorExposedVertexes(nodesToCheck, cy);
    addingExposedVertexesToForest(nodesToCheck);
}

function addingExposedVertexesToForest(exposedVertexes) {
    let number = 0;
    for (let vertex of exposedVertexes) {
        drawAddingNodeToForest(getForest(), vertex, exposedVertexes.size, number);
        rootMap.set(vertex, vertex);
        parentMap.set(vertex, null);
        childMap.set(vertex, []);
        heightMap.set(vertex, 0);
        ++number;
    }
}

function vertexProcessing(cy) {
    v = graph.getVertex(parseInt(clickedNode.toString(), 10));
    document.getElementById('algoSvg').innerText = "Working on vertex " + clickedNode + "\n\n";
    adjacentEdges = graph.getAdjacentEdges(v, matching);
    if (adjacentEdges.size === 0) {
        cy.getElementById(v.value).style({
            'background-color': 'red'
        });
        findAugPath(graph, matching, [], cy);
    } else {
        visual.colorAdjacentEdges(cy, adjacentEdges, matching);
    }
}

function foundNothing(selectedEdge, cy) {
    visual.unColorEdge(selectedEdge, cy);
    if (adjacentEdges.size === 0) {
        nodesToCheck.delete(v);
        if (nodesToCheck.size === 0) {
            visual.finalColoring(cy, matching);
            auxiliaryFunc.finalOutput(matching);
        }
    }
}

function foundAugPath(cy, w) {
    document.getElementById('algoSvg').innerText +=
        "The distance between the " + w + "and the root of the tree is even\n Vertexes " + v + " and " + w +
        "have different roots \n" +
        "So we have found the augmenting path" + "\n\n";
    auxiliaryFunc.correctingNodesAndEdges(cy);
    visual.unColorAdjacentEdges(cy, matching);
    augPath = auxiliaryFunc.returnAugPath(graph, rootMap, parentMap, heightMap, v, w);
    document.getElementById('algoSvg').innerText += "The augmenting path: " + augPath + "\n\n";
    let wasBlossomed = fullLiftingAfterAugPathSFound(cy);
    if (wasBlossomed) {
        graph = graphConditions[0];
        matching = matchingConditions[0];
        blossoms = [];
        contractedVertexes = [];
        graphConditions = [];
        matchingConditions = [];
    } else {
        visual.drawAugmentingPath(augPath, cy);
    }
    matching = auxiliaryFunc.addAltEdges(augPath, graph, matching);
    let graphToCheck = graph;
    visual.finalColoring(cy, matching);
    if (graphConditions.length > 0) {
        graphToCheck = graphConditions[0];
    }
    if (auxiliaryFunc.checking(graphToCheck, matching)) {
        findAugPath(graph, matching, [], cy);
    } else {
        algorithmEnding(cy);
    }
}

function algorithmEnding(cy) {
    if (blossoms.length > 0) {
        for (let i = blossoms.length - 1; i >= 0; --i) {
            if (i === blossoms.length - 1) {
                augPath = liftPathWithBlossom(cy, augPath, blossoms[i], graphConditions[i], graph);
            } else {
                augPath = liftPathWithBlossom(cy, augPath, blossoms[i], graphConditions[i], graphConditions[i + 1]);
            }
        }
        document.getElementById('algoSvg').innerText += "The augmenting path: " + augPath + "\n\n";
    }
    matching = auxiliaryFunc.addAltEdges(augPath, graph, matching);
    auxiliaryFunc.finalOutput(matching);
}

function fullLiftingAfterAugPathSFound(cy) {
    let wasBlossomed = false;
    for (let i = blossoms.length - 1; i >= 0; --i) {
        if (auxiliaryFunc.containsEdgeWithNode(augPath, contractedVertexes[i])) {
            wasBlossomed = true;
            if (i === blossoms.length - 1) {
                augPath = liftPathWithBlossom(cy, augPath, blossoms[i], graphConditions[i], graph);
            } else {
                augPath = liftPathWithBlossom(cy, augPath, blossoms[i], graphConditions[i], graphConditions[i + 1]);
            }
            document.getElementById('algoSvg').innerText += "The augmenting path: " + augPath + "\n\n";
        }
    }
    return wasBlossomed;
}

function edgeProcessing(cy, source, target) {
    let w;
    let selectedEdge;
    if (v.value !== parseInt(target.toString(), 10)) {
        selectedEdge = graph.getEdge(v, graph.getVertex(parseInt(target.toString(), 10)));
    } else {
        selectedEdge = graph.getEdge(v, graph.getVertex(parseInt(source.toString(), 10)));
    }
    adjacentEdges.delete(selectedEdge);
    w = selectedEdge.getOtherEnd(v);
    document.getElementById('algoSvg').innerText = "Looking at vertexes " + v + " and " + w + "\n\n";
    if (!rootMap.has(w)) {
        secondVertexInMatching(w, cy);
    } else {
        if (heightMap.get(w) % 2 === 0) {
            if (rootMap.get(v) !== rootMap.get(w)) {
                foundAugPath(cy, w);
            } else {
                blossomFound(w, cy);
            }
            return augPath;
        } else {
            document.getElementById('algoSvg').innerText +=
                "The distance between the " + w + "and the root of the tree is odd, so we do nothing\n\n";
            for (let node of cy.nodes()) {
                node.selectify();
            }
        }
    }
    foundNothing(selectedEdge, cy);
}

function secondVertexInMatching(w, cy) {
    let x = auxiliaryFunc.findOtherNodeInMatching(matching, w);
    addToForest(rootMap, parentMap, heightMap, childMap, v, w, x);
    if (graph.getAdjacentEdges(x, matching).size > 0) {
        nodesToCheck.add(x);
    }
    visual.drawAddingToForest(v, w, x, cy);
    let forest = getForest();
    drawAddingEdgeToForest(forest, v, w, rootMap, childMap, parentMap);
    drawAddingEdgeToForest(forest, w, x, rootMap, childMap, parentMap);
    document.getElementById('algoSvg').innerText +=
        "The vertex " + w + "is in the matching, so we have found the adjacent vertex " + x + "which is also in the matching\n\n";
    document.getElementById('algoSvg').innerText += "Vertexes " + v + " , " + w + " , " + x + " added to forest\n\n";
    if (adjacentEdges.size === 0) {
        for (let node of nodesToCheck) {
            if (node.value !== v.value) {
                cy.getElementById(node.value).selectify();
            }
        }
    }
}

function addToForest(rootMap, parentMap, heightMap, childMap, v, w, x) {
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

module.exports = {
    getGraphFromCanvas: function (cy) {
        graph = new Graph();
        matching = new Set();
        clickedNode = 0;
        rootMap = new Map();
        childMap = new Map();
        parentMap = new Map();
        heightMap = new Map();
        exposedVertexes = new Set();
        unmarkedEdges = new Set();
        nodesToCheck = new Set();
        augPath = [];
        adjacentEdges = new Set([]);
        matchingConditions = [];
        blossoms = [];
        contractedVertexes = [];
        graphConditions = [];
        contrMatching = matching;
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
        if (graph.nodeMap.size >= 2 && graph.edgeSet.size >= 1) {
            blossomAlgorithm(graph, cy);
        } else {
            document.getElementById('algoSvg').innerText = "Your graph should have at least two vertexes and one edge"
            document.getElementById('button-create').disabled = false;
            document.getElementById('button-generate').disabled = false;
        }
    }
}

function findAugPathWithBlossom(contractedGraph, contractedMatching, blossomVertexes, cy) {
    nodesToCheck = getExposedNodes(graph, blossomVertexes, childMap);
    visual.colorExposedVertexes(nodesToCheck, cy);
    exposedVertexes = getExposedNodes(graph, blossomVertexes, childMap);
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

function blossomFound(w, cy) {
    document.getElementById('algoSvg').innerText +=
        "The distance between the " + w + "and the root of the tree is even\n Vertexes " + v + " and " + w +
        "have the same root\n";
    document.getElementById('algoSvg').innerText += "The blossom (the odd cycle) is found!\n\n"
    blossomRecursion(cy, matching, rootMap, parentMap, childMap, heightMap, v, w);
}

function blossomRecursion(cy, matching,
                          rootMap, parentMap, childMap, heightMap, v, w) {
    let blossomVertexes = blossomConstruction(w);
    document.getElementById('algoSvg').innerText += "\n";
    let contractedGraph = contractBlossom(graph, blossomVertexes, cy);
    notContractedGraph = graph;
    graphConditions.push(graph);
    matchingConditions.push(matching);
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
    findAugPathWithBlossom(graph, contractedMatching, blossomVertexes, cy);
    if (auxiliaryFunc.containsEdgeWithNode(augPath, contractedVertex)) {
        augPath = liftPathWithBlossom(cy, augPath, blossomVertexes, graph);
    }
    return augPath;
}

function blossomConstruction(w) {
    let root = rootMap.get(v);
    let blossomVertexes = [];
    document.getElementById('algoSvg').innerText += "Blossom is: \n";
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
    blossoms.push(blossomVertexes);
    for (let i = 0; i < correctedBlossom.length; ++i) {
        document.getElementById('algoSvg').innerText += correctedBlossom[i] + " ";
    }
    return blossomVertexes;
}

function contractBlossom(graph, blossom, cy) {
    let contracted = new Graph();
    contractedVertex = blossom[0];
    document.getElementById('algoSvg').innerText += "Contraction to " + contractedVertex + "\n\n";
    let allEdges = graph.getAllEdges();
    for (let edge of allEdges) {
        contracted.addEdge(edge);
    }
    let removed;
    for (let i = 0; i < blossom.length - 1; i++) {
        removed = contracted.removeEdge(blossom[i], blossom[i + 1]);
        visual.drawRemovingEdge(blossom[i], blossom[i + 1], cy);
    }
    contracted.removeEdge(blossom[blossom.length - 1], blossom[0]);
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
function liftPathWithBlossom(cy, augPath, blossom, notContractedGraph, contractedGraph) {
    let lifted = [];
    let contractedNode = blossom[0];
    document.getElementById('algoSvg').innerText += "Lifting blossom " + blossom + "\n";
    for (let i = 0; i < augPath.length; ++i) {
        if (augPath[i] === contractedNode) {
            if (i === augPath.length - 1) {
                liftingLastVertex(lifted, blossom, i, cy);
            } else {
                if (i % 2 === 0) {
                    liftingEventVertex(lifted, blossom, i, cy);
                }
                if (i % 2 === 1) {
                    liftingOddVertex(lifted, blossom, i, cy);
                }
            }
        }
        else {
            lifted.push(augPath[i]);
            cy.getElementById(augPath[i].value).show();
        }
    }
    drawLiftingNodesAndEdges(blossom, cy);
    removingExtraEdges(contractedGraph, cy);
    cy.fit();
    drawAugmentingPath(lifted, cy);
    return lifted;
}

function liftingLastVertex(lifted, blossom, i, cy) {
    let outgoingIndex = auxiliaryFunc.findOutgoingIndex(augPath[i - 1], blossom, notContractedGraph);
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
}

function liftingEventVertex(lifted, blossom, i, cy) {
    let outgoingIndex = auxiliaryFunc.findOutgoingIndex(augPath[i + 1], blossom, notContractedGraph);
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

function liftingOddVertex(lifted, blossom, i, cy) {
    let outgoingIndex = auxiliaryFunc.findOutgoingIndex(augPath[i + 1], blossom, notContractedGraph);
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

function drawLiftingNodesAndEdges(blossom, cy) {
    for (let node of blossom) {
        cy.getElementById(node.value).show();
    }
    for (let edge of notContractedGraph.edgeSet) {
        visual.drawShowingEdge(edge.firstVertex, edge.secondVertex, cy);
    }
}

function removingExtraEdges(contractedGraph, cy) {
    for (let edge of contractedGraph.edgeSet) {
        let hasNotContractedGraph = false;
        for (let edgeNot of notContractedGraph.edgeSet) {
            if (edge.firstVertex.value === edgeNot.firstVertex.value &&
                edge.secondVertex.value === edgeNot.secondVertex.value ||
                edge.secondVertex.value === edgeNot.firstVertex.value &&
                edge.firstVertex.value === edgeNot.secondVertex.value) {
                hasNotContractedGraph = true;
            }
        }
        if (!hasNotContractedGraph) {
            visual.drawRemovingEdge(edge.firstVertex, edge.secondVertex, cy);
        }
    }
}



