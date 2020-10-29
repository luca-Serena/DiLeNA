const abstractNodes = require('./../abstract/abstract-nodes')

const JSON_COSTANTS = require('./../../utilities/constants/files-name-constants')
    .JSON_COSTANTS
const NO_LAYOUT_CONSTANTS = require('./../../utilities/constants/no-layout-constants')
    .NO_LAYOUT_CONSTANTS

function jsonNodesAggregation(filePath, cb) {
    abstractNodes.nodesPath =
        NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
        JSON_COSTANTS.jsonNodesFilename()

    abstractNodes.nodeParser = function(line) {
        const e = JSON.parse(line)
        return [e.id]
    }

    abstractNodes.elemToNode = function(elem) {
        const jsonData = {}
        jsonData['id'] = elem
        return JSON.stringify(jsonData)
    }

    abstractNodes.nodesAggregation(filePath, cb)
}

module.exports = {
    jsonNodesAggregation
}
