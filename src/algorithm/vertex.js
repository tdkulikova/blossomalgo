module.exports = class Vertex {
    value;
    visible;

    constructor(value) {
        this.value = value;
        this.visible = true;
    }

    toString() {
        return "<" + this.value + ">";
    }
}