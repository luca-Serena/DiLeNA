const ERRORS_MESSAGES = Object.freeze({
    functionError: (fileName, functionName) => {
        const fileString =
            fileName != undefined ? 'File: ' + fileName + ' ' : ''
        return (
            fileString +
            'error, override ' +
            functionName +
            ' function in another module'
        )
    },
    fieldError: (fileName, fieldName) => {
        const fileString =
            fileName != undefined ? 'File: ' + fileName + ' ' : ''
        return (
            fileString +
            'error, override ' +
            fieldName +
            ' field in another module'
        )
    }
})

module.exports = {
    ERRORS_MESSAGES
}
