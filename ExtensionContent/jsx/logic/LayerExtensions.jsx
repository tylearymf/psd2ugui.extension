LayerExtensions = {}
LayerExtensions.GetLayerInfos = function (layerDic, infos, layer) {
	layerDic[layer.id] = layer

	var isVisible = layer.visible
	var info = {
		id: layer.id,
		text: layer.name,
		visible: isVisible,
		// state: { checked: isVisible },
		// a_attr: {
		// 	"class": "jstree-checked"
		// },
		data: {
			layerId: layer.id,
			layerTypeName: layer.typename
		}
	}
	switch (layer.typename) {
		case "LayerSet":
			{
				var children = new Array()
				info.children = children
				for (var i = 0; i < layer.layers.length; i++) {
					LayerExtensions.GetLayerInfos(layerDic, children, layer.layers[i])
				}
			}
			break;
		case "ArtLayer":
			info.icon = "jstree-file"
			break;
	}
	infos.push(info)
}