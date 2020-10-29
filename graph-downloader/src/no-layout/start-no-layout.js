const os = require('os')
const fs = require('fs')

const argv = require('named-argv')

const master = require('./../download/downloader-master')

const SpecsSettings = require('../utilities/settings/spec-settings')
const RunSettings = require('../utilities/settings/run-settings')
const RecoverySettings = require('../utilities/settings/recovery-settings')
const MainShutdown = require('../shutdown/main-shutdown')

const LOG_CONSTANTS = require('./../utilities/constants/log-constants')
    .LOG_CONSTANTS
const NO_LAYOUT_CONSTANTS = require('./../utilities/constants/no-layout-constants')
    .NO_LAYOUT_CONSTANTS
const GLOBAL_CONSTANTS = require('./../utilities/constants/files-name-constants')
    .GLOBAL_CONSTANTS
const MAIN_PROCESS_PHASES = require('./../shutdown/phases').MAIN_PROCESS_PHASES
const CURRENT_FORMATS = require('../current-project-state/current-formats')
    .CURRENT_FORMATS
const CURRENT_BLOCKCHAINS = require('../current-project-state/current-blockchain')
    .CURRENT_BLOCKCHAINS

const logger = require('./../utilities/log')

const { allToBlocks, dateToBlocks } = require('./../no-layout/date-converter')
const {
    checkResourceExists,
    ensureDirExists
} = require('../utilities/file-utils')
const { dateComparator } = require('./../utilities/date-utils')
const { checkAll } = require('./checker')
const { generate } = require('./../generation/generator-master')

MainShutdown.setShutdownBehaviour()
main()

