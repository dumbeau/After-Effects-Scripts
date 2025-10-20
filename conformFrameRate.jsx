function conformFrameRate(frameRate){
	var selectedItems = app.project.selection;
	if (selectedItems.length == 0) {
		var selectedLayers = app.project.activeItem.selectedLayers;
		if (selectedLayers.length == 0) {
			alert("Please select some items or layers.");
			return;
		}
		for (var i = 0; i < selectedLayers.length; i++) {
			var selectedLayer = selectedLayers[i];
			selectedLayer.source.selected = true;             
		}
	}

	selectedItems = app.project.selection;
	if (selectedItems.length == 0) {
		alert("Please select some items or layers.");
		return;
	}

	for (var i = 0; i < selectedItems.length; i++) {
		var myItem = selectedItems[i];
		if (myItem instanceof FootageItem) {
			myItem.mainSource.conformFrameRate = frameRate;
		} else if (myItem instanceof CompItem){
			myItem.frameRate = frameRate;
		}
	}
}