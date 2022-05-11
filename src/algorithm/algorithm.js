let Graph = require("./graph.js");
require("./vertex.js");
let Edge = require("./edge.js");
require('cytoscape');
let {getForest, cleanForest} = require("../visualization/forest");
let visual = require("../visualization/makeVisual");
let auxiliaryFunc = require("./auxiliaryFunctions");
const {drawAddingEdgeToForest, drawAddingNodeToForest} = require("../visualization/makeVisual");
const {liftPathWithBlossom} = require("./lifting")

let matching = new Set();
let clickedVertex = 0;
let forestRoots;
let forestChild;
let forestParents;
let forestHeights;
let vertexesToCheck;
let augPath = [];
let adjacentEdges = new Set([]);
let matchingConditions = [];
let notContractedGraph;
let contractedVertex;
let blossoms = [];
let contractedVertexes = [];
let graphConditions = [];
let contrMatching = matching;

let v;

function findAugmentingPath(graph, matching, blossomVertexes, cy) {
    augPath = [];
    if (blossomVertexes.length === 0) {
        forestRoots = new Map();
        forestChild = new Map();
        forestParents = new Map();
        forestHeights = new Map();
    }
    cleanForest();
    processingExposedVertexes(blossomVertexes, cy);
}

function processingExposedVertexes(blossomVertexes, cy) {
    vertexesToCheck = auxiliaryFunc.getExposedVertexes(graph, blossomVertexes, matching, forestChild);
    if (vertexesToCheck.size === 0) {
        auxiliaryFunc.finalOutput(matching);
    }
    visual.colorExposedVertexes(vertexesToCheck, cy);
    let number = 0;
    for (let vertex of vertexesToCheck) {
        drawAddingNodeToForest(getForest(), vertex, vertexesToCheck.size, number);
        forestRoots.set(vertex, vertex);
        forestParents.set(vertex, null);
        forestChild.set(vertex, []);
        forestHeights.set(vertex, 0);
        ++number;
    }
}

function findAugPathWithBlossom(contractedGraph, contractedMatching, blossomVertexes, cy) {
    auxiliaryFunc.correctingNodesAndEdges(cy);
    visual.unColorAdjacentEdges(cy, matching);
    visual.finalColoring(cy, matching);
    vertexesToCheck = auxiliaryFunc.getExposedVertexes(graph, blossomVertexes, matching, forestChild);
    visual.colorExposedVertexes(vertexesToCheck, cy);
}

function vertexProcessing(cy) {
    v = graph.getVertex(parseInt(clickedVertex.toString(), 10));
    document.getElementById('algoSvg').innerText = "Working on vertex " + clickedVertex + "\n\n";
    adjacentEdges = graph.getAdjacentEdges(v, matching);
    if (adjacentEdges.size === 0) {
        cy.getElementById(v.value).style({
            'background-color': 'red'
        });
        findAugmentingPath(graph, matching, [], cy);
    } else {
        visual.colorAdjacentEdges(cy, adjacentEdges, matching);
    }
}

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
    adjacentEdges.delete(selectedEdge);
    w = selectedEdge.getAnotherEnd(v);
    document.getElementById('algoSvg').innerText = "Looking at vertexes " + v + " and " + w + "\n\n";
    checkingSelectedEdge(w, cy);
    endingAlgorithm(cy, selectedEdge);
}

function checkingSelectedEdge(w, cy) {
    if (!forestRoots.has(w)) {
        secondVertexInMatching(w, cy);
    } else {
        if (forestHeights.get(w) % 2 === 0) {
            if (forestRoots.get(v) !== forestRoots.get(w)) {
                foundAugmentingPath(cy, w);
            } else {
                blossomFound(w, cy);
            }
            return augPath;
        } else {
            foundNothing(cy, w);
        }
    }
}

function secondVertexInMatching(w, cy) {
    let x = auxiliaryFunc.findAnotherVertexInMatching(matching, w);
    addToForest(v, w, x);
    if (graph.getAdjacentEdges(x, matching).size > 0) {
        vertexesToCheck.add(x);
    }
    visual.drawAddingToForest(v, w, x, cy);
    let forest = getForest();
    drawAddingEdgeToForest(forest, v, w, forestRoots, forestChild, forestParents);
    drawAddingEdgeToForest(forest, w, x, forestRoots, forestChild, forestParents);
    document.getElementById('algoSvg').innerText +=
        "The vertex " + w + "is in the matching, so we have found the adjacent vertex " + x +
        "which is also in the matching\n\n";
    document.getElementById('algoSvg').innerText +=
        "Vertexes " + v + " , " + w + " , " + x + " were added to forest\n\n";
    if (adjacentEdges.size === 0) {
        for (let node of vertexesToCheck) {
            if (node.value !== v.value) {
                cy.getElementById(node.value).selectify();
            }
        }
    }
}

