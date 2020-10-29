const fs = require('fs')
const execSync = require('child_process').execSync

const RunSettings = require('./../utilities/settings/run-settings')

const NO_LAYOUT_CONSTANTS = require('./../utilities/constants/no-layout-constants')
    .NO_LAYOUT_CONSTANTS
const GLOBAL_CONSTANTS = require('./../utilities/constants/files-name-constants')
    .GLOBAL_CONSTANTS
const JSON_COSTANTS = require('./../utilities/constants/files-name-constants')
    .JSON_COSTANTS
const PAJEK_CONSTANTS = require('./../utilities/constants/files-name-constants')
    .PAJEK_CONSTANTS
const CURRENT_FORMATS = require('../current-project-state/current-formats')
    .CURRENT_FORMATS

const logger = require('./../utilities/log')

const { saveInfo } = require('./../utilities/files')

function move() {
    logger.log('Start moving files to correct directory')

    logger.log('Destination directory: ' + RunSettings.getSaveFolderPath())

    //move files
    Object.keys(CURRENT_FORMATS).forEach(format => {
        fs.renameSync(
            NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
                CURRENT_FORMATS[format].graph,
            RunSettings.getSaveFolderPath() + CURRENT_FORMATS[format].graph
        )
        logger.log(
            'Moved ' +
                CURRENT_FORMATS[format].graph +
                ' for ' +
                CURRENT_FORMATS[format].name +
                ' format'
        )
    })

    //generate info
    const elemsData = countElems()
    saveInfo(
        RunSettings.getSaveFolderPath() + GLOBAL_CONSTANTS.infoFilename(),
        {
            range: RunSettings.getRange(),
            nodes_number: elemsData.nodesNumber,
            links_number: elemsData.linksNumber
        }
    )
    logger.log('Generated ' + GLOBAL_CONSTANTS.infoFilename())

    //delete temp files
    fs
        .readdirSync(NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath())
        .forEach(file =>
            fs.unlinkSync(NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() + file)
        )
    fs.rmdirSync(NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath())
    fs.unlinkSync(GLOBAL_CONSTANTS.runningFilename())
    logger.log('Delete temp files')
    logger.log('End moving files')

    function countElems() {
        const filePath =
            RunSettings.getSaveFolderPath() +
            PAJEK_CONSTANTS.pajekGraphFilename()
        const linesNumber = parseInt(execSync('wc -l < ' + filePath).toString())
        const pajekLines = 2

        const nodesNumber = parseInt(
            execSync('head -1 ' + filePath)
                .toString()
                .split(' ')[1]
        )
        const linksNumber = linesNumber - nodesNumber - pajekLines

        return {
            nodesNumber: nodesNumber,
            linksNumber: linksNumber
        }
    }
}

module.exports = {
    move
}
