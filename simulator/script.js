const gravityCoef = 1.1
const repulsionCoef = 10000.0
const attractionCoef = 0.3
const targetLinkLength = 250

const display_element = document.getElementById('display')
// const canvas_element = document.getElementById('canvas')
const canvas_element_a = document.getElementById('canvas-arrow')
const canvas_element_f = document.getElementById('canvas-flow')
const canvas_element_p = document.getElementById('canvas-path')
const canvas_element_t = document.getElementById('canvas-text')
let cw = null, ch = null

const algorithm_result = document.getElementById('algorithm-result')
const algorithm_result_mf = document.getElementById('algorithm-result-mf')

let physics = true

function updateDBCR() {
    let dbcr = display_element.getBoundingClientRect()
    cw = dbcr.width
    ch = dbcr.height
}
updateDBCR()

let nodelist = []
let nodelistmap = new Map()
let nodelinklist = []

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


const template = document.querySelector("#display-node-template")
function generateNodes(graphdata) {
    display_element.replaceChildren()
    canvas_element_a.replaceChildren()
    canvas_element_f.replaceChildren()
    canvas_element_p.replaceChildren()
    canvas_element_t.replaceChildren()
    nodelist = []
    nodelistmap = new Map()
    nodelinklist = []
    for (i = 0; i < graphdata[0].length; i++) {
        if ("content" in document.createElement("template")) {
            let clone = template.content.cloneNode(true)
            let element = clone.querySelector('.display-node')
            let newdn = new DisplayNode(cw / 2 + noise(cw / 10), ch / 2 + noise(ch / 10), element, graphdata[0][i], true)
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
    for (i = 0; i < graphdata[1].length; i++) {
        if (graphdata[1][i][0] == graphdata[1][i][1]) {
            continue
        }
        let ids = null
        let idd = null
        for (j = 0; j < nodelist.length; j++) {
            if (nodelist[j].display == graphdata[1][i][0]) {
                ids = nodelist[j].id
            }
            if (nodelist[j].display == graphdata[1][i][1]) {
                idd = nodelist[j].id
            }
        }
        if (ids !== null && idd !== null) {
            let newline = document.createElementNS('http://www.w3.org/2000/svg', 'line')
            newline.setAttribute('marker-end', 'url(#edgeendmarker)')
            newline.classList.add('connection')
            let newline2 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
            newline2.classList.add('connection-fill')
            let newline3 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
            let newline4 = document.createElementNS('http://www.w3.org/2000/svg', 'textPath')
            let newline5 = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            newline5.appendChild(newline4)
            newline5.setAttribute('dy', '-16px')
            newline4.setAttribute('text-anchor', 'middle')
            newline4.setAttribute('startOffset', '50%')
            nodelinklist.push(new DisplayNodeLink(ids, idd, graphdata[1][i][2], newline, newline2, newline3, newline4))
            canvas_element_a.appendChild(newline)
            canvas_element_f.appendChild(newline2)
            canvas_element_p.appendChild(newline3)
            canvas_element_t.appendChild(newline5)
        }
    }
}



generateNodes(default_graph)

updatePositions()
setInterval(() => {
    if (physics) updatePositions()
}, 100);


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

function onRunAlgorithm(ev) {
    graphdata = [[], []]
    for (i = 0; i < nodelist.length; i++) {
        graphdata[0].push(nodelist[i].id)
    }
    for (i = 0; i < nodelinklist.length; i++) {
        graphdata[1].push([nodelinklist[i].source, nodelinklist[i].drain, nodelinklist[i].capacity])
    }
    let res = max_flow(graphdata)
    for (i = 0; i < nodelinklist.length; i++) {
        nodelinklist[i].flow = res.G[nodelinklist[i].drain].filter(e => nodelinklist[i].source == e.to)[0].cap
    }
    algorithm_result_mf.innerText = res.maxFlow
    algorithm_result.style.removeProperty('display')
}
function onClearResult(ev) {
    for (i = 0; i < nodelinklist.length; i++) {
        nodelinklist[i].flow = 0
    }
    algorithm_result_mf.innerText = null
    algorithm_result.style.display = 'none'
}
function onImportGraph(ev) {
    let graphdata = prompt('Paste graph data here')
    if (isJsonString(graphdata)) {
        onClearResult()
        generateNodes(JSON.parse(graphdata))
    } else {
        alert('Invalid JSON! No graph imported')
    }
}