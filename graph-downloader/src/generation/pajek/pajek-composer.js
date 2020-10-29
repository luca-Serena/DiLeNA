const execSync = require('child_process').execSync

const abstractComposer = require('./../abstract/abstract-composer')

const PAJEK_CONSTANTS = require('./../../utilities/constants/files-name-constants')
    .PAJEK_CONSTANTS
const NO_LAYOUT_CONSTANTS = require('./../../utilities/constants/no-layout-constants')
    .NO_LAYOUT_CONSTANTS

function compose() {
    const graphPath =
        NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
        PAJEK_CONSTANTS.pajekGraphFilename()

    const tempPath =
        NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
        PAJEK_CONSTANTS.pajekTempFilename()

    const nodesPath =
        NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
        PAJEK_CONSTANTS.pajekNodesFilename()

    const transactionsPath =
        NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
        PAJEK_CONSTANTS.pajekTransactionsFilename()

    const pajekLines = {
        vertices: '*Vertices ' + execSync('wc -l < ' + nodesPath),
        arcs: '*arcs'
    }

    abstractComposer.path = {
        graphPath: graphPath,
        tempPath: tempPath,
        nodesPath: nodesPath,
        transactionsPath: transactionsPath
    }

    abstractComposer.nodesPhaseStart = function() {
        return pajekLines.vertices
    }

    abstractComposer.nodesPhaseLine = function(line, hasLast) {
        return writableLine(line)
    }

    abstractComposer.nodesPhaseEnd = function() {
        return ''
    }

    abstractComposer.transactionsPhaseStart = function() {
        return pajekLines.arcs + '\n'
    }

    abstractComposer.transactionsPhaseLine = function(line, hasLast) {
        return writableLine(line)
    }

    abstractComposer.transactionsPhaseEnd = function() {
        return ''
    }

    function writableLine(line) {
        return line + '\n'
    }

    abstractComposer.compose()
}

module.exports = {
    compose
}
