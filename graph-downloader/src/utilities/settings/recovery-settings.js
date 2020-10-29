var requestedData = undefined
var lastLine = 0
var currentFilepath = undefined
var currentReadPhase = undefined

module.exports = Object.freeze({
    setRequestedData: (data) => {
        requestedData = data
    },
    getRequestedData: () => {
        return requestedData
    },
    setLastLine: (last) => {
        lastLine = last
    },
    getLastLine: () => {
        return lastLine
    },
    setCurrentFilepath: (filepath) => {
        currentFilepath = filepath
    },
    getCurrentFilepath: () => {
        return currentFilepath
    },
    setCurrentReadPhase: (phase) => {
        currentReadPhase = phase
    },
    getCurrentReadPhase: () => {
        return currentReadPhase
    }
})
