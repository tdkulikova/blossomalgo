module.exports = {
    colorAdjacentEdges(cy, adjacentEdges) {
        for (let edge of adjacentEdges) {
            for (let ele of cy.edges()) {
                if (parseInt(ele.source().id()) === edge.firstVertex.value &&
                    parseInt(ele.target().id()) === edge.secondVertex.value ||
                    parseInt(ele.target().id()) === edge.firstVertex.value &&
                    parseInt(ele.source().id()) === edge.secondVertex.value) {
                    ele.style({
                        'line-color': 'blue'
                    })
                    ele.selectify();
                }
            }
        }
    },
    finalColoring: function (cy, matching) {
        for (let node of cy.nodes()) {
            for (let edge of matching) {
                if (edge.firstVertex.value === parseInt(node.id(), 10) ||
                    edge.secondVertex.value === parseInt(node.id(), 10)) {
                    node.style({
                        'background-color': 'red'
                    })
                }
            }
        }
    },

    unColorEdge: function (selectedEdge, cy) {
        for (let ele of cy.edges()) {
            if (parseInt(ele.source().id()) === selectedEdge.firstVertex.value &&
                parseInt(ele.target().id()) === selectedEdge.secondVertex.value) {
                ele.style({
                    'line-color': 'pink'
                })
            }
        }
    },

    unColorAdjacentEdges: function (cy, matching) {
        let isInMatching = false;
        for (let ele of cy.edges()) {
            isInMatching = false;
            for (let edge of matching) {
                if (parseInt(ele.source().id()) === edge.firstVertex.value &&
                    parseInt(ele.target().id()) === edge.secondVertex.value) {
                    isInMatching = true;
                }
            }
            if (!isInMatching) {
                ele.style({
                    'line-color': 'pink'
                })
            }
        }
    },

    drawAugmentingPath: function (augPath, cy) {
        for (let i = 0; i < augPath.length - 1; ++i) {
            cy.getElementById(augPath[i].value).style({
                'width': 40,
                'height': 40,
                'text-valign': 'center',
                'color': 'white',
                'background-color': 'red',
                'text-outline-width': 0.5,
                'text-outline-color': '#222'
            })
            cy.getElementById(augPath[i + 1].value).style({
                'width': 40,
                'height': 40,
                'text-valign': 'center',
                'color': 'white',
                'background-color': 'red',
                'text-outline-width': 0.5,
                'text-outline-color': '#222'
            })
            for (let edge of cy.edges()) {
                if (parseInt(edge.source().id()) === augPath[i].value &&
                    parseInt(edge.target().id()) === augPath[i + 1].value || parseInt(edge.target().id()) === augPath[i].value &&
                    parseInt(edge.source().id()) === augPath[i + 1].value) {
                    if (i % 2 === 0) {
                        edge.style({
                            'line-color': 'yellow'
                        })
                        edge.animate({
                            style: {
                                'line-color': 'red'
                            },
                            duration: 2000
                        })
                    } else {
                        edge.style({
                            'line-color': 'red'
                        })
                        edge.animate({
                            style: {
                                'line-color': 'pink'
                            },
                            duration: 2000
                        })
                    }
                }
            }
        }
    },

    colorExposedVertexes: function (nodesToCheck, cy) {
        for (let node of nodesToCheck) {
            cy.getElementById(node.value).style({
                'width': 40,
                'height': 40,
                'text-valign': 'center',
                'color': 'white',
                'background-color': 'blue',
                'text-outline-width': 0.5,
                'text-outline-color': '#222'
            });
            cy.getElementById(node.value).selectify();
        }
    },

    drawAddingToForest: function (v, w, x, cy) {

        cy.getElementById(v.value).style({
            'background-color': 'green'
        })
        cy.getElementById(w.value).style({
            'background-color': 'red'
        })
        cy.getElementById(x.value).style({
            'background-color': 'blue'
        })
        for (let edge of cy.edges()) {
            if (parseInt(edge.source().id()) === v.value &&
                parseInt(edge.target().id()) === w.value || parseInt(edge.source().id()) === w.value &&
                parseInt(edge.target().id()) === v.value) {
                edge.animate({
                    style: {
                        'line-color': 'green'
                    },
                    duration: 1
                })
            }
        }
    },

    drawRemovingEdge: function (firstVertex, secondVertex, cy) {
        for (let edge of cy.edges()) {
            if (parseInt(edge.source().id()) === firstVertex.value &&
                parseInt(edge.target().id()) === secondVertex.value || parseInt(edge.source().id()) === secondVertex.value &&
                parseInt(edge.target().id()) === firstVertex.value) {
                edge.hide();
            }
        }
    },

    drawAddingEdge: function (firstVertex, secondVertex, cy) {
        cy.add({
            group: 'edges',
            data: {source: firstVertex.value, target: secondVertex.value}
        })
    },

    drawShowingEdge: function (firstVertex, secondVertex, cy) {
        for (let edge of cy.edges()) {
            if (parseInt(edge.source().id()) === firstVertex.value &&
                parseInt(edge.target().id()) === secondVertex.value || parseInt(edge.source().id()) === secondVertex.value &&
                parseInt(edge.target().id()) === firstVertex.value) {
                edge.show();
            }
        }
    },

    drawAddingEdgeToForest: function (forest, firstVertex, secondVertex) {
        let isFirstExists = false;
        let isSecondExists = false;
        for (let node of forest.nodes()) {
            if (parseInt(node.id(), 10) === firstVertex.value) {
                isFirstExists = true;
            }
        }
        for (let node of forest.nodes()) {
            if (parseInt(node.id(), 10) === secondVertex.value) {
                isSecondExists = true;
            }
        }
        if (isFirstExists) {
            forest.add({
                group: 'nodes',
                data: {
                    id: secondVertex.value,
                    text: secondVertex.value
                }
            })
            forest.add({
                group: 'edges',
                data: {source: firstVertex.value, target: secondVertex.value}
            })
        }
        forest.fit();
        forest.center();
    },

    drawAddingNodeToForest: function (forest, vertex, size, number) {
        let forestSvg = document.querySelector('#forestSvg');
        forest.startBatch();
        forest.add({
            group: 'nodes',
            layout: {
                name: 'breadthfirst'
            },
            data: {
                id: vertex.value,
                text: vertex.value,
            },
            position: {
                x: number / size * forestSvg.getBoundingClientRect().width,
                y: 10,
            }
        });
        forest.endBatch();
        forest.center();
        forest.fit()
    }
}