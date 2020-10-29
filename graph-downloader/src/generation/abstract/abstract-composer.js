const fs = require('fs')

const FormatSettings = require('./../../utilities/settings/format-settings')
const RecoverySettings = require('./../../utilities/settings/recovery-settings')
const GenerationShutdown = require('./../../shutdown/generation-shutdown')

const ERRORS_MESSAGES = require('./abstract-errors').ERRORS_MESSAGES
const GENERATION_PROCESS_PHASES = require('./../../shutdown/phases')
    .GENERATION_PROCESS_PHASES

const logger = require('./../../utilities/log')
const reader = require('./../reader')
const writer = require('./../writer')

const { checkResourceExists } = require('./../../utilities/file-utils')

path = {
    graphPath: ERRORS_MESSAGES.fieldError(
        'abstract-composer',
        'path.graphPath'
    ),
    tempPath: ERRORS_MESSAGES.fieldError('abstract-composer', 'path.tempPath'),
    nodesPath: ERRORS_MESSAGES.fieldError(
        'abstract-composer',
        'path.nodesPath'
    ),
    transactionsPath: ERRORS_MESSAGES.fieldError(
        'abstract-composer',
        'path.transactionsPath'
    )
}

nodesPhaseStart = function() {
    throw ERRORS_MESSAGES.functionError('abstract-composer', 'nodesPhaseStart')
}

nodesPhaseLine = function(line, hasLast) {
    throw ERRORS_MESSAGES.functionError('abstract-composer', 'nodesPhaseLine')
}

nodesPhaseEnd = function() {
    throw ERRORS_MESSAGES.functionError('abstract-composer', 'nodesPhaseEnd')
}

transactionsPhaseStart = function() {
    throw ERRORS_MESSAGES.functionError(
        'abstract-composer',
        'transactionsPhaseStart'
    )
}

transactionsPhaseLine = function(line, hasLast) {
    throw ERRORS_MESSAGES.functionError(
        'abstract-composer',
        'transactionsPhaseLine'
    )
}

transactionsPhaseEnd = function() {
    ERRORS.functionError('abstract-composer', 'transactionsPhaseEnd')
}

function compose() {
    const graphPath = module.exports.path.graphPath
    const tempPath = module.exports.path.tempPath
    const nodesPath = module.exports.path.nodesPath
    const transactionsPath = module.exports.path.transactionsPath

    var lineReader
    var tempWriter

    writer(tempPath, writer => {
        tempWriter = writer

        if (
            RecoverySettings.getCurrentReadPhase() ===
            GENERATION_PROCESS_PHASES.ComposeTransactionsPhase()
        ) {
            transactionPhase()
        } else {
            nodePhase()
        }
    })

    function nodePhase() {
        function nextPhase() {
            tempWriter.write(module.exports.nodesPhaseEnd(), () => {
                logger.log(
                    'End compact ' + FormatSettings.getFormat() + ' nodes'
                )
                transactionPhase()
            })
        }

        GenerationShutdown.changePhase(
            GENERATION_PROCESS_PHASES.ComposeNodesPhase()
        )

        var lineNumber =
            nodesPath === RecoverySettings.getCurrentFilepath() &&
            GENERATION_PROCESS_PHASES.ComposeNodesPhase() ===
                RecoverySettings.getCurrentReadPhase()
                ? RecoverySettings.getLastLine()
                : 0

        lineReader = reader(
            nodesPath,
            GENERATION_PROCESS_PHASES.ComposeNodesPhase(),
            line => {
                return line
            },
            (lines, options) => {
                function writeElem(index) {
                    if (GenerationShutdown.isRunning()) {
                        const lastLine =
                            index === lines.length - 1 ? true : false
                        const endFile =
                            options.endFile && lastLine ? true : false
                        tempWriter.write(
                            module.exports.nodesPhaseLine(
                                lines[index],
                                endFile
                            ),
                            () => {
                                lineNumber++
                                if (lastLine) {
                                    if (endFile) {
                                        nextPhase()
                                    } else {
                                        lineReader.nextLines()
                                    }
                                } else {
                                    index++
                                    writeElem(index)
                                }
                            }
                        )
                    } else {
                        GenerationShutdown.saveState(lineNumber, nodesPath)
                        GenerationShutdown.terminate()
                    }
                }

                var index = 0
                //case no transactions
                if (index == 0 && lines.length == 0) {
                    nextPhase()
                } else {
                    writeElem(index)
                }
            }
        )

        logger.log('Start compact ' + FormatSettings.getFormat() + ' nodes')
        if (lineNumber === 0) {
            tempWriter.write(module.exports.nodesPhaseStart(), () => {
                lineReader.nextLines()
            })
        } else {
            lineReader.nextLines()
        }
    }

    function transactionPhase() {
        function nextPhase() {
            tempWriter.write(module.exports.transactionsPhaseEnd(), () => {
                logger.log(
                    'End compact ' +
                        FormatSettings.getFormat() +
                        ' transactions'
                )
                if (checkResourceExists(graphPath)) {
                    fs.unlinkSync(graphPath)
                }
                fs.renameSync(tempPath, graphPath)
                //communicate to master end generation
                GenerationShutdown.onCompletedProcess()
            })
        }

        GenerationShutdown.changePhase(
            GENERATION_PROCESS_PHASES.ComposeTransactionsPhase()
        )

        var lineNumber =
            transactionsPath === RecoverySettings.getCurrentFilepath() &&
            GENERATION_PROCESS_PHASES.ComposeTransactionsPhase() ===
                RecoverySettings.getCurrentReadPhase()
                ? RecoverySettings.getLastLine()
                : 0

        lineReader = reader(
            transactionsPath,
            GENERATION_PROCESS_PHASES.ComposeTransactionsPhase(),
            line => {
                return line
            },
            (lines, options) => {
                function writeElem(index) {
                    if (GenerationShutdown.isRunning()) {
                        const lastLine =
                            index === lines.length - 1 ? true : false
                        const endFile =
                            options.endFile && lastLine ? true : false
                        tempWriter.write(
                            module.exports.transactionsPhaseLine(
                                lines[index],
                                endFile
                            ),
                            () => {
                                lineNumber++
                                if (lastLine) {
                                    if (endFile) {
                                        nextPhase()
                                    } else {
                                        lineReader.nextLines()
                                    }
                                } else {
                                    index++
                                    writeElem(index)
                                }
                            }
                        )
                    } else {
                        GenerationShutdown.saveState(
                            lineNumber,
                            transactionsPath
                        )
                        GenerationShutdown.terminate()
                    }
                }

                var index = 0
                //case no transactions
                if (index == 0 && lines.length == 0) {
                    nextPhase()
                } else {
                    writeElem(index)
                }
            }
        )

        logger.log(
            'Start compact ' + FormatSettings.getFormat() + ' transactions'
        )
        if (lineNumber === 0) {
            tempWriter.write(module.exports.transactionsPhaseStart(), () => {
                lineReader.nextLines()
            })
        } else {
            lineReader.nextLines()
        }
    }
}

module.exports = {
    path,
    nodesPhaseStart,
    nodesPhaseLine,
    nodesPhaseEnd,
    transactionsPhaseStart,
    transactionsPhaseLine,
    transactionsPhaseEnd,
    compose
}
