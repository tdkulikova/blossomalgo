
module.exports = class Edge {
    firstVertex;
    secondVertex;

    constructor(firstVertex, secondVertex) {
        this.firstVertex = firstVertex;
        this.secondVertex = secondVertex;
    }

    getAnotherEnd(vertex) {
        if (this.firstVertex.value === vertex.value) {
            return this.secondVertex;
        } else {
            return this.firstVertex;
        }
    }


    toString() {
        return "(" + this.firstVertex + ", " + this.secondVertex + ")";
    }
}