class DisplayNode {
    constructor(_px, _py, _dom, _display, _physics) {
        this.id = ULID.ulid()
        this.display = _display
        this.p = new Victor(_px + noise(), _py + noise())
        this.v = new Victor(0, 0)
        this.physics = _physics
        this.dom = _dom
        this.dom.id = `node.${this.id}`
        this.displaytag = this.dom.querySelector('.display-node-tag')
        this.displaytag.id = `tag.${this.id}`
        this.updateDOMpos()
        this.updateDOMname()
    }
    updateDOMpos() {
        this.dom.style.top = this.p.y + "px"
        this.dom.style.left = this.p.x + "px"
    }
    updateDOMname() {
        this.displaytag.innerText = this.display
    }
}

class DisplayNodeLink {
    constructor(_ids, _idd, _cap, _dom, _dom2) {
        this.id = ULID.ulid()
        this.source = _ids
        this.drain = _idd
        this.capacity = _cap
        this.flow = 0
        this.dom = _dom
        this.dom2 = _dom2
    }
    updateDOMpos(x1, y1, x2, y2) {
        this.dom.setAttribute('x1', x1)
        this.dom.setAttribute('y1', y1)
        this.dom.setAttribute('x2', x2)
        this.dom.setAttribute('y2', y2)
        let dx = x2 - x1, dy = y2 - y1, fill = this.flow / this.capacity
        this.dom2.setAttribute('x1', x1)
        this.dom2.setAttribute('y1', y1)
        this.dom2.setAttribute('x2', x1 + dx * fill)
        this.dom2.setAttribute('y2', y1 + dy * fill)
    }
}