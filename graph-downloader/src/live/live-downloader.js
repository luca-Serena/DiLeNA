const _ = require('lodash')
const saveGraph = require('ngraph.tobinary')

const LIVE_CONSTANTS = require('../utilities/constants/live-constants')
    .LIVE_CONSTANTS

const calculateNgraphLayout = require('./ngraph-layout')
const logger = require('../utilities/log')

const { getTransactions } = require('../download/blockchain/ethereum')
const { ensureDirExists } = require('../utilities/file-utils')
const { dumpJSON, dumpPajek, dumpInfo } = require('../utilities/files')





//used from live download
async function scanBlocks(range, doLayout = true) {
    logger.log('Retrieving transactions...')
    //create an array, size = end - start
    const blocksIndexes = Array(range.end - range.start)
        .fill(1)
        .map((one, index) => range.start + one + (index - 1))

    //divide array in chunck of 240 elems
    const blocksIndexesAtATime = _.chunk(blocksIndexes, 240)

    var transactions = []
    for (let i = 0; i < blocksIndexesAtATime.length; i++) {
        const blocksIndexes = blocksIndexesAtATime[i]
        const blocksTransactions = await getTransactions(blocksIndexes)

        transactions.push(blocksTransactions)
    }

    //convert transaction from json string to obj
    transactions = _.flattenDeep(transactions).map(t => JSON.parse(t))

    logger.log('Processing nodes...')

    //get source and target from stransactions and merge them
    const sourceIds = transactions.map(t => t.source)
    const targetIds = transactions.map(t => t.target)
    const nodeIds = _.uniq(_.compact(_.union(sourceIds, targetIds)))

    const nodes = nodeIds.map(id => ({ id }))

    logger.log('Calculating layout...')

    const graph = { nodes, links: transactions }

    if (doLayout) {
        const ngraphOutDirPath = LIVE_CONSTANTS.ngraphBasePath()
        ensureDirExists(ngraphOutDirPath)
        const ngraph = await calculateNgraphLayout(graph, ngraphOutDirPath)

        saveGraph(ngraph, {
            outDir: ngraphOutDirPath,
            labels: `labels.json`,
            meta: `meta.json`,
            links: `links.bin`
        })
    }

    logger.log('Exporting the graph to JSON...')

    dumpJSON(LIVE_CONSTANTS.jsonFilename(), graph)

    logger.log('Export the graph infos...')

    dumpInfo(LIVE_CONSTANTS.infoFilename(), graph, range)

    logger.log('Exporting the graph to Pajek...')

    dumpPajek(LIVE_CONSTANTS.pajekFilename(), graph)

    logger.log('Finished, cya')
}

module.exports = {
    scanBlocks
}
