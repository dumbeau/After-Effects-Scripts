(function() {

// Enter a number from -100 to 100 to set the ease value.
// 0 will set the keyframe to use existing easing values, but will sync the incoming and outgoing speed.
easeSelectedKeyframesWithTemporalContinuousSpeed(0);


function easeSelectedKeyframesWithTemporalContinuousSpeed(easeValue, setToIncomingSpeed){
    app.beginUndoGroup("Set Selected Keyframes to Continuous Speed");

	
	var easingValueIn 
	var easingValueOut

	if (setToIncomingSpeed){
		easingValueIn = easeValue;
		easingValueOut = -1;		
	} else {		
		easingValueIn = -1;
		easingValueOut = easeValue;
	}

	

    var comp = app.project.activeItem;
    if (comp && comp instanceof CompItem) {
        var layers = comp.selectedLayers;
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            var properties = layer.selectedProperties;
            for (var j = 0; j < properties.length; j++) {
                var property = properties[j];                
				if ([PropertyValueType.TwoD_SPATIAL, PropertyValueType.ThreeD_SPATIAL, 6414, 6417].indexOf(property.propertyValueType)) {
                    var selectedKeys = property.selectedKeys;
                    for (var k = 0; k < selectedKeys.length; k++) {   
                        
                        if (property.keyTemporalContinuous(selectedKeys[k])) {     
                            property.setTemporalContinuousAtKey(selectedKeys[k], false);
                        }

						//Check if keyframe is the first or last keyframe
						if (selectedKeys[k] == 1 || selectedKeys[k] == property.numKeys) {
							setPropertyKeyframeIndexToLinear(property, selectedKeys[k], true, true);	
							continue;
						}

						var isLinear = false;
						// alert(property.keyInInterpolationType(selectedKeys[k]))
						// alert(KeyframeInterpolationType.LINEAR)
						// if ( (property.keyInInterpolationType(selectedKeys[k]) == KeyframeInterpolationType.LINEAR || property.keyInInterpolationType(selectedKeys[k]) == 6613) && (property.keyOutInterpolationType(selectedKeys[k]) == KeyframeInterpolationType.LINEAR || property.keyOutInterpolationType(selectedKeys[k]) == 6613)) {
						if ( (property.keyInInterpolationType(selectedKeys[k]) == KeyframeInterpolationType.LINEAR) && (property.keyOutInterpolationType(selectedKeys[k]) == KeyframeInterpolationType.LINEAR) ) {
							isLinear = true;
							// continue;
							// alert("Linear keyframe")
						}

                        var keyBeforeValue = property.keyValue(selectedKeys[k] - 1);
                        var distanceBefore = calculateDistance(keyBeforeValue, property.keyValue(selectedKeys[k]));                        
                        var rateOfChangeBefore = distanceBefore / (property.keyTime(selectedKeys[k]) - property.keyTime(selectedKeys[k] - 1));

                        //Get the distance between the keyframe after and this current selected keyframe
						var keyAfterValue = property.keyValue(selectedKeys[k] + 1);
                        var distanceAfter = calculateDistance(property.keyValue(selectedKeys[k]), keyAfterValue);
                        var rateOfChangeAfter = distanceAfter / (property.keyTime(selectedKeys[k] + 1) - property.keyTime(selectedKeys[k]));                


						var keyEaseIn
						var keyEaseOut						
						// alert("Before: " + rateOfChangeBefore + "\nAfter: " + rateOfChangeAfter)
						var setSpeed    
						setPropertyKeyIndexEasing(property,selectedKeys[k],easingValueIn,easingValueOut);
						setPropertyKeyIndexEasing(property,selectedKeys[k],easingValueIn,easingValueOut);   

                        if (setToIncomingSpeed) {
							//Set to outgoing speed				
							setPropertyKeyframeIndexToLinear(property, selectedKeys[k], false, true);	
							keyEaseIn = property.keyInTemporalEase(selectedKeys[k]);
							keyEaseOut = property.keyOutTemporalEase(selectedKeys[k]);
							setSpeed = keyEaseOut[0].speed;
                        } else {
							//Set to incoming speed				
							setPropertyKeyframeIndexToLinear(property, selectedKeys[k], true, false);	
							keyEaseIn = property.keyInTemporalEase(selectedKeys[k]);
							keyEaseOut = property.keyOutTemporalEase(selectedKeys[k]);
							setSpeed = keyEaseIn[0].speed;	
                        } 
						property.setTemporalContinuousAtKey(selectedKeys[k], true);
						for (var l = 0; l < keyEaseIn.length; l++) {
							keyEaseIn[l].speed = setSpeed;
							keyEaseOut[l].speed = setSpeed;
						}
						property.setTemporalEaseAtKey(selectedKeys[k], keyEaseIn, keyEaseOut);
						property.setLabelAtKey(selectedKeys[k], 11);


						setPropertyKeyframeIndexToLinear(property, selectedKeys[k], !setToIncomingSpeed, setToIncomingSpeed);

						// if(rateOfChangeBefore == 0){setPropertyKeyframeIndexToLinear(property, selectedKeys[k], true, false);}
						// if(rateOfChangeAfter == 0){setPropertyKeyframeIndexToLinear(property, selectedKeys[k], false, true);}
                    }
                }
            }
        }
    }
    app.endUndoGroup();    
}
function setPropertyKeyframeIndexToLinear(property, keyIndex, setKeyIn, setKeyOut) {    
    if (property.canVaryOverTime && property.propertyValueType !== PropertyValueType.NO_VALUE) {
        var inType = setKeyIn && property.keyInInterpolationType(keyIndex) !== KeyframeInterpolationType.LINEAR ? KeyframeInterpolationType.LINEAR : property.keyInInterpolationType(keyIndex);
        var outType = setKeyOut && property.keyOutInterpolationType(keyIndex) !== KeyframeInterpolationType.LINEAR ? KeyframeInterpolationType.LINEAR : property.keyOutInterpolationType(keyIndex);
        property.setInterpolationTypeAtKey(keyIndex, inType, outType);
    }    
}

function calculateDistance(a, b) {
    // Ensure the inputs are arrays
    a = [].concat(a);
    b = [].concat(b);

    // Ensure the arrays have the same length
    if (a.length !== b.length) {
        throw new Error('Inputs must be two numbers or two arrays of equal length.');
    }

    // Calculate the Euclidean distance
    var sum = 0;
    for (var i = 0; i < a.length; i++) {
        sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
}

})();