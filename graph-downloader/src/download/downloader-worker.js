const _ = require('lodash')

const DownloadWorkerShutdown = require('./../shutdown/download-worker-shutdown')

const GLOBAL_PROCESS_COMMAND = require('./../utilities/process')
    .GLOBAL_PROCESS_COMMAND
const DOWNLOAD_PROCESS_COMMAND = require('./../utilities/process')
    .DOWNLOAD_PROCESS_COMMAND
const RunSettings = require('./../utilities/settings/run-settings')
const CURRENT_BLOCKCHAINS = require('./../current-project-state/current-blockchain')
    .CURRENT_BLOCKCHAINS

const logger = require('./../utilities/log')

const {
    setTransactionStream,
    dumpTransactions
} = require('./../utilities/files')
const { sendMessage } = require('./../utilities/process')

process.on('message', function(message) {
    switch (message.command) {
        case DOWNLOAD_PROCESS_COMMAND.configCommand():
            DownloadWorkerShutdown.setShutdownBehaviour()

            RunSettings.setAPI(message.data.api)
            RunSettings.setBlockchain(
                CURRENT_BLOCKCHAINS[
                    Object.keys(CURRENT_BLOCKCHAINS).filter(
                        key =>
                            CURRENT_BLOCKCHAINS[key].type_name ==
                            message.data.blockchain_type
                    )
                ]
            )

            setTransactionStream(message.data.filename, () => {
                sendMessage(DOWNLOAD_PROCESS_COMMAND.newTaskCommand(), {
                    config: true
                })
            })
            break
        case DOWNLOAD_PROCESS_COMMAND.newTaskCommand():
            if (DownloadWorkerShutdown.isRunning()) {
                RunSettings.getBlockchain()
                    .get_transactions(message.data.task)
                    .then(block_array => {
                        dumpTransactions(block_array, () =>
                            sendMessage(
                                DOWNLOAD_PROCESS_COMMAND.newTaskCommand(),
                                { config: false }
                            )
                        )
                    })
            } else {
                sendMessage(GLOBAL_PROCESS_COMMAND.stoppedCommand())
                DownloadWorkerShutdown.terminate()
            }
            break
        case GLOBAL_PROCESS_COMMAND.endCommand():
            DownloadWorkerShutdown.terminate()
            break
        default:
            logger.error(
                '[child ' +
                    process.pid +
                    '] received wrong command + ' +
                    message.command
            )
    }
})
