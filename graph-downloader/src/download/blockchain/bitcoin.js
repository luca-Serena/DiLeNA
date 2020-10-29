const execSync = require('child_process').execSync

const { timestampToDate } = require('./../../utilities/date-utils')

async function lastBlockId() {
    function last() {
        try {
            return JSON.parse(
                execSync(
                    'curl -s https://blockchain.info/latestblock'
                ).toString()
            )
        } catch (err) {
            return last()
        }
    }

    return last().height
}

async function getBlockTime(blockId) {
    function getBlock() {
        try {
            return JSON.parse(
                execSync(
                    'curl -s https://blockchain.info/block-height/' +
                        blockId +
                        '?format=json'
                ).toString()
            )
        } catch (err) {
            return getBlock()
        }
    }

    return timestampToDate(getBlock().blocks[0].time)
}

async function getTransactions(blocksIndexes) {
    const SATOSHI_VALUE = 100000000
    const transactions = []

    function download(bid) {
        try {
            const bs = JSON.parse(
                execSync(
                    'curl -s https://blockchain.info/block-height/' +
                        bid +
                        '?format=json'
                ).toString()
            )

            bs.blocks.forEach(block => {
                block.tx.forEach(t => {
                    const inputs = []
                    const outputs = []

                    var total = 0

                    t.inputs.forEach(i => {
                        if (
                            i.prev_out != undefined &&
                            i.prev_out.addr != undefined
                        ) {
                            inputs.push({
                                address: i.prev_out.addr,
                                amount: i.prev_out.value
                            })
                            total += i.prev_out.value
                        }
                    })
                    t.out.forEach(o => {
                        if (o.addr != undefined) {
                            outputs.push({ address: o.addr, amount: o.value })
                        }
                    })

                    inputs.forEach(i => {
                        outputs.forEach(o => {
                            const e = {
                                source: i.address,
                                target: o.address,
                                amount:
                                    i.amount / total * o.amount / SATOSHI_VALUE
                            }
                            transactions.push(JSON.stringify(e))
                        })
                    })
                })
            })
        } catch (err) {
            download(bid)
        }
    }

    blocksIndexes.forEach(bid => {
        download(bid)
    })

    return transactions
}

module.exports = {
    lastBlockId,
    getBlockTime,
    getTransactions
}
