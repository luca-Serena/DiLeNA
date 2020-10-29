var processMemory = undefined
var workers = undefined

module.exports = Object.freeze({
    setProcessMemory: (memory) => {
        processMemory = memory
    },
    getProcessMemory: () => {
        return processMemory
    },
    setDownloadWorkers: (downloadWorkers) => {
        workers = downloadWorkers
    },
    getDownloadWorkers: () => {
        return workers
    }
})
