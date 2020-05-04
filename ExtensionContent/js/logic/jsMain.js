jsMain = {}
jsMain.currentSelectLayerId = null
$.blockCheckEvent = false

//#region 与 JSX 交互的方法

jsMain.ReceiveLayerInfos = function (data) {
    jsMain.treeData = data.treeData
    jsMain.Refresh(data.activeLayerId)

    var checkLayerIds = new Array()
    for (var i = 0; i < data.treeData.length; i++) {
        var info = data.treeData[i];
        jsMain.internal_getVisibleIds(checkLayerIds, info)
    }

    $.blockCheckEvent = true
    setTimeout(function () {
        var jstree = $('#ps_tree').jstree(true)

        jstree.uncheck_all()
        jstree.check_node(checkLayerIds)
        setTimeout(function () {
            $.blockCheckEvent = false
        }, 1000)
    }, 1000)
}

jsMain.internal_getVisibleIds = function (list, info) {
    if (!info) return;

    if (info.visible) {
        list.push(info.id.toString())
    }

    if (info.children && info.children.length > 0) {
        for (var i = 0; i < info.children.length; i++) {
            var child = info.children[i];
            jsMain.internal_getVisibleIds(list, child)
        }
    }
}

jsMain.Refresh = function (activeLayerId) {
    jsMain.currentSelectLayerId = activeLayerId

    var jstree = $('#ps_tree').jstree(true)
    jstree.refresh()
}

jsMain.ReselectLayer = function () {
    // var activeLayerId = jsMain.currentSelectLayerId
    // if (typeof activeLayerId == "number") {
    //     var jstree = $('#ps_tree').jstree(true)
    //     jstree.select_node(activeLayerId.toString())
    // }
}

jsMain.ReceiveSelectLayerData = function (data) {
    var isMultiSelect = data.length > 1
    var exportName = "------"
    var isCommon = false
    var symbolType = ""
    var nodeName = "------"
    var nodeArguments = ""

    if (!isMultiSelect) {
        var singleData = data[0]

        exportName = singleData.exportName
        isCommon = singleData.isCommon
        symbolType = singleData.symbolType
        nodeName = singleData.nodeName

        if (singleData.nodeArguments) {
            nodeArguments = singleData.nodeArguments.join("_")
        }
    }

    $("#exportNameInput").val(exportName)
    $("#commonCheckbox").prop("checked", isCommon)
    $("#symbolRadio1").prop("checked", symbolType == "@")
    $("#symbolRadio2").prop("checked", symbolType == "#")
    $("#nodeNameInput").val(nodeName)
    $("#argumentsInput").val(nodeArguments)


    //Clear Select Node Type
    var nodeTypeChildren = $("#nodeTypeDiv").children()
    for (var i = 0; i < nodeTypeChildren.length; i++) {
        var child = $(nodeTypeChildren[i]);
        child.removeClass("active")
    }

    //Clear Select Anchor Type
    var anchorTypeChildren = $("#anchorTypeDiv").children()
    for (var i = 0; i < anchorTypeChildren.length; i++) {
        var child = $(anchorTypeChildren[i]);
        child.removeClass("active")
    }

    //Select Node、Anchor Type
    for (var i = 0; i < data.length; i++) {
        var layerData = data[i];

        var fullNodeType = layerData.fullNodeType
        if (fullNodeType && fullNodeType != "") {
            $("#nodeTypeDiv").find("#" + fullNodeType).addClass("active")
        }

        var fullAnchorType = layerData.fullAnchorType
        if (fullAnchorType && fullAnchorType != "") {
            $("#anchorTypeDiv").find("#" + fullAnchorType).addClass("active")
        }
    }
}

//#endregion 与 JSX 交互的方法

jsMain.getTreeData = function () {
    return jsMain.treeData
}