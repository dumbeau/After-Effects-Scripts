(function() {

function labelMarkersOnSelectedLayer(){
	app.beginUndoGroup('Label Scene Markers on Layer');
    // Get the active composition and the selected layer
	var comp = app.project.activeItem;
	var layer = comp.selectedLayers[0];

	// Check if the layer has any markers
	if (layer.marker.numKeys > 0) {
	// Prompt the user to enter the starting number
	var userInput = prompt("Enter the starting number for the labels:", "01");

	//Separate text component and number component from user input as strings
	var textComponent = userInput.match(/[^\d]+/g);
	if (textComponent == null){
		textComponent = "";
	} else {
		textComponent = textComponent[0];	
	}
	var numberString = userInput.match(/[0-9]+/g);
	if (numberString == null){
		numberString = "1";
	} else {
		numberString = numberString[0];
	}
	var numDigits = numberString.length; 
	// Convert the number string to an integer, remove leading zeros if any
	var startNum = parseInt(numberString);

	// Loop through all the markers in the work area!!! and assign them a label		
	for (var i = 1; i <= layer.marker.numKeys; i++) {
		// Get the current marker
		var marker = layer.marker.keyValue(i);
		if(marker.comment != ""){continue;}
		// Create a new marker with the same properties but a different comment
		var newMarker = new MarkerValue(textComponent + pad(startNum + i - 1, numberString.length));
		newMarker.duration = marker.duration;
		newMarker.chapter = marker.chapter;
		newMarker.cuePointName = marker.cuePointName;
		newMarker.eventCuePoint = marker.eventCuePoint;
		newMarker.url = marker.url;
		newMarker.frameTarget = marker.frameTarget;
		// Replace the old marker with the new one
		layer.marker.setValueAtKey(i, newMarker);
	}
	// Alert the user that the script is done
	// or don't
		}
		else {
		// Alert the user that there are no markers on the layer
		alert("The selected layer has no markers.");
		}

		// A helper function to pad a number with leading zeros
		function pad(num, size) {
		var s = num + "";
		while (s.length < size) s = "0" + s;
		return s;
		}
		app.endUndoGroup();
}
labelMarkersOnSelectedLayer();
})();