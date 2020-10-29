var format = 'undefined format name'

module.exports = Object.freeze({
    setFormat: (formatName) => {
        format = formatName
    },
    getFormat: () => {
        return format
    }
})