function foundAugmentingPath(cy, w) {
    document.getElementById('algoSvg').innerText +=
        "The distance between the " + w + "and the root of the tree is even\n Vertexes " + v + " and " + w +
        "have different roots \n" +
        "So we have found the augmenting path" + "\n\n";
    auxiliaryFunc.correctingNodesAndEdges(cy);
    visual.unColorAdjacentEdges(cy, matching);
    let wasBlossomed;
    augPath = auxiliaryFunc.returnAugPath(forestParents, v, w);
    document.getElementById('algoSvg').innerText += "The augmenting path: " + augPath + "\n\n";
    for (let i = blossoms.length - 1; i >= 0; --i) {
        wasBlossomed = true;
        lifting(i, cy);
    }
    initializeOrDrawAugPath(wasBlossomed, cy);
    matching = auxiliaryFunc.inverseAugPath(augPath, graph, matching);
    let graphToCheck = graph;
    visual.finalColoring(cy, matching);
    if (graphConditions.length > 0) {
        graphToCheck = graphConditions[0];
    }
    endOrGoNext(graphToCheck, cy);
}

function initializeOrDrawAugPath(wasBlossomed, cy) {
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
}

function endOrGoNext(graphToCheck, cy) {
    if (auxiliaryFunc.checking(graphToCheck, matching)) {
        findAugmentingPath(graph, matching, [], cy);
    } else {
        if (blossoms.length > 0) {
            fullLifting(cy);
        }
        matching = auxiliaryFunc.inverseAugPath(augPath, graph, matching);
        if (vertexesToCheck.size - 1 > 0) {
            auxiliaryFunc.finalOutput(matching);
        }
    }
}

function lifting(i, cy) {
    if (i === blossoms.length - 1) {
        augPath = liftPathWithBlossom(cy, augPath, blossoms[i], graphConditions[i], graph);
    } else {
        augPath = liftPathWithBlossom(cy, augPath, blossoms[i], graphConditions[i], graphConditions[i + 1]);
    }
    document.getElementById('algoSvg').innerText += "The augmenting path: " + augPath + "\n\n";
}

function foundNothing(cy, w) {
    document.getElementById('algoSvg').innerText +=
        "The distance between the " + w + "and the root of the tree is odd, so we do nothing\n\n";
    if (adjacentEdges.size === 0) {
        for (let node of vertexesToCheck) {
            if (node.value !== v.value) {
                cy.getElementById(node.value).selectify();
            }
        }
    }
}

function blossomFound(w, cy) {
    document.getElementById('algoSvg').innerText +=
        "The distance between the " + w + "and the root of the tree is even\n Vertexes " + v + " and " + w +
        "have the same root\n";
    document.getElementById('algoSvg').innerText += "The blossom (the odd cycle) is found!\n\n"
    blossomConstruction(cy, matching, forestRoots, forestParents, forestChild, forestHeights, v, w);
}

function endingAlgorithm(cy, selectedEdge) {
    visual.unColorEdge(selectedEdge, cy);
    if (adjacentEdges.size === 0) {
        vertexesToCheck.delete(v);
        if (vertexesToCheck.size === 0) {
            if (blossoms.length > 0) {
                fullLifting(cy);
            }
            matching = auxiliaryFunc.inverseAugPath(augPath, graph, matching);
            visual.finalColoring(cy, matching);
            auxiliaryFunc.finalOutput(matching);
        }
    }
}

function fullLifting(cy) {
    for (let i = blossoms.length - 1; i >= 0; --i) {
        if (i === blossoms.length - 1) {
            augPath = liftPathWithBlossom(cy, augPath, blossoms[i], graphConditions[i], graph);
        } else {
            augPath = liftPathWithBlossom(cy, augPath, blossoms[i], graphConditions[i], graphConditions[i + 1]);
        }
    }
    document.getElementById('algoSvg').innerText += "The augmenting path: " + augPath + "\n\n";
}

function addToForest(v, w, x) {
    let root = forestRoots.get(v);
    forestRoots.set(w, root);
    forestRoots.set(x, root);
    forestParents.set(w, v);
    if (forestChild.has(v)) {
        let children = forestChild.get(v);
        children.push(w);
        forestChild.set(w, []);
    } else {
        forestChild.set(v, []);
        forestChild.get(v).push(w);
        forestChild.set(w, []);
    }
    forestParents.set(x, w);
    if (forestChild.has(w)) {
        forestChild.get(w).push(x);
        forestChild.set(x, []);
    } else {
        forestChild.set(w, []);
        forestChild.get(w).push(x);
        forestChild.set(w, []);
    }
    forestHeights.set(w, forestHeights.get(v) + 1);
    forestHeights.set(x, forestHeights.get(v) + 2);
    return null;
}

