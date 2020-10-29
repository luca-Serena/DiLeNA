const fs = require('fs')

function checkResourceExists(resourcepath) {
    return fs.existsSync(resourcepath)
}

//create filepath folder if does not exist
function ensureDirExists(filepath) {
    const subdirsTokens = filepath.split('/')
    const subdirs = subdirsTokens.slice(1, subdirsTokens.length - 1)
    const directoriesFullPath = subdirs.map((_, i, a) =>
        a.slice(0, i + 1).join('/')
    )

    directoriesFullPath.forEach(directory => {
        if (!checkResourceExists(directory)) {
            fs.mkdirSync(directory)
        }
    })
}

function deleteFile(filepath) {
    if (checkResourceExists(filepath)) {
        fs.unlinkSync(filepath)
    }
}

function deleteFolder(path) {
    if (checkResourceExists(path)) {
        fs.readdirSync(path).forEach((file, index) => {
            var curPath = path + '/' + file
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolder(curPath)
            } else {
                fs.unlinkSync(curPath)
            }
        })
        fs.rmdirSync(path)
    }
}

module.exports = {
    checkResourceExists,
    ensureDirExists,
    deleteFile,
    deleteFolder
}
