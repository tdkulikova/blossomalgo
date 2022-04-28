const cytoscape = require("cytoscape");

module.exports = {
    makeForest: function () {
        let forest = cytoscape({
            container: document.getElementById('forestSvg'),
            minZoom: 0.1,
            maxZoom: 100,
            layout: {
                name: 'random'
            },
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
                        'target-arrow-shape': 'triangle',
                        'line-color': 'brown',
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
                        'width': 2
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
        forest.center();
    }
}