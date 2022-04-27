module.exports = class Vertex {
    value;
    visible;

    constructor(value) {
        this.value = value;
        this.visible = true;
    }

    getSmallerNode(node1, node2) {
        if (node1.value < node2.value) {
            return node1;
        } else {
            return node2;
        }
    }

    getBiggerNode(node1, node2) {
        if (node1.value >= node2.value) {
            return node1;
        } else {
            return node2;
        }
    }

    hashCode() {
        return this.value.hashCode();
    }

    equals(obj) {
        if (obj instanceof Node) {
            return this.value.equals(obj.value);
        }
        return false;
    }

    toString() {
        return "<" + this.value + ">";
    }
}