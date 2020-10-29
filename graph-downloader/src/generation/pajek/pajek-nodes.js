const execSync = require('child_process').execSync

const abstractNodes = require('./../abstract/abstract-nodes')

const PAJEK_CONSTANTS = require('./../../utilities/constants/files-name-constants')
    .PAJEK_CONSTANTS
const NO_LAYOUT_CONSTANTS = require('./../../utilities/constants/no-layout-constants')
    .NO_LAYOUT_CONSTANTS

const { checkResourceExists } = require('./../../utilities/file-utils')

function pajekNodesAggregation(filePath, cb) {
    const nodesPath =
        NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
        PAJEK_CONSTANTS.pajekNodesFilename()

    var nextNodeID

    abstractNodes.nodesPath = nodesPath

    abstractNodes.nodeParser = function(line) {
        return line.split(' ')[1].replace(/"/g, '')
    }

    abstractNodes.elemToNode = function(elem) {
        const ret = nextNodeID + ' ' + '"' + elem + '"'
        nextNodeID++
        return ret
    }

    /*initialize here, if initialized outside, loaded when program start, nodesPath doesn't exist and value is alway 1
    in executons after the first is a bug*/
    nextNodeID = checkResourceExists(nodesPath)
        ? parseInt(execSync('wc -l < ' + nodesPath).toString()) + 1
        : 1

    abstractNodes.nodesAggregation(filePath, cb)
}

module.exports = {
    pajekNodesAggregation
}
