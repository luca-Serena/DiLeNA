const FormatSettings = require('./../../utilities/settings/format-settings')
const RecoverySettings = require('./../../utilities/settings/recovery-settings')

const ERRORS_MESSAGES = require('./abstract-errors').ERRORS_MESSAGES
const NO_LAYOUT_CONSTANTS = require('./../../utilities/constants/no-layout-constants')
    .NO_LAYOUT_CONSTANTS
const GENERATION_PROCESS_PHASES = require('./../../shutdown/phases')
    .GENERATION_PROCESS_PHASES

const logger = require('./../../utilities/log')

nodesAggregation = function(filepath, cb) {
    throw ERRORS_MESSAGES.functionError(
        'abstract-aggregator',
        'nodesAggregation'
    )
}

transactionsAggregation = function(filepath, cb) {
    throw ERRORS_MESSAGES.functionError(
        'abstract-aggregator',
        'transactionsAggregation'
    )
}

compose = function() {
    throw ERRORS_MESSAGES.functionError('abstract-aggregator', 'compose')
}

function aggregate() {
    const tempFilesFolderPath = NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath()
    const tempFiles = require('fs')
        .readdirSync(tempFilesFolderPath)
        .filter(file => filterFiles(file))
        .map(file => tempFilesFolderPath + file)
        .sort()

    var nextFileIndex = 0
    var currentFileIndex = -1

    logger.log(
        'Start ' +
            FormatSettings.getFormat() +
            ' nodes and transactions aggregation'
    )
    //recovery, start from last file in last mode (nodes or transactions)
    if (RecoverySettings.getCurrentReadPhase() != undefined) {
        currentFileIndex = tempFiles.indexOf(
            RecoverySettings.getCurrentFilepath()
        )
        nextFileIndex = currentFileIndex + 1
        if (
            RecoverySettings.getCurrentReadPhase() ===
            GENERATION_PROCESS_PHASES.NodesPhase()
        ) {
            nodesPhase()
        } else if (
            RecoverySettings.getCurrentReadPhase() ===
            GENERATION_PROCESS_PHASES.TransactionsPhase()
        ) {
            transactionsPhase()
        }
    } else {
        nextTempFile()
    }

    function filterFiles(file) {
        const folders = file.split('/')
        const part = folders[folders.length - 1].split('.')
        if (!isNaN(parseInt(part[0])) && part[1].localeCompare('json') == 0) {
            return true
        }
        return false
    }

    function nextTempFile() {
        if (nextFileIndex < tempFiles.length) {
            currentFileIndex = nextFileIndex
            nextFileIndex++
            nodesPhase()
        } else {
            logger.log(
                'All temp files scanned for ' +
                    FormatSettings.getFormat() +
                    ' format'
            )
            module.exports.compose()
        }
    }

    function nodesPhase() {
        module.exports.nodesAggregation(tempFiles[currentFileIndex], () => {
            transactionsPhase()
        })
    }

    function transactionsPhase() {
        module.exports.transactionsAggregation(
            tempFiles[currentFileIndex],
            () => {
                nextTempFile()
            }
        )
    }
}

module.exports = {
    nodesAggregation,
    transactionsAggregation,
    compose,
    aggregate
}
