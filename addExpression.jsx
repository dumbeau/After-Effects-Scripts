function addExpressionToSelectedProperties(expression){
	app.beginUndoGroup('Add Expression to Selected Properties');	
    // Get the selected properties
    var selectedProps = app.project.activeItem.selectedProperties;

    // Loop through each selected property
    for (var i = 0; i < selectedProps.length; i++) {
    // Get the current property
    var currentProp = selectedProps[i];

    // Check if the property already has an expression
    // if (currentProp.expressionEnabled) {
    //     // If it does, alert the user and skip this property
    //     alert("Property " + currentProp.name + " already has an expression.");
    //     continue;
    // }

    // Add the expression to the property
    currentProp.expression = expression;	
    }
	app.endUndoGroup();
}

function addExpressionToSelectedLayers(expression, propertyString){
	app.beginUndoGroup('Add Expression to Selected Layers');
    // get the selected layers
    var selectedLayers = app.project.activeItem.selectedLayers;

    // loop through the selected layers
    for (var i = 0; i < selectedLayers.length; i++) {
        // add an expression to the scale property
        var targetProperty = selectedLayers[i].property(propertyString);
        targetProperty.expression = expression;
    }
	app.endUndoGroup();
}

function addExpressionToSelectedWithTargetLayer(expression, propertyString){
    var selectedLayers = app.project.activeItem.selectedLayers;
	if (selectedLayers.length < 2){
		alert("Please select at least 2 layers");
		return;
	}
	var targetLayer = selectedLayers[selectedLayers.length - 1];

	app.beginUndoGroup('Add Expression to Selected Layers');

	expression = "var targetLayer = thisComp.layer(\"" + targetLayer.name + "\");\n" + expression;

    // loop through the selected layers
    for (var i = 0; i < selectedLayers.length-1; i++) {
        // add an expression to the scale property
        var targetProperty = selectedLayers[i].property(propertyString);
        targetProperty.expression = expression;
    }
	app.endUndoGroup();	
}