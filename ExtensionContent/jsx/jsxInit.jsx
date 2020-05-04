jsxInit = {}

jsxInit.rootPath = ""

jsxInit.loadFile = function (fileName) {
    var path = null
    try {
        path = jsxInit.rootPath + "/" + fileName
        $.evalFile(path)
    }
    catch (error) {
        ShowErrorStack(error, String.format("Load File Faild"))
    }
}

//[ExtensionRoot]/jsx
jsxInit.loadAll = function (rootPath) {
    var folder = new Folder(rootPath)
    jsxInit.rootPath = folder.fullName
    var loadFile = jsxInit.loadFile

    loadFile("3rd/JSON.jsx")
    loadFile("extensions.jsx")

    loadFile("logic/EVENTID.jsx")
    loadFile("logic/AnchorType.jsx")
    loadFile("logic/ComponentType.jsx")
    loadFile("logic/LayerExtensions.jsx")
    loadFile("logic/LayerManager.jsx")

    loadFile("jsxBridge.jsx")
}