jsxBridge = {}
jsxBridge.extensionId = ""
jsxBridge.prefixEventName = ""

var externalObjectName = "PlugPlugExternalObject";
var mylib = new ExternalObject("lib:" + externalObjectName);
var existLib = mylib != null && mylib != undefined
if (!existLib) {
    ShowError("PlugPlugExternalObject lib not found")
}

jsxBridge.existLib = existLib

jsxBridge.init = function (data) {
    jsxBridge.extensionId = data.extensionId
    jsxBridge.prefixEventName = jsxBridge.extensionId + "."
}

//注意此处的 data 是一个JSON String对象，而不是一个JSON对象
jsxBridge.callJSXFunction = function (funcName, data) {
    var func = eval(funcName)
    if (typeof func !== "function") {
        ShowError(String.format("funcName:{0} is not a function", funcName))
        return;
    }

    try {
        if (data === undefined) func()
        else func(JSON.parse(data))
    } catch (error) {
        ShowErrorStack(error)
    }
}

jsxBridge.CallJSFunction = function (funcName, data) {
    if (!jsxBridge.existLib) {
        ShowError("Fire Event Error. funcName:" + funcName)
        return;
    }

    var eventObj = new CSXSEvent();
    eventObj.type = jsxBridge.prefixEventName + funcName;
    eventObj.data = JSON.stringify({ funcName: funcName, data: data });
    eventObj.dispatch();
}