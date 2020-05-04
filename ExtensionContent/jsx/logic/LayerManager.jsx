LayerManager = {}
LayerManager.allLayers = {}

LayerManager.getLayerById = function (layerId) {
	if (layerId === "#") {
		return activeDocument
	}

	return LayerManager.allLayers[layerId]
}

LayerManager.addLayer = function (layer) {
	if (layer) {
		LayerManager.allLayers[layer.id] = layer
	}
}

LayerManager.removeLayer = function (layerId) {
	LayerManager.allLayers[layerId] = null
}

LayerManager.UpdateAllLayers = function () {
	var isOpenDoc = false
	try {
		isOpenDoc = activeDocument != null
	}
	catch (error) {
		isOpenDoc = false
	}

	if (!isOpenDoc) {
		ShowWarn("psd not open")
		return
	}

	LayerManager.allLayers = {}
	var infos = new Array()
	var layers = activeDocument.layers
	for (var i = 0; i < layers.length; i++) {
		var layer = layers[i]
		LayerExtensions.GetLayerInfos(LayerManager.allLayers, infos, layer)
	}

	jsxBridge.CallJSFunction("jsMain.ReceiveLayerInfos", { activeLayerId: 0, treeData: infos })
}

LayerManager.RenameLayer = function (data) {
	var layerId = data.layerId
	var layerName = data.layerName
	var layer = LayerManager.getLayerById(layerId)

	if (layer == null) {
		ShowWarn("cannot find layer: " + layerId)
		return;
	}

	layer.name = layerName
}

LayerManager.RemoveLayer = function (data) {
	var layerId = data.layerId
	var layer = LayerManager.getLayerById(layerId)

	if (layer == null) {
		ShowWarn("cannot find layer: " + layerId)
		return;
	}

	layer.remove()
}

LayerManager.AddLayer = function (data) {
	var layerTypeName = data.layerTypeName
	var parentLayerId = data.parentLayerId
	var parentLayer = LayerManager.getLayerById(parentLayerId)
	var position = data.position
	// ShowMsg("AddLayer")

	var layers = null
	if (layerTypeName == "ArtLayer") {
		layers = parentLayer.artLayers
	}
	else if (layerTypeName == "LayerSet") {
		layers = parentLayer.layerSets
	}
	else {
		ShowError("LayerManager.AddLayer. 未实现该类型：" + layerTypeName)
	}

	var newLayer = layers.add()
	LayerManager.addLayer(newLayer)

	LayerManager.MoveLayer({
		layerId: newLayer.id,
		parentLayerId: parentLayerId,
		position: position,
	})

	LayerManager.UpdateAllLayers()
}