function blossomConstruction(cy, matching,
                             forestRoots, forestParents, forestChild, forestHeights, v, w) {

    let root = forestRoots.get(v);
    let blossomVertexes = [];
    document.getElementById('algoSvg').innerText += "Blossom is: \n";
    let curr = v;
    while (curr !== root) {
        if (curr.visible) {
            blossomVertexes.push(curr);
        }
        curr = forestParents.get(curr);
    }
    blossomVertexes.push(root);
    blossomVertexes.reverse();
    curr = w;
    while (curr !== root) {
        if (curr.visible) {
            blossomVertexes.push(curr);
        }
        curr = forestParents.get(curr);
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
    document.getElementById('algoSvg').innerText += "\n";
    contraction(blossomVertexes, cy);
}

function contraction(blossomVertexes, cy) {
    let contractedGraph = contractBlossom(graph, blossomVertexes, cy);
    notContractedGraph = graph;
    graphConditions.push(graph);
    matchingConditions.push(matching);
    graph = contractedGraph;
    let contractedVertex = contractedGraph.getContractedVertex();
    visual.hideBlossomVertexes(blossomVertexes, cy, contractedVertex);
    cy.fit();
    let contractedMatching =
        auxiliaryFunc.contractMatching(contractedGraph, contrMatching, blossomVertexes, contractedVertex);
    contrMatching = contractedMatching;
    findAugPathWithBlossom(graph, contractedMatching, blossomVertexes, cy);
    if (auxiliaryFunc.containsEdgeWithVertex(augPath, contractedVertex)) {
        augPath = liftPathWithBlossom(cy, augPath, blossomVertexes, graph);
    }
    return augPath;
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
    for (let node of blossom) {
        if (node.value !== contractedVertex.value) {
        node.visible = false;}
    }
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
                let isInBlossom = false;
                for (let j = 0; j < blossom.length; ++j) {
                    if (node.value === blossom[j].value) {
                        isInBlossom = true;
                    }
                }
                if (!isInBlossom) {
                    contracted.addEdge(new Edge(node, contractedVertex, false));
                    visual.drawAddingEdge(node, contractedVertex, cy);
                }
            }
        }
    }
    contracted.addContractedVertex(contractedVertex);
    contractedVertexes.push(contractedVertex);
    contractedVertex.visible = true;
    return contracted;
}

let graph = new Graph();

function initializeFields() {
    graph = new Graph();
    matching = new Set();
    clickedVertex = 0;
    forestRoots = new Map();
    forestChild = new Map();
    forestParents = new Map();
    forestHeights = new Map();
    vertexesToCheck = new Set();
    augPath = [];
    adjacentEdges = new Set([]);
    matchingConditions = [];
    blossoms = [];
    contractedVertexes = [];
    graphConditions = [];
    contrMatching = matching;
}

function checkAndStart(cy) {
    if (graph.nodeMap.size >= 2 && graph.edgeSet.size >= 1) {
        findAugmentingPath(graph, matching, [], cy);
    } else {
        document.getElementById('algoSvg').innerText =
            "Your graph should have at least two vertexes and one edge"
        document.getElementById('button-create').disabled = false;
        document.getElementById('button-generate').disabled = false;
    }
}

function selectingVertexEvent(cy) {
    cy.on('select', 'node', function () {
        cy.getElementById(this.id()).style({
            'width': 40,
            'height': 40,
            'text-valign': 'center',
            'color': 'white',
            'background-color': 'yellow',
            'text-outline-width': 0.5,
            'text-outline-color': '#222'
        })
        clickedVertex = this.id();
        for (let node of cy.nodes()) {
            if (node.id() !== this.id()) {
                node.unselectify();
            }
        }
        vertexProcessing(cy);
    });
}

function selectingEdgeEvent(cy) {
    cy.on('select', 'edge', function () {
        this.style({
            'line-color': 'yellow',
        })
        edgeProcessing(cy, this.source().id(), this.target().id());
    });
}

function addEdgesAndVertexesToGraph(cy) {
    for (let edge of cy.edges()) {
        graph.addEdgeByTwoVertexes(parseInt(edge.source().id()), parseInt(edge.target().id()));
    }
    for (let node of cy.nodes()) {
        if (!graph.nodeMap.has(parseInt(node.id()))) {
            graph.nodeMap.set(parseInt(node.id()), node);
        }
    }
}

module.exports = {
    getGraphFromCanvas: function (cy) {
        initializeFields();
        addEdgesAndVertexesToGraph(cy);
        graph.findComponents();
        auxiliaryFunc.correctingNodesAndEdges(cy);
        selectingVertexEvent(cy);
        selectingEdgeEvent(cy);
        checkAndStart(cy);
    }
}