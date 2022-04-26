
module.exports = class Edge {
    marked;
    firstVertex;
    secondVertex;

    constructor(firstVertex, secondVertex) {
        this.firstVertex = firstVertex;
        this.secondVertex = secondVertex;
        this.marked = false;
    }

    getOtherEnd(oneEnd) {
        if (this.firstVertex.value === oneEnd.value) {
            return this.secondVertex;
        } else {
            return this.firstVertex;
        }
    }

    equals(obj) {
        if (obj instanceof Edge) {
            let objEdge = obj;
            return this.firstVertex.equals(objEdge.firstVertex) &&
                this.secondVertex.equals(objEdge.secondVertex);
        }
        return false;
    }

    toString() {
        return "(" + this.firstVertex + ", " + this.secondVertex + ")";
    }
}