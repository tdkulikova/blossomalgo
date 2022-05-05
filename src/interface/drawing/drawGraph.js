require("../styles/styles.js");
require("./initialization.js");

let cytoscape = require('cytoscape')
const {init} = require("./initialization");
const {makeForest} = require("../../visualization/forest")
require("./initialization");
document.addEventListener("DOMContentLoaded", main);

let gr;

function main() {
    makeFirstGraph();
    makeForest();
    init(gr);
}

let clickedNode = 0;

module.exports = clickedNode;

function makeFirstGraph() {
    gr = cytoscape({
        container: document.getElementById('graphSvg'),
        minZoom: 0.1,
        maxZoom: 100,
        layout: {
            name: 'random'
        },
        style: [{
            selector: 'node',
            style: {
                'width': 40,
                'height': 40,
                'content': 'data(text)',
                'text-valign': 'center',
                'color': 'white',
                'background-color': 'magenta',
                'text-outline-width': 0.5,
                'text-outline-color': '#222'
            }
        },

            {
                selector: 'edge',
                style: {
                    'width': 5,
                    'target-arrow-shape': 'triangle',
                    'line-color': 'pink',
                    'target-arrow-color': '#9dbaea'
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
                    'width': 5
                }
            }
        ],

        elements: {
            //selectable: true,
            grabbable: false,
            nodes: [{
                data: {
                    id: '1',
                    text: '1'
                }
            }, {
                data: {
                    id: '2',
                    text: '2'
                }
            }, {
                data: {
                    id: '3',
                    text: '3'
                }
            }, {
                data: {
                    id: '4',
                    text: '4'
                }
            }], // nodes
            edges: [{
                data: {
                    color: '#f00',
                    source: '1',
                    target: '2'
                }
            }, {
                data: {
                    color: '#f00',
                    source: '2',
                    target: '3'
                }
            }, {
                data: {
                    color: '#f00',
                    source: '3',
                    target: '4'
                }
            }, {
                data: {
                    color: '#f00',
                    source: '1',
                    target: '3'
                }
            }, {
                data: {
                    color: '#000',
                    source: '1',
                    target: '4'
                }
            },]
        }
    });
}

