Victor.prototype.scale = function(scalar) {
    this.x *= scalar
    this.y *= scalar
    return this
}
Victor.prototype.limit = function(limit) {
    let limSq = limit * limit
    if (this.lengthSq() > limSq) {
        this.norm().scale(limit)
    }
}

function noise(scale = 1) {
    return (Math.floor(Math.random() * (2001)) - 1000) * scale / 1000
}

function clamp(number, min, max) {
    return Math.max(min, Math.min(number, max));
}

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}