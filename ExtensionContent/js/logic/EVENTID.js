EVENTID = {}

EVENTID.nameToId = {}
EVENTID.idToData = {}
EVENTID.eventlist = [
    { eventName: "Mk  ", eventCallback: function () { jsBridge.call_updateAllLayers() } },
    { eventName: "Dlt ", eventCallback: function () { jsBridge.call_updateAllLayers() } },
    { eventName: "move", eventCallback: function () { jsBridge.call_updateAllLayers() } }
]

EVENTID.init = function (csInterface) {
    EVENTID.csInterface = csInterface

    for (var index = 0; index < EVENTID.eventlist.length; index++) {
        var event = EVENTID.eventlist[index];
        jsBridge.callJSXFunction("EVENTID.getEventValue", { eventIndex: index, eventName: event.eventName })
    }

    EVENTID.csInterface.addEventListener("com.adobe.PhotoshopJSONCallback" + jsBridge.extensionId, EVENTID.OnCallback)

    var keyEvents = [
        { "keyCode": 13 }, //Enter
        { "keyCode": 35 }, //End
        { "keyCode": 36 }, //Home
        { "keyCode": 37 },//Left Arrow
        { "keyCode": 38 },//Up Arrow
        { "keyCode": 39 },//Right Arrow
        { "keyCode": 40 },//Down Arrow
        { "keyCode": 113 }, //F2
        { "keyCode": 106 } //*
    ]
    EVENTID.csInterface.registerKeyEventsInterest(JSON.stringify(keyEvents));
}

EVENTID.setEventValue = function (data) {
    EVENTID.nameToId[data.eventName] = data.eventValue
    EVENTID.idToData[data.eventValue] = EVENTID.eventlist[data.eventIndex]

    EVENTID.addEventListener(data)

    // ShowMsg("eventName:{0},eventId:{1},eventValue:{2}", data.eventName, data.eventId, data.eventValue)
}

EVENTID.OnCallback = function (event) {
    try {
        var data = event.data.replace("ver1,", "")
        var jsonData = JSON.parse(data)
        var eventData = EVENTID.idToData[jsonData.eventID]

        if (eventData.eventCallback) {
            eventData.eventCallback()
        }
        else {
            ShowError("未实现监听：" + eventData.eventName)
        }

        // ShowMsg("eventName:{0},eventData:{1}", eventData.eventName, jsonData.eventData)
    } catch (error) {
        ShowError(error)
    }
}

EVENTID.addEventListener = function (data) {
    // var event = new CSEvent("com.adobe.PhotoshopRegisterEvent", "APPLICATION")
    var event = new CSEvent()
    event.type = "com.adobe.PhotoshopRegisterEvent"
    event.scope = "APPLICATION"
    event.extensionId = jsBridge.extensionId
    event.data = data.eventValue.toString()
    EVENTID.csInterface.dispatchEvent(event)

    // ShowMsg("addEventListener. eventName:{0},eventValue:{1}", data.eventName, data.eventValue)
}