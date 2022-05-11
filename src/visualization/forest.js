const cytoscape = require("cytoscape");
require("../algorithm/auxiliaryFunctions");
require("./makeVisual");
let forest;

module.exports = {
    makeForest: function () {
        forest = cytoscape({
            container: document.getElementById('forestSvg'),
            minZoom: 0.1,
            maxZoom: 100,
            layout: {
                name: 'breadthfirst',
            },
            directed: true,
            style: [{
                selector: 'node',
                style: {
                    'width': 20,
                    'height': 20,
                    'content': 'data(text)',
                    'text-valign': 'center',
                    'color': 'white',
                    'background-color': 'green',
                    'text-outline-width': 0.5,
                    'text-outline-color': '#222'
                }
            },

                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'curve-style': 'bezier',
                        'target-arrow-shape': 'triangle',
                        'line-color': 'brown',
                        'target-arrow-color': 'brown',
                    }
                },

                {
                    selector: ':selected',
                    style: {
                        'background-color': 'yellow',
                        'line-color': 'yellow',
                        'target-arrow-color': 'black',
                        'source-arrow-color': 'black',
                    }
                },

                {
                    selector: 'edge:selected',
                    style: {
                        'width': 2
                    }
                }
            ],
            elements: {
                directed: true,
                grabbable: false,
                nodes: [], // nodes
                edges: []

            }
        });
        forest.center();
    },

    getForest: function () {
        return forest;
    },

    cleanForest: function () {
        for (let node of forest.nodes()) {
            forest.remove(node);
        }
    }
}