const abstractComposer = require('./../abstract/abstract-composer')

const JSON_COSTANTS = require('./../../utilities/constants/files-name-constants')
    .JSON_COSTANTS
const NO_LAYOUT_CONSTANTS = require('./../../utilities/constants/no-layout-constants')
    .NO_LAYOUT_CONSTANTS

function compose() {
    const graphPath =
        NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
        JSON_COSTANTS.jsonGraphFilename()

    const tempPath =
        NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
        JSON_COSTANTS.jsonTempFilename()

    const nodesPath =
        NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
        JSON_COSTANTS.jsonNodesFilename()

    const transactionsPath =
        NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
        JSON_COSTANTS.jsonTransactionsFilename()

    const jsonLines = {
        open: '{"nodes":[',
        mid: '],"links":[',
        close: ']}'
    }

    var l = undefined

    abstractComposer.path = {
        graphPath: graphPath,
        tempPath: tempPath,
        nodesPath: nodesPath,
        transactionsPath: transactionsPath
    }

    abstractComposer.nodesPhaseStart = function() {
        return jsonLines.open + '\n'
    }

    abstractComposer.nodesPhaseLine = function(line, hasLast) {
        return jsonConverter(line, hasLast)
    }

    abstractComposer.nodesPhaseEnd = function() {
        return ''
    }

    abstractComposer.transactionsPhaseStart = function() {
        return '\t' + jsonLines.mid + '\n'
    }

    abstractComposer.transactionsPhaseLine = function(line, hasLast) {
        return jsonConverter(line, hasLast)
    }

    abstractComposer.transactionsPhaseEnd = function() {
        return jsonLines.close + '\n'
    }

    function jsonConverter(line, hasLast) {
        if (hasLast) {
            return '\t\t' + line + '\n'
        }
        return '\t\t' + line + ',\n'
    }

    abstractComposer.compose()
}

module.exports = {
    compose
}
