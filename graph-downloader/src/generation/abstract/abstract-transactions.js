const _ = require('lodash')
const RBTree = require('bintrees').RBTree

const FormatSettings = require('./../../utilities/settings/format-settings')
const RecoverySettings = require('./../../utilities/settings/recovery-settings')
const GenerationShutdown = require('./../../shutdown/generation-shutdown')

const ERRORS_MESSAGES = require('./abstract-errors').ERRORS_MESSAGES
const GENERATION_PROCESS_PHASES = require('./../../shutdown/phases')
    .GENERATION_PROCESS_PHASES

const logger = require('./../../utilities/log')
const reader = require('./../reader')
const writer = require('./../writer')

path = {
    nodesPath: ERRORS_MESSAGES.fieldError(
        'abstract-transactions',
        'path.nodesPath'
    ),
    transactionsPath: ERRORS_MESSAGES.fieldError(
        'abstract-transactions',
        'path.transactionsPath'
    )
}

nodeFileParser = function(line) {
    throw ERRORS_MESSAGES.functionError(
        'abstract-transactions',
        'nodeFileParser'
    )
}

tempFileParser = function(line) {
    throw ERRORS_MESSAGES.functionError(
        'abstract-transactions',
        'tempFileParser'
    )
}

transactionConverter = function(transaction, nodes) {
    throw ERRORS_MESSAGES.functionError(
        'abstract-transactions',
        'transactionConverter'
    )
}

function transactionsAggregation(filePath, cb) {
    GenerationShutdown.changePhase(
        GENERATION_PROCESS_PHASES.TransactionsPhase()
    )

    const nodesPath = module.exports.path.nodesPath
    const transactionsPath = module.exports.path.transactionsPath

    const tempReader = tempInitializer()

    var transactions = []
    var transactionsEnded = false
    var nodesReader
    var transactionsWriter

    var lastLine =
        filePath === RecoverySettings.getCurrentFilepath() &&
        GENERATION_PROCESS_PHASES.TransactionsPhase() ===
            RecoverySettings.getCurrentReadPhase()
            ? RecoverySettings.getLastLine()
            : 0
    var saveLine = 0

    writer(transactionsPath, writer => {
        transactionsWriter = writer
        logger.log(
            'Start ' +
                FormatSettings.getFormat() +
                ' transactions copy from ' +
                filePath
        )
        tempReader.nextLines()
    })

    function tempInitializer() {
        return reader(
            filePath,
            GENERATION_PROCESS_PHASES.TransactionsPhase(),
            module.exports.tempFileParser,
            (lines, options) => {
                transactions = lines
                lastLine += lines.length
                if (options.endFile) {
                    transactionsEnded = true
                }
                nodesReader = nodesInitializer()
                nodesReader.nextLines()
            }
        )
    }

    function nodesInitializer() {
        return reader(
            nodesPath,
            GENERATION_PROCESS_PHASES.TransactionsPhase(),
            module.exports.nodeFileParser,
            (lines, options) => {
                var nodes = new RBTree((a, b) => {
                    return a.key.localeCompare(b.key)
                })

                lines.forEach(elem => nodes.insert(elem))

                transactions = transactions.map(transaction => {
                    if (GenerationShutdown.isRunning()) {
                        return module.exports.transactionConverter(
                            transaction,
                            nodes
                        )
                    } else {
                        GenerationShutdown.saveState(saveLine, filePath)
                        GenerationShutdown.terminate()
                    }
                })

                if (options.endFile) {
                    transactionsWriter.writeArray(
                        transactions.map(line => line + '\n'),
                        () => {
                            saveLine = lastLine
                            if (transactionsEnded) {
                                logger.log(
                                    'Termanited ' +
                                        FormatSettings.getFormat() +
                                        ' transactions copy from ' +
                                        filePath
                                )
                                cb()
                            } else {
                                if (GenerationShutdown.isRunning()) {
                                    tempReader.nextLines()
                                } else {
                                    GenerationShutdown.saveState(
                                        saveLine,
                                        filePath
                                    )
                                    GenerationShutdown.terminate()
                                }
                            }
                        }
                    )
                } else {
                    nodesReader.nextLines()
                }
            }
        )
    }
}

module.exports = {
    path,
    nodeFileParser,
    tempFileParser,
    transactionConverter,
    transactionsAggregation
}
