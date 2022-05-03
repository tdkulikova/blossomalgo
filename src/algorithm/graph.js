let Vertex = require('./vertex.js');
let Edge = require("./edge.js");

module.exports = class Graph {
    nodeMap;
    adjacencyList;
    edgeSet;
    contractedVertex;
    components = [];
    used = [];

    constructor() {
        this.component = [];
        this.nodeMap = new Map();
        this.edgeSet = new Set();
        this.adjacencyList = new Map();
        this.used = [];
        this.findComponents();
    }

    dfs(v) {
        this.used[v.value - 1] = true;
        this.component.push(v);
        let edges = new Set();
        let map = this.adjacencyList.get(v);
        map.forEach((value) => {
            edges.add(value)
        });
        for (let edge of edges) {
            let to;
            if (edge.firstVertex !== v) {
                to = edge.firstVertex;
            } else {
                to = edge.secondVertex;
            }
            if (!this.used[to.value - 1]) {
                this.dfs(to);
            }
        }
    }

    findComponents() {
        this.components = [];
        for (let i = 0; i < this.nodeMap.size; ++i) {
            this.used[i] = false;
        }
        for (let i = 0; i < this.nodeMap.size; ++i) {
            if (!this.used[i]) {
                if (this.component.length !== 0) {
                    this.components.push(this.component);
                }
                this.component = [];
                this.dfs(this.nodeMap.get(i + 1));
            }
        }
        if (this.component.length !== 0) {
            this.components.push(this.component);
        }
    }

    size() {
        return this.nodeMap.size();
    }

    addEdgeByTwoVertexes(first_vertex, second_vertex) {
        let f = this.addOrRetrieveVertex(first_vertex);
        let t = this.addOrRetrieveVertex(second_vertex);
        let edge = new Edge(f, t);
        this.adjacencyList.get(f).set(t, edge);
        this.adjacencyList.get(t).set(f, edge);
        this.edgeSet.add(edge);
    }

    addOrRetrieveVertex(value) {
        let node = this.nodeMap.get(value);
        if (node == null) {
            node = new Vertex(value);
            this.nodeMap.set(value, node);
            this.adjacencyList.set(node, new Map());
        }
        return node;
    }

    addEdge(edge) {
        let wasAdded = false;
        for (let edgeSet of this.edgeSet) {
            if (edgeSet.firstVertex.value === edge.firstVertex.value &&
                edgeSet.secondVertex.value === edge.secondVertex.value || edgeSet.firstVertex.value === edge.secondVertex.value &&
                edgeSet.secondVertex.value === edge.firstVertex.value) {
                wasAdded = true;
            }
        }
        if (!wasAdded) {
            if (!this.nodeMap.has(edge.firstVertex.value)) {
                this.nodeMap.set(edge.firstVertex.value, edge.firstVertex);
                this.adjacencyList.set(edge.firstVertex, new Map());
            }
            if (!this.nodeMap.has(edge.secondVertex.value)) {
                this.nodeMap.set(edge.secondVertex.value, edge.secondVertex);
                this.adjacencyList.set(edge.secondVertex, new Map());
            }
            this.adjacencyList.get(edge.firstVertex).set(edge.secondVertex, edge);
            this.adjacencyList.get(edge.secondVertex).set(edge.firstVertex, edge);
            this.edgeSet.add(edge);
            edge.firstVertex.visible = true;
            edge.secondVertex.visible = true;
        }
    }

    getVertex(value) {
        let v = this.nodeMap.get(value);
        return v;
    }

    getAllEdges() {
        return new Set(this.edgeSet);
    }

    getAllVertexes() {
        return new Set(this.nodeMap.values());
    }

    getAdjacentEdges(v, matching) {
        let list = new Set();
        let map = this.adjacencyList.get(v);
        map.forEach((value) => {
            if (!matching.has(value)) list.add(value)
        });
        return list;
    }

    getAdjacentVertexes(node) {
        return new Set(this.adjacencyList.get(node).keys());
    }

    getContractedVertex() {
        return this.contractedVertex;
    }

    getEdge(node1, node2) {
        return this.adjacencyList.get(node1).get(node2);
    }

    removeEdge(first_vertex, second_vertex) {
        let edge = this.adjacencyList.get(first_vertex).get(second_vertex);
        this.edgeSet.delete(edge);
        this.adjacencyList.get(first_vertex).delete(second_vertex);
        this.adjacencyList.get(second_vertex).delete(first_vertex);
        first_vertex.visible = false;
        second_vertex.visible = false;
        return edge;
    }

    addContractedVertex(vertex) {
        this.contractedVertex = vertex;
    }

    toString() {
        this.nodeMap.toString();
    }
}