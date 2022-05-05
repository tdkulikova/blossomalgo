const auxiliaryFunc = require("./auxiliaryFunctions");
const visual = require("../visualization/makeVisual");
const {drawAugmentingPath} = require("../visualization/makeVisual");

module.exports = {liftPathWithBlossom}

function liftPathWithBlossom(cy, augPath, blossom, notContractedGraph, contractedGraph) {
    let lifted = [];
    let contractedNode = blossom[0];
    document.getElementById('algoSvg').innerText += "Lifting blossom " + blossom + "\n";
    for (let i = 0; i < augPath.length; ++i) {
        if (augPath[i] === contractedNode) {
            if (i === augPath.length - 1) {
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
            } else {
                if (i % 2 === 0) {
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
                if (i % 2 === 1) {
                    let outgoingIndex = auxiliaryFunc.findOutgoingIndex(augPath[i + 1], blossom, notContractedGraph);
                    if (outgoingIndex % 2 === 0) {
                        if (outgoingIndex === 0) {
                            outgoingIndex = auxiliaryFunc.findIngoingIndex(augPath[i - 1], blossom, notContractedGraph);
                        }
                        if (outgoingIndex % 2 === 1) {
                            for (let j = outgoingIndex; j < blossom.length; j++) {
                                lifted.push(blossom[j]);
                                cy.getElementById(blossom[j].value).show();
                            }
                            lifted.push(blossom[0]);
                        } else {
                            for (let j = outgoingIndex; j >= 0; j--) {
                                lifted.push(blossom[j]);
                                cy.getElementById(blossom[j].value).show();
                            }
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
        } else {
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
    cy.fit();
    drawAugmentingPath(lifted, cy);
    return lifted;
}