LayerManager.MoveLayer = function (data) {
	var layerId = data.layerId
	var parentLayerId = data.parentLayerId
	var position = data.position
	var oldPosition = data.oldPosition

	var fromLayer = LayerManager.getLayerById(layerId)
	var parentLayer = LayerManager.getLayerById(parentLayerId)
	var fromLayerTypeName = fromLayer.typename
	var parentLayerTypeName = parentLayer.typename
	var toLayer = null
	var elementPlacement = null
	var tempLayer = null

	assert(parentLayer.layers, "parentLayer.layers is undefined")

	var isSameSet = false
	for (var index = 0; index < parentLayer.layers.length; index++) {
		var element = parentLayer.layers[index];
		if (element.id == layerId) {
			isSameSet = true
			break;
		}
	}

	if (isSameSet) {
		toLayer = parentLayer.layers[position]
		//(图层/组)->最后一个是组的情况有Bug
		if (toLayer.typename == "LayerSet" && position == parentLayer.layers.length - 1) {
			//图层->最后一个是组的情况有Bug
			if (fromLayerTypeName == "ArtLayer") {
				toLayer = parentLayer
				elementPlacement = ElementPlacement.PLACEATEND
			}
			else if (fromLayerTypeName == "LayerSet") {
				tempLayer = parentLayer.artLayers.add()
				tempLayer.name = "TEMP"
				LayerManager.internal_MoveLayer(tempLayer, parentLayer, ElementPlacement.PLACEATEND)

				toLayer = tempLayer
				elementPlacement = ElementPlacement.PLACEAFTER
			}
		}
		else if (position > oldPosition) {
			elementPlacement = ElementPlacement.PLACEAFTER
		}
		else if (position < oldPosition) {
			elementPlacement = ElementPlacement.PLACEBEFORE
		}
		else {
			return;
		}
	} else {
		//优化图层->组
		if (parentLayer.layers.length == 0 && fromLayerTypeName == "ArtLayer" && parentLayerTypeName == "LayerSet") {
			toLayer = parentLayer
			elementPlacement = ElementPlacement.INSIDE
		}
		else {
			if (parentLayer.layers.length == 0) {
				tempLayer = parentLayer.artLayers.add()
				tempLayer.name = "TEMP"
			}

			if (position < parentLayer.layers.length) {
				toLayer = parentLayer.layers[position]
				elementPlacement = ElementPlacement.PLACEBEFORE
			}
			else if (position == parentLayer.layers.length) {
				toLayer = parentLayer.layers[position - 1]

				//(图层/组)->最后一个是组的情况有Bug
				if (toLayer.typename == "LayerSet") {
					//图层->最后一个是组的情况有Bug
					if (fromLayerTypeName == "ArtLayer") {
						toLayer = parentLayer
						elementPlacement = ElementPlacement.PLACEATEND
					}
					else if (fromLayerTypeName == "LayerSet") {
						tempLayer = parentLayer.artLayers.add()
						tempLayer.name = "TEMP"
						LayerManager.internal_MoveLayer(tempLayer, parentLayer, ElementPlacement.PLACEATEND)

						toLayer = tempLayer
						elementPlacement = ElementPlacement.PLACEAFTER
					}
				}
				else {
					elementPlacement = ElementPlacement.PLACEAFTER
				}
			}
		}
	}

	assert(fromLayer, "fromLayer is undefined")
	assert(toLayer, "toLayer is undefined")
	assert(elementPlacement, "elementPlacement is undefined")

	// ShowMsg("MoveLayer. fromeLayer:{0} toLayer:{1} elementPlacement:{2}",
	// fromLayer.name, toLayer.name, elementPlacement)

	LayerManager.internal_MoveLayer(fromLayer, toLayer, elementPlacement,
		function () {
			if (tempLayer != null) {
				tempLayer.remove()
			}
		})
}

//ElementPlacement.INSIDE
//ElementPlacement.PLACEATBEGINNING
//ElementPlacement.PLACEATEND
//ElementPlacement.PLACEBEFORE
//ElementPlacement.PLACEAFTER
LayerManager.internal_MoveLayer = function (fromLayer, toLayer, elementPlacement, callback) {
	assert(fromLayer, "fromLayer is undefined")
	assert(toLayer, "toLayer is undefined")
	assert(elementPlacement, "elementPlacement is undefined")

	// ShowMsg("internal_MoveLayer from:{0} to:{1} elementPlacement:{2} fromeType:{3} toType:{4}",
	// 	fromLayer.name, toLayer.name, elementPlacement, fromLayer.typename, toLayer.typename)

	fromLayer.move(toLayer, elementPlacement)

	if (callback) callback()
}

LayerManager.SelectLayer = function (data) {
	var layerId = data.layerId

	// ShowMsg("select layer:{0}", layerId)
	var layer = LayerManager.getLayerById(layerId)

	assert(layer, "layer is undefined")
	activeDocument.activeLayer = layer
}

LayerManager.SetLayerData = function (data) {
	var selectLayerIds = data.selectLayerIds
	if (!selectLayerIds || selectLayerIds.length == 0) return;

	if (data.fullAnchorType) {
		data.anchorType = AnchorType[data.fullAnchorType] || ""
	}
	if (data.fullNodeType) {
		data.nodeType = ComponentType[data.fullNodeType] || ""
	}

	for (var i = 0; i < selectLayerIds.length; i++) {
		var layerId = selectLayerIds[i];
		var layer = LayerManager.getLayerById(layerId)
		LayerManager.internal_SetLayerData(layer, data)
	}
}

