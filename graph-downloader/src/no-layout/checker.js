const fs = require('fs')

const RunSettings = require('../utilities/settings/run-settings')

const NO_LAYOUT_CONSTANTS = require('./../utilities/constants/no-layout-constants')
    .NO_LAYOUT_CONSTANTS
const GLOBAL_CONSTANTS = require('./../utilities/constants/files-name-constants')
    .GLOBAL_CONSTANTS
const CURRENT_FORMATS = require('../current-project-state/current-formats')
    .CURRENT_FORMATS

const logger = require('./../utilities/log')

const { checkResourceExists } = require('../utilities/file-utils')

function checkAll(lastBlock) {
    var lastBlockDownloaded

    const oldDownloadFormats = Object.keys(CURRENT_FORMATS).filter(key =>
        checkResourceExists(
            NO_LAYOUT_CONSTANTS.noLayoutAllPath() + CURRENT_FORMATS[key].graph
        )
    )

    if (oldDownloadFormats.length === Object.keys(CURRENT_FORMATS).length) {
        RunSettings.setOldDownload(true)
        logger.log(
            'Previous download of "all" find, download only missing data'
        )

        const info = JSON.parse(
            fs.readFileSync(
                NO_LAYOUT_CONSTANTS.noLayoutAllPath() +
                    GLOBAL_CONSTANTS.infoFilename()
            )
        )

        lastBlockDownloaded = parseInt(info.range.end)
    } else {
        lastBlockDownloaded = -1
        logger.log('No previous download of "all", split phase skipped')
    }

    return {
        start: lastBlockDownloaded + 1,
        end: lastBlock
    }
}

module.exports = {
    checkAll
}
