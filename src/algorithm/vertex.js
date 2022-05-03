module.exports = class Vertex {
    value;
    visible;

    constructor(value) {
        this.value = value;
        this.visible = true;
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