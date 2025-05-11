const gravityCoef = 1.1
const repulsionCoef = 8000.0
const attractionCoef = 0.2
const targetLinkLength = 200

let display_element = document.getElementById('display')
let canvas_element = document.getElementById('canvas')
let cw = null, ch = null
let nodelist = null

let physics = true

function updateDBCR() {
    let dbcr = display_element.getBoundingClientRect()
    cw = dbcr.width
    ch = dbcr.height
}
updateDBCR()

function updateDisplay() {
    for (i = 0; i < nodelist.length; i++) {
        nodelist[i].updateDOMpos()
    }
    for (i = 0; i < nodelinklist.length; i++) {
        let n1 = nodelistmap.get(nodelinklist[i].source)
        let n2 = nodelistmap.get(nodelinklist[i].drain)
        nodelinklist[i].updateDOMpos(n1.p.x, n1.p.y, n2.p.x, n2.p.y)
    }
}
function updatePositions() {
    updateDBCR()
    let nodelistlength = nodelist.length
    let nodelinklistlength = nodelinklist.length
    for (i = 0; i < nodelistlength; i++) {
        force = new Victor(cw / 2, ch / 2).subtract(nodelist[i].p).scale(gravityCoef)
        nodelist[i].v = force
    }
    for (i = 0; i < nodelistlength - 1; i++) {
        for (j = i + 1; j < nodelistlength; j++) {
            if (nodelist[i].p.x == nodelist[j].p.x) {
                nodelist[i].p.x += noise(0.1)
                nodelist[j].p.x += noise(0.1)
            }
            if (nodelist[i].p.y == nodelist[j].p.y) {
                nodelist[i].p.y += noise(0.1)
                nodelist[j].p.y += noise(0.1)
            }
            force = nodelist[i].p.clone()
            force.subtract(nodelist[j].p)
            force.scale(repulsionCoef / force.lengthSq())
            nodelist[i].v.add(force)
            nodelist[j].v.subtract(force)
        }
    }
    for (i = 0; i < nodelinklistlength; i++) {
        let n1 = nodelistmap.get(nodelinklist[i].source)
        let n2 = nodelistmap.get(nodelinklist[i].drain)
        let dist = n1.p.clone().subtract(n2.p)
        dist.subtract(dist.clone().norm().scale(targetLinkLength))
        dist.scale(attractionCoef)
        n2.v.add(dist)
        n1.v.subtract(dist)
    }
    for (i = 0; i < nodelistlength; i++) {
        nodelist[i].v.limit(400)
        if (nodelist[i].physics) nodelist[i].p.add(nodelist[i].v.scale(0.1))
        nodelist[i].p.x = clamp(nodelist[i].p.x, 1, cw - 1)
        nodelist[i].p.y = clamp(nodelist[i].p.y, 1, ch - 1)
    }
    updateDisplay()
}


nodelist = []
nodelistmap = new Map()
nodelinklist = []
const template = document.querySelector("#display-node-template")
// for (i = 0; i < 100; i++) {
//     if ("content" in document.createElement("template")) {
//         let clone = template.content.cloneNode(true)
//         let element = clone.querySelector('.display-node')
//         nodelist.push(new DisplayNode(cw / 2 + noise(cw / 100), ch / 2 + noise(ch / 100), element, i.toString(), true))
//         display_element.appendChild(element)
//     }
// }
for (i = 0; i < default_graph[0].length; i++) {
    if ("content" in document.createElement("template")) {
        let clone = template.content.cloneNode(true)
        let element = clone.querySelector('.display-node')
        let newdn = new DisplayNode(cw / 2 + noise(cw / 10), ch / 2 + noise(ch / 10), element, default_graph[0][i], true)
        nodelist.push(newdn)
        nodelistmap.set(newdn.id, newdn)
        display_element.appendChild(element)
    }
}
nodelist[0].physics = false
nodelist[0].p.x = 100
nodelist[0].p.y = 100
nodelist[0].updateDOMpos()
nodelist[1].physics = false
nodelist[1].p.x = cw - 100
nodelist[1].p.y = ch - 100
nodelist[1].updateDOMpos()
let fillbarStack = []
for (i = 0; i < default_graph[1].length; i++) {
    if (default_graph[1][i][0] == default_graph[1][i][1]) {
        continue
    }
    let ids = null
    let idd = null
    for (j = 0; j < nodelist.length; j++) {
        if (nodelist[j].display == default_graph[1][i][0]) {
            ids = nodelist[j].id
        }
        if (nodelist[j].display == default_graph[1][i][1]) {
            idd = nodelist[j].id
        }
    }
    if (ids !== null && idd !== null) {
        let newline = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        newline.setAttribute('marker-start', 'url(#edgebeginmarker)')
        newline.setAttribute('marker-end', 'url(#edgeendmarker)')
        newline.classList.add('connection')
        let newline2 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        newline2.classList.add('connection-fill')
        nodelinklist.push(new DisplayNodeLink(ids, idd, default_graph[1][i][2], newline, newline2))
        canvas_element.appendChild(newline)
        fillbarStack.push(newline2)
    }
}
while (fillbarStack.length > 0) {
    canvas_element.appendChild(fillbarStack.pop())
}


updatePositions()
setInterval(() => {
    if (physics) updatePositions()
}, 200);


let dragged_element = null
function onNodeDrag(ev) {
    dragged_element = ev.srcElement
    dragged_element.style.opacity = '20%'
    physics = false
}
function onNodeRelease(ev) {
    ev.preventDefault()
    dragged_element.style.opacity = '100%'
    dragged_element = null
    physics = true
}
function onNodeDrop(ev) {
    ev.preventDefault()
    for (i = 0; i < nodelist.length; i++) {
        if (nodelist[i].dom.id == dragged_element.id) {
            let dropped_node = nodelist[i]
            dropped_node.p.x = ev.clientX
            dropped_node.p.y = ev.clientY
            dropped_node.updateDOMpos()
            break
        }
    }
}
function onNodeDragover(ev) {
    ev.preventDefault()
    ev.dataTransfer.dropEffect = 'move'
}