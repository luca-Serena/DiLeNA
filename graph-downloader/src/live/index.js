const schedule = require('node-schedule')

const logger = require('./../utilities/log')
const LIVE_CONSTANTS = require('./../utilities/constants/live-constants')
    .LIVE_CONSTANTS

const RunSettings = require('./../utilities/settings/run-settings')

logger.setPath(LIVE_CONSTANTS.logFilename())

if (!process.env.INFURA_API_KEY) {
    throw new Error('INFURA_API_KEY env variable not found')
}

if (!process.env.ETH_HOURS) {
    throw new Error('ETH_HOURS env variable not found')
}

RunSettings.setAPI(process.env.INFURA_API_KEY)
const howOftenToRun = parseInt(process.env.ETH_HOURS)

const recurrenceRule = new schedule.RecurrenceRule()
recurrenceRule.hour = Array(Math.ceil(24 / howOftenToRun))
    .fill(1)
    .map((one, index) => index * howOftenToRun)
recurrenceRule.minute = 0

async function start() {
    const { lastBlockId } = require('./../download/blockchain/ethereum')
    const { scanBlocks } = require('./live-downloader')

    const lastBlockNumber = await lastBlockId()

    const blockRange = {
        start: lastBlockNumber - 240 * howOftenToRun,
        end: lastBlockNumber
    }

    scanBlocks(blockRange)
}

schedule.scheduleJob(recurrenceRule, start)