function main() {
    const params = argv.opts

    var time = 0
    var block = 0
    var all = 0

    const types = Object.keys(CURRENT_BLOCKCHAINS).map(
        key => CURRENT_BLOCKCHAINS[key].type_name
    )

    if (params.help) {
        console.log(optionsOutput())
    } else if (params.resume) {
        if (checkResourceExists(NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath())) {
            //import saved config
            const config = JSON.parse(
                fs.readFileSync(
                    NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
                        GLOBAL_CONSTANTS.infoFilename()
                )
            )

            logger.setPath(config.logger_path)
            logger.log(
                'Resume started! previous download settings: ' +
                    config.blockchain +
                    ' ' +
                    config.requested_data
            )

            RunSettings.setBlockchain(
                CURRENT_BLOCKCHAINS[
                    Object.keys(CURRENT_BLOCKCHAINS).filter(
                        key =>
                            CURRENT_BLOCKCHAINS[key].type_name ==
                            config.blockchain
                    )
                ]
            )
            RunSettings.setSaveFolderPath(config.folder_path)
            RunSettings.setFolderName(config.folder_name)
            RunSettings.setRange(config.range)
            MainShutdown.changePhase(config.phase)
            RecoverySettings.setRequestedData(config.requested_data)

            memoryConfig()
            CPUsConfig()

            //resume
            switch (config.phase) {
                case MAIN_PROCESS_PHASES.DownloadPhase():
                    downloadPhase({
                        start: parseInt(config.missing.start),
                        end: parseInt(config.missing.end)
                    })
                    break
                case MAIN_PROCESS_PHASES.GenerationPhase():
                    generate(config.format)
                    break
            }
        } else {
            console.log('No previous download to resume!\n')
            console.log(optionsOutput())
        }
    } else if (
        params.type == CURRENT_BLOCKCHAINS.bitcoin.type_name ||
        (types.includes(params.type) && params.api != undefined)
    ) {
        memoryConfig()
        CPUsConfig() 
        RunSettings.setAPI(params.api)
        RunSettings.setBlockchain(
            CURRENT_BLOCKCHAINS[
                Object.keys(CURRENT_BLOCKCHAINS).filter(
                    key => CURRENT_BLOCKCHAINS[key].type_name == params.type
                )
            ]
        )
         
        RunSettings.getBlockchain()
            .last_block_id()
            .then(lastBlock => {
                //in this part check params and select the method to extract indexes
                if (
                    checkDateFormat(params.firstDate) &&
                    checkDateFormat(params.lastDate) &&
                    dateComparator(params.firstDate, params.lastDate) >= 0
                ) {
                    time = 1
                }
                if (
                    params.firstBlock >= 0 &&
                    params.lastBlock <= lastBlock &&
                    params.lastBlock >= params.firstBlock
                ) {
                    block = 1
                }
                if (params.all) {
                    all = 1
                }
                if (time + block + all != 1) {
                    console.log(optionsOutput())
                } else {
                    //clean old download, if i don't want it if i want to resume, pass -resume param
                    if (
                        checkResourceExists(
                            NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath()
                        )
                    ) {
                        fs
                            .readdirSync(
                                NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath()
                            )
                            .forEach(file =>
                                fs.unlinkSync(
                                    NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
                                        file
                                )
                            )
                    }
                    ensureDirExists(NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath())

                    if (time == 1) {
                        const folderName =
                            params.firstDate + '-' + params.lastDate
                        RunSettings.setFolderName(folderName)

                        RunSettings.setSaveFolderPath(
                            NO_LAYOUT_CONSTANTS.noLayoutTimePath() +
                                RunSettings.getFolderName() +
                                '/' +
                                RunSettings.getBlockchain().folder_name +
                                '/'
                        )

                        ensureDirExists(RunSettings.getSaveFolderPath())
                        RecoverySettings.setRequestedData(
                            params.firstDate + ' ' + params.lastDate
                        )

                        logger.setPath(
                            LOG_CONSTANTS.noLayoutTimeLog() +
                                RunSettings.getBlockchain().folder_name +
                                '/' +
                                RunSettings.getFolderName() +
                                '.log'
                        )
                        logger.log(
                            'Log of time type of ' +
                                params.type +
                                ' with firstDate: ' +
                                params.firstDate +
                                ' lastDate: ' +
                                params.lastDate
                        )
                        dateToBlocks({
                            firstDate: params.firstDate,
                            lastDate: params.lastDate
                        }).then(res => {
                            RunSettings.setRange(res)
                            downloadPhase(res)
                        })
                    }
                    if (block == 1) {
                        const folderName =
                            params.firstBlock + '-' + params.lastBlock

                        RunSettings.setFolderName(folderName)

                        RunSettings.setSaveFolderPath(
                            NO_LAYOUT_CONSTANTS.noLayoutBlockPath() +
                                RunSettings.getFolderName() +
                                '/' +
                                RunSettings.getBlockchain().folder_name +
                                '/'
                        )

                        ensureDirExists(RunSettings.getSaveFolderPath())

                        RecoverySettings.setRequestedData(
                            params.firstBlock + ' ' + params.lastBlock
                        )

                        logger.setPath(
                            LOG_CONSTANTS.noLayoutBlockLog() +
                                RunSettings.getBlockchain().folder_name +
                                '/' +
                                RunSettings.getFolderName() +
                                '.log'
                        )
                        logger.log(
                            'Log of block type of ' +
                                params.type +
                                'with firstBlock: ' +
                                params.firstBlock +
                                ' lastBlock: ' +
                                params.lastBlock
                        )
                        const range = {
                            start: parseInt(params.firstBlock),
                            end: parseInt(params.lastBlock)
                        }
                        RunSettings.setRange(range)
                        downloadPhase(range)
                    }
                    if (all == 1) {
                        RecoverySettings.setRequestedData('all')

                        RunSettings.setFolderName('all')

                        RunSettings.setSaveFolderPath(
                            NO_LAYOUT_CONSTANTS.noLayoutAllPath() +
                                RunSettings.getBlockchain().folder_name +
                                '/'
                        )

                        ensureDirExists(RunSettings.getSaveFolderPath())

                        logger.setPath(
                            LOG_CONSTANTS.noLayoutAllLog() +
                                RunSettings.getBlockchain().folder_name +
                                '/' +
                                RunSettings.getFolderName() +
                                '.log'
                        )
                        logger.log('Log of all type of ' + params.type)

                        allToBlocks().then(res => {
                            RunSettings.setRange(res)
                            const range = checkAll(res.end)
                            downloadPhase(range)
                        })
                    }
                }
            })
    } else {
        console.log(optionsOutput())
    }

    function optionsOutput() {
        const supportedBlockchain = Object.keys(CURRENT_BLOCKCHAINS)
            .map(key => CURRENT_BLOCKCHAINS[key].type_name)
            .join('/')

        return (
            'Choose one of these run options:\n' +
            '-help => show help list \n' +
            '-type:' +
            supportedBlockchain +
            ' -api:hex (only eth) -firstBlock:int -lastBlock:int => download transactions in range of block number\n' +
            '-type:' +
            supportedBlockchain +
            ' -api:hex (only eth) -firstDate:DD-MM-YYYY -lastDate:DD-MM-YYYY => download transactions in range of date\n' +
            '-type:' +
            supportedBlockchain +
            ' -api:hex (only eth) -all => download all transactions in blockchain\n' +
            '-type:' +
            supportedBlockchain +
            ' -api:hex (only eth) -resume => resume not completed previous download\n\n' +
            'Optional flags: \n' +
            '-memory:int => set memory used by program, number of MB, empty to max memory, no param default value(1400MB)\n\n' +
            'Note: Control params format and last greater than first\n' +
            '-cpu:int => set core used in download, number of core, empty for max num, or no param for one\n'
        )
    }

    function memoryConfig() {
        const defaultNodeMemory = 1400
        const formatsNum = Object.keys(CURRENT_FORMATS).length
        var memory = defaultNodeMemory

        if (!isNaN(parseInt(params.memory))) {
            memory = Math.ceil(parseInt(params.memory / formatsNum))
        } else if (params.memory) {
            const availableMemory = os.freemem() / 1024 / 1024
            memory = Math.ceil(availableMemory / formatsNum)
        }
        SpecsSettings.setProcessMemory(memory)
    }

    function CPUsConfig() {
        const defaultCPUs = 1
        var CPUs = defaultCPUs

        if (!isNaN(parseInt(params.cpu))) {
            CPUs = parseInt(params.cpu)
        } else if (params.cpu) {
            CPUs = os.cpus().length
        }
        SpecsSettings.setDownloadWorkers(CPUs)
    }

    function downloadPhase(blocks) {
        const workers = master(parseInt(blocks.start), parseInt(blocks.end))
        workers.startWorkers(params.api)
    }

    function checkDateFormat(date) {
        if (typeof date === 'string') {
            const parts = date.split('-').map(elem => parseInt(elem))
            if (parts[2] >= 0) {
                switch (parts[1]) {
                    case 1:
                    case 3:
                    case 5:
                    case 7:
                    case 8:
                    case 10:
                    case 12:
                        if (parts[0] <= 31) {
                            return true
                        }
                        break
                    case 2:
                        const bis = parts[2] % 4 == 0 ? 1 : 0
                        if (parts[0] <= 28 + bis) {
                            return true
                        }
                        break
                    case 4:
                    case 6:
                    case 9:
                    case 11:
                        if (parts[0] <= 30) {
                            return true
                        }
                        break
                }
            }
        }
        return false
    }
}
