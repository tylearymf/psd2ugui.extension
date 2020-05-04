EVENTID = {}

EVENTID.getEventValue = function (data) {
    var eventIndex = data.eventIndex
    var eventName = data.eventName
    data.eventValue = -1

    try {
        data.eventValue = charIDToTypeID(eventName)
    } catch (error) {
        ShowError(error)
    }
    jsxBridge.CallJSFunction("EVENTID.setEventValue", data)

    // ShowMsg("eventIndex:{0},eventName:{1},eventValue:{2}", eventIndex, eventName, data.eventValue)
}