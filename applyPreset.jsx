function applyPresetToSelectedLayers(preset){
	app.beginUndoGroup('Apply Preset to Selected Layers');	
	var selectedLayers = app.project.activeItem.selectedLayers;
	var presetPath = File(UserPresetFolderPath.fullName + "/" + preset);
	for (var i = 0; i < selectedLayers.length; i++) {
		var layer = selectedLayers[i];
		layer.applyPreset(presetPath);
		// app.applyPreset(presetPath, layer);
	}
	app.endUndoGroup();	
}