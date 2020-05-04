jsBridge = {}
jsBridge.extensionId = ""
jsBridge.prefixEventName = ""


//注册方法 JSX -> JS
jsBridge.jsFuncs = [
    "jsMain.ReceiveLayerInfos",
    "jsMain.Refresh",
    "EVENTID.setEventValue",
    "jsMain.ReceiveSelectLayerData"
]


jsBridge.init = function (csInterface) {
    jsBridge.extensionId = csInterface.getExtensionID()
    jsBridge.prefixEventName = jsBridge.extensionId + "."
    jsBridge.addEventListeners(csInterface)

    jsBridge.callJSXFunction("jsxBridge.init", { extensionId: jsBridge.extensionId })
}

jsBridge.addEventListeners = function (csInterface) {
    var prefixEventName = jsBridge.prefixEventName

    for (var index = 0; index < jsBridge.jsFuncs.length; index++) {
        var funcName = jsBridge.jsFuncs[index];
        csInterface.addEventListener(prefixEventName + funcName, jsBridge.callJSFunction)
    }
}

jsBridge.callJSFunction = function (event) {
    //注意此处的 eventData 是JSON对象
    //所以 data 也是一个JSON对象，而不是一个JSON String对象
    var eventData = event.data
    var funcName = eventData.funcName
    var data = eventData.data

    var func = eval(funcName)
    if (typeof func !== "function") {
        ShowError(String.format("funcName:{0} is not a function", funcName))
        return;
    }

    try {
        if (data === undefined) func()
        else func(data)
    } catch (error) {
        ShowErrorStack(error)
    }
}

jsBridge.callJSXFunction = function (funcName, data) {
    if (funcName == undefined) {
        ShowError("funcName is null")
        return;
    }

    try {
        if (data == undefined) {
            // evalScript(String.format("{0}()", funcName))
            evalScript(String.format("jsxBridge.callJSXFunction('{0}')", funcName))
        }
        else {
            evalScript(String.format("jsxBridge.callJSXFunction('{0}','{1}')", funcName, JSON.stringify(data)))
            // evalScript(String.format("{0}('{1}')", funcName, JSON.stringify(data)))
        }
    }
    catch (error) {
        ShowErrorStack(error, "jsBridge.callJSXFunction")
    }
}

//#region Call JSX method

jsBridge.call_updateAllLayers = function () {
    jsBridge.callJSXFunction("LayerManager.UpdateAllLayers")
}

jsBridge.call_renameLayer = function (data) {
    jsBridge.callJSXFunction("LayerManager.RenameLayer", data)
}

jsBridge.call_removeLayer = function (data) {
    jsBridge.callJSXFunction("LayerManager.RemoveLayer", data)
}

jsBridge.call_addArtLayer = function (data) {
    jsBridge.callJSXFunction("LayerManager.AddLayer", data)
}

jsBridge.call_moveLayer = function (data) {
    jsBridge.callJSXFunction("LayerManager.MoveLayer", data)
}

jsBridge.call_selectLayer = function (data) {
    jsBridge.callJSXFunction("LayerManager.SelectLayer", data)
}

jsBridge.call_setLayerData = function (data) {
    jsBridge.callJSXFunction("LayerManager.SetLayerData", data)
}

jsBridge.call_getSelectLayerData = function (data) {
    jsBridge.callJSXFunction("LayerManager.GetSelectLayerData", data)
}

jsBridge.call_setLayerVisible = function (data) {
    jsBridge.callJSXFunction("LayerManager.SetLayerVisible", data)
}

//#endregion JSX method

