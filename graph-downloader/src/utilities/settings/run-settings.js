var saveFolderPath = undefined
var folderName = undefined
var range = undefined
var oldDownload = false
var blockchain = undefined
var api = undefined

module.exports = Object.freeze({
    setSaveFolderPath: (path) => {
        saveFolderPath = path
    },
    getSaveFolderPath: () => {
        return saveFolderPath
    },
    setFolderName: (name) => {
        folderName = name
    },
    getFolderName: () => {
        return folderName
    },
    setRange: r => {
        range = r
    },
    getRange: () => {
        return range
    },
    setOldDownload: (oldDwn) => {
        oldDownload = oldDwn
    },
    getOldDownload: () => {
        return oldDownload
    },
    setAPI: blokchcainAPI => {
        api = blokchcainAPI
    },
    getAPI: () => {
        return api
    },
    setBlockchain: blokchcainType => {
        blockchain = blokchcainType
    },
    getBlockchain: () => {
        return blockchain
    }
})
