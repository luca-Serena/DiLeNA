const ETHEREUM_CONSTANTS = Object.freeze({
    folderName: () => 'ethereum',
    argumentsName: () => 'eth',
    firstBlockDate: () => '30-07-2015'
})

const BITCOIN_CONSTANTS = Object.freeze({
    folderName: () => 'bitcoin',
    argumentsName: () => 'btc',
    firstBlockDate: () => '03-01-2009'
})

module.exports = {
    ETHEREUM_CONSTANTS,
    BITCOIN_CONSTANTS
}
