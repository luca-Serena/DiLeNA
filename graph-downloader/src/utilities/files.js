const jsonfile = require('jsonfile')
const fs = require('fs')

const { ensureDirExists } = require('./file-utils')


var transactionStream

function dumpJSON(filepath, graph) {
    ensureDirExists(filepath)

    jsonfile.writeFileSync(filepath, graph)
}

function dumpInfo(filepath, { nodes, links }, range) {
    ensureDirExists(filepath)

    const info = {
        range,
        nodes_number: nodes.length,
        links_number: links.length
    }

    jsonfile.writeFileSync(filepath, info, { spaces: 2 })
}

function dumpPajek(filepath, { nodes, links }) {
    ensureDirExists(filepath)

    const nodesMap = new Map()
    let str = ''

    str += `*Vertices ${nodes.length}\n`
    str += nodes.reduce((acc, curr, index) => {
        nodesMap.set(curr.id, index + 1)
        return acc + `${index + 1} "${curr.id}"\n`
    }, '')
    str += '*arcs\n'
    str += links.reduce((acc, curr, index) => {
        const source = nodesMap.get(curr.source)
        const target = nodesMap.get(curr.target)
        if (!source || !target) {
            throw new Error('Source or target null')
        }
        return acc + `${source} ${target} ${curr.amount}\n`
    }, '')

    fs.writeFileSync(filepath, str)
}

function saveInfo(filepath, data) {
    ensureDirExists(filepath)

    jsonfile.writeFileSync(filepath, data, { spaces: 2 })
}

function setTransactionStream(filepath, cb) {
    ensureDirExists(filepath)

    transactionStream = fs.createWriteStream(filepath, { flags: 'a' })

    transactionStream.on('open', function() {
        cb()
    })
}

function dumpTransactions(transactions, cb) {
    var writed = 0
    if (transactions.length > 0) {
        transactions.map(e => e + '\n').forEach(e => {
            transactionStream.write(e, () => {
                writed++
                if (writed == transactions.length) {
                    cb()
                }
            })
        })
    } else {
        cb()
    }
}

module.exports = {
    dumpJSON,
    dumpInfo,
    dumpPajek,
    saveInfo,
    setTransactionStream,
    dumpTransactions,
    ensureDirExists
}
