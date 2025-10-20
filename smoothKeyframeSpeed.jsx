(function() {

// Determine keyframe selection situation

// single keyframe on prop

	function smoothKeyframeSpeed(){

		app.beginUndoGroup("Smooth Keyframe Speed");
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
						app.beginUndoGroup("Smooth Keyframe Speed");						
						for (var k = 0; k < selectedKeys.length; k++) {
							selectedKey = selectedKeys[k];
							if ( (property.keyInInterpolationType(selectedKeys[k]) == KeyframeInterpolationType.LINEAR) && (property.keyOutInterpolationType(selectedKeys[k]) != KeyframeInterpolationType.LINEAR) ) {
								alignKeyframeSpeed(property,selectedKey,false);
							} else if ( (property.keyInInterpolationType(selectedKeys[k]) != KeyframeInterpolationType.LINEAR) && (property.keyOutInterpolationType(selectedKeys[k]) == KeyframeInterpolationType.LINEAR) ){
								alignKeyframeSpeed(property,selectedKey,true);
							} else if ( (property.keyInInterpolationType(selectedKeys[k]) != KeyframeInterpolationType.LINEAR) &&
								(property.keyOutInterpolationType(selectedKeys[k]) != KeyframeInterpolationType.LINEAR) &&
								(selectedKey > 0) && (selectedKey < property.numKeys) ) {
								var keyBeforeValue = property.keyValue(selectedKeys[k] - 1);
								var distanceBefore = calculateDistance(keyBeforeValue, property.keyValue(selectedKeys[k]));                        
								var rateOfChangeBefore = distanceBefore / (property.keyTime(selectedKeys[k]) - property.keyTime(selectedKeys[k] - 1));

								//Get the distance between the keyframe after and this current selected keyframe
								var keyAfterValue = property.keyValue(selectedKeys[k] + 1);
								var distanceAfter = calculateDistance(property.keyValue(selectedKeys[k]), keyAfterValue);
								var rateOfChangeAfter = distanceAfter / (property.keyTime(selectedKeys[k] + 1) - property.keyTime(selectedKeys[k]));  

								alignKeyframeSpeed(property,selectedKey,rateOfChangeBefore > rateOfChangeAfter);
							}
						}
						app.endUndoGroup();
					}
				}
			}
		}	
	}

	function alignKeyframeSpeed(prop,key,setToIncomingSpeed){
		var keyEaseIn
		var keyEaseOut						
		// alert("Before: " + rateOfChangeBefore + "\nAfter: " + rateOfChangeAfter)
		var setSpeed    

		if (setToIncomingSpeed) {
			//Set to outgoing speed				
			setPropertyKeyframeIndexToLinear(prop, key, false, true);	
			keyEaseIn = prop.keyInTemporalEase(key);
			keyEaseOut = prop.keyOutTemporalEase(key);
			setSpeed = keyEaseOut[0].speed;
		} else {
			//Set to incoming speed				
			setPropertyKeyframeIndexToLinear(prop, key, true, false);	
			keyEaseIn = prop.keyInTemporalEase(key);
			keyEaseOut = prop.keyOutTemporalEase(key);
			setSpeed = keyEaseIn[0].speed;	
		} 
		prop.setTemporalContinuousAtKey(key, true);
		for (var l = 0; l < keyEaseIn.length; l++) {
			keyEaseIn[l].speed = setSpeed;
			keyEaseOut[l].speed = setSpeed;
		}
		prop.setTemporalEaseAtKey(key, keyEaseIn, keyEaseOut);
		setPropertyKeyframeIndexToLinear(prop, key, !setToIncomingSpeed, setToIncomingSpeed);
		// prop.setLabelAtKey(key, 11);  // Sets keyframe color to orange.		
	}

	function setPropertyKeyframeIndexToLinear(property, keyIndex, setKeyIn, setKeyOut) {    
		if (property.canVaryOverTime && property.propertyValueType !== PropertyValueType.NO_VALUE) {
			var inType = setKeyIn && property.keyInInterpolationType(keyIndex) !== KeyframeInterpolationType.LINEAR ? KeyframeInterpolationType.LINEAR : property.keyInInterpolationType(keyIndex);
			var outType = setKeyOut && property.keyOutInterpolationType(keyIndex) !== KeyframeInterpolationType.LINEAR ? KeyframeInterpolationType.LINEAR : property.keyOutInterpolationType(keyIndex);
			property.setInterpolationTypeAtKey(keyIndex, inType, outType);
		}    
	}

	smoothKeyframeSpeed();
})();