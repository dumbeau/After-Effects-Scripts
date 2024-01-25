//Change numbers (1-100) to your easing value preferences
setSelectedKeysToTemporalContinuousSpeed(65,65);

function setSelectedKeysToTemporalContinuousSpeed(easingValueInPreference, easingValueOutPreference) {
    app.beginUndoGroup("Set Selected Keyframes to Continuous Speed");	
	var easingValueIn = easingValueInPreference; // Set between 0 and 100
	var easingValueOut = easingValueOutPreference; // Set between 0 and 100

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
    function setPropertyKeyIndexEasing(prop, keyIndex, easeInInfluence, easeOutInfluence){
    

        var changeEaseIn = true;
        var setEaseInType = KeyframeInterpolationType.BEZIER;
        if (easeInInfluence < 0){
            changeEaseIn = false;
            easeInInfluence = 0.1;
        };
        if(easeInInfluence < 0.1 && easeInInfluence >= 0){
            setEaseInType = KeyframeInterpolationType.LINEAR;    
            easeInInfluence = 0.1;
        }    
        var changeEaseOut = true;    
        var setEaseOutType = KeyframeInterpolationType.BEZIER;
        if (easeOutInfluence < 0){
            changeEaseOut = false;
            easeOutInfluence = 0.1;
        };
        if(easeOutInfluence < 0.1 && easeOutInfluence >= 0){        
            setEaseOutType = KeyframeInterpolationType.LINEAR;        
            easeOutInfluence = 0.1;
        }
        
        var applyEaseIn = new KeyframeEase(0,easeInInfluence);
        var applyEaseOut = new KeyframeEase(0,easeOutInfluence);
    
        if(!changeEaseIn){
            applyEaseIn = prop.keyInTemporalEase(keyIndex)[0];             
            setEaseInType = prop.keyInInterpolationType(keyIndex);          
        }
        if(!changeEaseOut){
            applyEaseOut = prop.keyInTemporalEase(keyIndex)[0];
            setEaseOutType = prop.keyOutInterpolationType(keyIndex);
        }
        
        function fillArray(length, value){
            var returnArray = [];
            for(var i=0; i < length; i++){
                returnArray.push(value);
                }
                return returnArray
            }
    
    
        function getPropertyValueLength(checkProp){
            var dimensionArray = [6416,6414];
            var checkTest = checkIndexPosition(dimensionArray,prop.propertyValueType)                
            if (checkTest == -1){
                return 1
            } else {
                return checkTest+2
            }
        }
    
        function checkIndexPosition(arr, value) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] === value) {
                return i;
                }
            }
            return -1;
            }
        
        var propValueLength = getPropertyValueLength(prop);
        var applyEaseInArray = fillArray(propValueLength, applyEaseIn);
        var applyEaseOutArray = fillArray(propValueLength, applyEaseOut);
        prop.setTemporalEaseAtKey(keyIndex, applyEaseInArray, applyEaseOutArray);
        prop.setInterpolationTypeAtKey(keyIndex, setEaseInType, setEaseOutType);
    }
    function setPropertyKeyframeIndexToLinear(property, keyIndex, setKeyIn, setKeyOut) {    
        if (property.canVaryOverTime && property.propertyValueType !== PropertyValueType.NO_VALUE) {
            var inType = setKeyIn && property.keyInInterpolationType(keyIndex) !== KeyframeInterpolationType.LINEAR ? KeyframeInterpolationType.LINEAR : property.keyInInterpolationType(keyIndex);
            var outType = setKeyOut && property.keyOutInterpolationType(keyIndex) !== KeyframeInterpolationType.LINEAR ? KeyframeInterpolationType.LINEAR : property.keyOutInterpolationType(keyIndex);
            property.setInterpolationTypeAtKey(keyIndex, inType, outType);
        }    
    }

    var comp = app.project.activeItem;
    if (comp && comp instanceof CompItem) {
        var layers = comp.selectedLayers;
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            var properties = layer.selectedProperties;
            for (var j = 0; j < properties.length; j++) {
                var property = properties[j];                
                if (property.propertyValueType == PropertyValueType.TwoD_SPATIAL || property.propertyValueType == PropertyValueType.ThreeD_SPATIAL || property.propertyValueType == 6414 || property.propertyValueType == 6417) {                
                    var selectedKeys = property.selectedKeys;
                    for (var k = 0; k < selectedKeys.length; k++) {   
                        
                        if (property.keyTemporalContinuous(selectedKeys[k])) {     
                            property.setTemporalContinuousAtKey(selectedKeys[k], false);
                        }

						//Check if keyframe is the first or last keyframe
						if (selectedKeys[k] == 1 || selectedKeys[k] == property.numKeys) {
							setPropertyKeyframeIndexToLinear(property, selectedKeys[k], true, true)	
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
						if (isLinear){setPropertyKeyIndexEasing(property,selectedKeys[k],easingValueIn,easingValueOut);}                 
                        if (Math.abs(rateOfChangeBefore) > Math.abs(rateOfChangeAfter)) {							
							setPropertyKeyframeIndexToLinear(property, selectedKeys[k], false, true);	
							keyEaseIn = property.keyInTemporalEase(selectedKeys[k]);
							keyEaseOut = property.keyOutTemporalEase(selectedKeys[k]);
							setSpeed = keyEaseOut[0].speed;
                        } else {
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
						if(rateOfChangeBefore == 0){setPropertyKeyframeIndexToLinear(property, selectedKeys[k], true, false);}
						if(rateOfChangeAfter == 0){setPropertyKeyframeIndexToLinear(property, selectedKeys[k], false, true);}
                    }
                }
            }
        }
    }
    app.endUndoGroup();    
}