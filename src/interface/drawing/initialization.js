const cytoscape = require("cytoscape");

const {getGraphFromCanvas} = require("../../algorithm/blossom");
const Json = require("cytoscape/src/style/json");

let cont = cytoscape();
module.exports = cont;

let graph = cytoscape();

module.exports = {
    init: function (gr) {
        graph = gr;
        let button = document.querySelector("#button-create")
        button.addEventListener("click", function () {
            initial();
        })
        let generateButton = document.querySelector("#button-generate");
        generateButton.addEventListener("click", function () {
            graphGenerator();

        })
        let startAlgorithmButton = document.querySelector("#button-start");
        startAlgorithmButton.addEventListener("click", function () {
            getGraphFromCanvas(graph);
        })
    }
}

function graphGenerator() {
    let nodesAmount = Math.random() * 10 + 1;
    graph.destroy();
    graph = cytoscape({
            container: document.getElementById('graphSvg'),

            minZoom: 0.1,
            maxZoom: 100,

            // panningEnabled: false,
            //boxSelectionEnabled: true,
            //autounselectify: false,
            //selectionType: 'additive',
            //autoungrabify: true,

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
                //selectable: false,
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
                }], // nodes
                edges: [{
                    data: {
                        color: '#f00',
                        source: '1',
                        target: '2'
                    }
                }] // edges
            } // elements
        }
    ); // cytoscape*/);

    let graphSvg = document.querySelector('#graphSvg');
    document.getElementById('algoSvg').innerHTML = '<b>Новое содержимое</b>';

    graph.startBatch();
    for (let i = 3; i <= nodesAmount; ++i) {
        graph.add(
            {
                group: 'nodes',
                layout: {
                    name: 'random'
                },
                data: {
                    id: i,
                    text: i,
                },
                position: {
                    x: Math.random() * graphSvg.getBoundingClientRect().width,
                    y: Math.random() * graphSvg.getBoundingClientRect().height
                }
            });
    }
    let probability = 0.7;
    console.log("Probability: " + probability + "\n");
    for (let i = 1; i < nodesAmount; ++i) {
        for (let j = i; j <= nodesAmount; ++j) {
            if (i !== j) {
                let randomNumber = Math.random();
                console.log("Random number:" + randomNumber);
                if (randomNumber > probability) {
                    graph.add({
                        group: 'edges',
                        data: {source: i, target: j}
                    });
                }
            }
        }
    }
    graph.endBatch();
    graph.center();
    graph.fit();
}


function initial() {
    let nodeOptions = {
        normal: {
            bgColor: 'grey'
        },
        selected: {
            bgColor: 'yellow'
        }
    };

    let edgeOptions = {
        selected: {
            lineColor: 'yellow'
        }
    };

    //graph.mount(document.getElementById('graphSvg'));

    //cy.mount(document.getElementById("graphics"))
    let cy = cytoscape({
        container: document.getElementById('graphics'),

        minZoom: 0.1,
        maxZoom: 100,

        // panningEnabled: false,
        //boxSelectionEnabled: true,
        //autounselectify: false,
        //selectionType: 'additive',
        //autoungrabify: true,

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
            //selectable: false,
            grabbable: false,
            nodes: [], // nodes
            edges: [] // edges
        } // elements
    }); // cytoscape*/

    for (let node of graph.nodes()) {
        cy.add(node);
    }
    for (let edge of graph.edges()) {
        cy.add(edge);
    }
    cy.center();
    cy.fit();
    let clickedNode;

    let lastId = cy.nodes().length;
    let lastEdgeId = -cy.nodes().length - 1;
    let graphics = document.querySelector("#graphics");
    graphics.addEventListener("dblclick", function (e) {
        lastId += 1;
        cy.add({
            group: 'nodes',
            data: {
                id: lastId,
                text: lastId
            },
            renderedPosition: {x: e.offsetX, y: e.offsetY}
        });
    })

    cy.on('click', 'node', function (evt) {
        clickedNode = this.id();
    });

    cy.on('select', 'edge', function (evt) {
        clickedNode = this.id();
    });

    cy.on('select', 'node', function () {
        let selectedNodes = 0;
        let ids = [];
        for (let node of cy.nodes()) {
            if (node.selected()) {
                ++selectedNodes;
                ids.push(node.id());
            }
        }
        if (selectedNodes === 2) {
            console.log("Adding edge " + lastEdgeId);
            cy.add({
                group: 'edges',
                data: {source: ids[0], target: ids[1]}
            });
            lastEdgeId -= 1;
            for (let node of cy.nodes()) {
                if (node.selected()) {
                    node.unselect();
                }
            }
        } else {
            console.log(selectedNodes + "\n");
        }

    })

    let deleteButton = document.querySelector('#button-delete');
    deleteButton.addEventListener("click", function () {
        cy.remove(cy.getElementById(clickedNode));
    })

    let clearButton = document.querySelector('#button-clear');
    clearButton.addEventListener("click", function () {
        for (let node of cy.nodes()) {
            cy.remove(node);
        }
        lastId = 0;
        for (let edge of cy.edges()) {
            cy.remove(edge);
        }
        lastEdgeId = -1;
    })

    let okButton = document.querySelector('#button-ok');
    okButton.addEventListener("click", function () {
        graph.unmount();
        graph = cytoscape({
            //container: document.getElementById('graphSvg'),

            minZoom: 0.1,
            maxZoom: 100,

            // panningEnabled: false,
            //boxSelectionEnabled: true,
            //autounselectify: false,
            //selectionType: 'additive',
            //autoungrabify: true,

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
                //selectable: false,
                grabbable: false,
                nodes: [], // nodes
                edges: [] // edges
            } // elements
        }); // cytoscape*/);
        //cy.mount(document.getElementById('graphSvg'));
        for (let node of cy.nodes()) {
            graph.add(node);
        }
        for (let edge of cy.edges()) {
            graph.add(edge);
        }
        graph.mount(document.getElementById('graphSvg'))
        graph.center();
        graph.fit();
    })
}