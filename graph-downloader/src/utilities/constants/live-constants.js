const howOftenToRun = process.env.ETH_HOURS || 1
const baseFilename = () => `eth-${howOftenToRun}/${new Date().getHours()}`

const LIVE_CONSTANTS = Object.freeze({
    jsonFilename: () => `./graphs/layout/${baseFilename()}/graph.json`,
    infoFilename: () => `./graphs/layout/${baseFilename()}/info.json`,
    pajekFilename: () => `./graphs/layout/${baseFilename()}/graph.net`,
    ngraphBasePath: () => `./graphs/layout/${baseFilename()}/ngraph/`,
    logFilename: () => `./logs/layout/${baseFilename()}.log`,
    logLayoutServer: () => './logs/layout/server/'
})

module.exports = {
    LIVE_CONSTANTS
}