LayerManager.GetSelectLayerData = function (data) {
	var selectLayerIds = data.selectLayerIds
	if (!selectLayerIds || selectLayerIds.length == 0) return;

	var layerData = new Array()
	for (var i = 0; i < selectLayerIds.length; i++) {
		var layerId = selectLayerIds[i];
		var layer = LayerManager.getLayerById(layerId)
		var data = LayerManager.internal_GetLayerData(layer)
		layerData.push(data)
	}

	jsxBridge.CallJSFunction("jsMain.ReceiveSelectLayerData", layerData)
}

LayerManager.internal_SetLayerData = function (layer, data) {
	if (!layer) return;
	var layerData = LayerManager.internal_GetLayerData(layer)

	var exportName = layerData.exportName
	if (data.exportName || data.exportName == "") exportName = data.exportName
	var symbolType = layerData.symbolType
	if (data.symbolType || data.symbolType == "") symbolType = data.symbolType
	var nodeName = layerData.nodeName
	if (data.nodeName || data.nodeName == "") nodeName = data.nodeName
	var nodeType = layerData.nodeType
	if (data.nodeType || data.nodeType == "") nodeType = data.nodeType
	var anchorType = layerData.anchorType
	if (data.anchorType || data.anchorType == "") anchorType = data.anchorType
	var nodeArguments = layerData.nodeArguments
	if (data.nodeArguments) nodeArguments = data.nodeArguments

	//缺省值
	if (nodeType == "") nodeType = ComponentType.PANEL
	if (anchorType == "") anchorType = AnchorType.CENTER

	var name = exportName + symbolType + nodeName + "_" + nodeType + "_" + anchorType
	if (nodeArguments) {
		for (var i = 0; i < nodeArguments.length; i++) {
			var arg = nodeArguments[i];
			name = name + "_" + arg
		}
	}

	layer.name = name
	LayerManager.UpdateAllLayers()
}

LayerManager.internal_GetLayerData = function (layer) {
	var fullName = layer.name
	var nameSplits = fullName.split(/@|#/)
	var firstName = nameSplits.length == 2 ? nameSplits[0] : ""
	var secondName = nameSplits.length == 2 ? nameSplits[1] : ""
	var isCommon = firstName.indexOf("common_") == 0

	var exportName = firstName
	var symbolType = ""
	var nodeName = ""
	var nodeType = ""
	var fullNodeType = ""
	var anchorType = ""
	var fullAnchorType = ""
	var nodeArguments = null

	if (fullName.indexOf("@") != -1) {
		symbolType = "@"
	}
	else if (fullName.indexOf("#") != -1) {
		symbolType = "#"
	}

	if (secondName != "") {
		nodeArguments = secondName.split("_")
		nodeName = nodeArguments[0]

		if (nodeArguments.length > 1) {
			var tempNodeType = nodeArguments[1]

			for (var key in ComponentType) {
				if (ComponentType[key] == tempNodeType) {
					nodeType = tempNodeType
					fullNodeType = key
					break;
				}
			}
		}
		var spliceCount = 2

		if (nodeArguments.length > 2) {
			var tempAnchorType = nodeArguments[2]

			for (var key in AnchorType) {
				var value = AnchorType[key]
				if (value == tempAnchorType) {
					anchorType = tempAnchorType
					fullAnchorType = key.toString()
					break;
				}
			}

			if (anchorType != "") {
				spliceCount = 3
			}
		}
		//去除前x个数据
		nodeArguments.splice(0, spliceCount)
	}

	//缺省值
	if (exportName == "") {
		exportName = "TEMP"
	}
	if (symbolType == "") {
		symbolType = "@"
	}
	if (nodeName == "") {
		nodeName = layer.name
	}

	return {
		layerId: layer.id,
		isCommon: isCommon,
		exportName: exportName,
		symbolType: symbolType,
		nodeName: nodeName,
		nodeType: nodeType,
		fullNodeType: fullNodeType,
		anchorType: anchorType,
		fullAnchorType: fullAnchorType,
		nodeArguments: nodeArguments
	}
}

LayerManager.SetLayerVisible = function (data) {
	var layerId = data.layerId
	var visible = data.visible

	var layer = LayerManager.getLayerById(layerId)
	if (!layer) return;

	layer.visible = visible
}