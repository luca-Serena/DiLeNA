const RunSettings = require('./../utilities/settings/run-settings')

if (!process.env.INFURA_API_KEY) {
    throw new Error('INFURA_API_KEY env variable not found')
}

if (!process.env.ETH_HOURS) {
    throw new Error('ETH_HOURS env variable not found')
}

RunSettings.setAPI(process.env.INFURA_API_KEY)
const howOftenToRun = parseInt(process.env.ETH_HOURS)

async function start() {
    const { lastBlockId } = require('./../download/blockchain/ethereum')
    const { scanBlocks } = require('./live-downloader')

    const lastBlockNumber = await lastBlockId()

    const blockRange = {
        start: lastBlockNumber - 10 * howOftenToRun,
        end: lastBlockNumber
    }

    scanBlocks(blockRange)
}

start()
