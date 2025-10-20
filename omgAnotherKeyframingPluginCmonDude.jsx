// (function() {
function createDockableUI(thisObj) {
    var dialog =
        thisObj instanceof Panel
            ? thisObj
            : new Window("palette", undefined, undefined, { resizeable: true });
    dialog.onResizing = dialog.onResize = function() {
        this.layout.resize();
    };
    return dialog;
}

function showWindow(myWindow) {
    if (myWindow instanceof Window) {
        myWindow.center();
        myWindow.show();
    }
    if (myWindow instanceof Panel) {
        myWindow.layout.layout(true);
        myWindow.layout.resize();
    }
}

//all code here

// WIN
// ===
var win = createDockableUI(this);
    // win.text = "Keyframe Easing"; 
    win.orientation = "column"; 
    win.alignChildren = ["center","top"]; 
    win.spacing = 5; 
    win.margins = 5; 

// GROUP1
// ======
var group1 = win.add("group", undefined, {name: "group1"}); 
    group1.orientation = "row"; 
    group1.alignChildren = ["fill","center"]; 
    group1.spacing = 0;
    group1.margins = 0;
    group1.alignment = ["fill","top"]; 

var slider1 = group1.add("slider", undefined, undefined, undefined, undefined, {name: "slider1"}); 
    slider1.minvalue = 0; 
    slider1.maxvalue = 100; 
    slider1.value = 50; 

var iconbutton1_imgString = "%C2%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%12%00%00%00%12%08%06%00%00%00V%C3%8E%C2%8EW%00%00%00%19tEXtSoftware%00Adobe%20ImageReadyq%C3%89e%3C%00%00%03(iTXtXML%3Acom.adobe.xmp%00%00%00%00%00%3C%3Fxpacket%20begin%3D%22%C3%AF%C2%BB%C2%BF%22%20id%3D%22W5M0MpCehiHzreSzNTczkc9d%22%3F%3E%20%3Cx%3Axmpmeta%20xmlns%3Ax%3D%22adobe%3Ans%3Ameta%2F%22%20x%3Axmptk%3D%22Adobe%20XMP%20Core%205.6-c145%2079.163499%2C%202018%2F08%2F13-16%3A40%3A22%20%20%20%20%20%20%20%20%22%3E%20%3Crdf%3ARDF%20xmlns%3Ardf%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%22%3E%20%3Crdf%3ADescription%20rdf%3Aabout%3D%22%22%20xmlns%3Axmp%3D%22http%3A%2F%2Fns.adobe.com%2Fxap%2F1.0%2F%22%20xmlns%3AxmpMM%3D%22http%3A%2F%2Fns.adobe.com%2Fxap%2F1.0%2Fmm%2F%22%20xmlns%3AstRef%3D%22http%3A%2F%2Fns.adobe.com%2Fxap%2F1.0%2FsType%2FResourceRef%23%22%20xmp%3ACreatorTool%3D%22Adobe%20Photoshop%20CC%202019%20(Macintosh)%22%20xmpMM%3AInstanceID%3D%22xmp.iid%3A600D85EF3FAA11E99731F012F5360853%22%20xmpMM%3ADocumentID%3D%22xmp.did%3A600D85F03FAA11E99731F012F5360853%22%3E%20%3CxmpMM%3ADerivedFrom%20stRef%3AinstanceID%3D%22xmp.iid%3A600D85ED3FAA11E99731F012F5360853%22%20stRef%3AdocumentID%3D%22xmp.did%3A600D85EE3FAA11E99731F012F5360853%22%2F%3E%20%3C%2Frdf%3ADescription%3E%20%3C%2Frdf%3ARDF%3E%20%3C%2Fx%3Axmpmeta%3E%20%3C%3Fxpacket%20end%3D%22r%22%3F%3E%12ywY%00%00%020IDATx%C3%9A%C2%AC%C2%94%3DK%5BQ%18%C3%87%C2%9F%C2%9C%7B%C3%89%C2%92%C3%9CB%C3%A56q%09T%C3%A2%C2%90%C2%A5%16b%3ATc%C2%BF%C2%80%14Zp%C3%AF%C2%A4%0En%16%C3%AB7ht%C2%A8C%C3%9D%C2%9A%C2%A9T%C2%9C%3A%C2%94%167%1D4%C3%94%C2%B9%C2%B5%C2%A1%C2%93b0%26h%1A%C3%AC5%C2%86%C2%82!I%C3%BB%C3%BF_%C3%8E%09%C2%97%10%C2%87%C2%82%0F%C3%BC%C3%A0%C2%9C%C3%B3%C2%BC%C3%9C%C3%B3%C2%BC%C2%9C%1B%C2%9A%C2%9B%C2%9F%C2%97%01%C3%A2%C2%80%110%0A%C2%86%C3%B4%C3%99%058%04%C3%87%C3%A0%C2%AA%C3%9F%C3%81%C3%AE%C3%9B%C3%9F%01%0F%C3%814%C2%98%01%C3%89%3E%C3%BD%11%C3%B8%08%C2%B6%C3%80w%C3%90%18%14%C3%A8.x%0AVm%C3%9B%1E%C2%9E%C2%9C%C2%98%C2%90%07ccr%C3%8Fu%7D%C3%A5%C2%AFz%5D~%1C%1C%24%C2%BF%C3%AE%C3%AF%2F%C2%B7%C3%9B%C3%AD%178Z%06_%C3%80o%C3%AAC%3A5%C3%9E%C3%A4%19x%C2%9FH%24dnvVb%C2%B1%C3%98%C2%A0%C2%94%C2%A5V%C2%AB%C3%89%C2%BB%7C%5E%C3%8A%C3%A52%C2%B7%0C%C3%B8%C2%897SZ%C3%8FtV%19%C3%A4%C3%95%C3%92%C3%92%C2%8DA(%C3%94%C3%91%C2%86%C2%B6%C3%B4%C3%91%C2%BE%C2%A2ta%C2%A7%C2%99%0Eo%12%0E%C2%87%7B_%C2%AE%23%1D%23%5C%C2%9F%C3%A3%C2%8CB%1B%C3%9A%C3%92G%C3%97%C3%93Q%C2%BA%3B3%C2%AC%C2%89%C2%B9%09%C2%83%C2%BC%C3%8E%C3%A5%24%C2%B7%C2%B2%22%C3%95j%C3%95%C2%87%C3%AB%1C%C3%8EL0%C3%9A%C3%92G7e%C3%84%C3%96-N%C2%B2%C2%B0F%C2%94RbY%C2%964%C2%9BMy%C2%B3%C2%B6%C3%A6%C2%9Fq%1D%C2%8DF%C3%85R%C2%AAgG%C2%9F%C3%9D%C2%BD%3DvvT%C2%9991%C3%9D%C2%A1%C2%B8X%C2%BF%5C%5C%C3%B4%1D%11%C2%A0D%C2%B8%C3%A6%C2%99%1B%C2%B0%0B%C3%B8%0C)%C2%B9%25Qzb%C3%BD9%09%16%C2%96)%C3%A9t%C3%AE%13%C2%93f%C2%B0%01%01%C2%9F%0B%C2%A5%C3%87%C3%BE%08%C3%83%C3%963%C3%A8v%C2%BB%C3%92%C3%A9t%C3%84%C2%A4c%C3%92%C3%A4Y%07%3A%23%C3%9A%C2%87%C3%93~h%C2%8Dg2%7FX%C2%96J%C2%A5%C2%92%7D%C2%94%C3%89H%24%12%C3%B1I%C2%A7%C3%93%C3%B2djJ%C3%A2%C3%B1%C2%B88%C2%8E%23%C3%A3%C3%98Of%C2%B3%12%0Ft%C3%B6%C3%83%C3%86%06%3F%C2%9A%C3%87%C3%B6%C2%B3%C3%92%0Fp%0Bc%7F%C3%86%C2%89m%C2%B5Z%C2%BD%C3%B6%C2%BA%7D%0D0AhC%5B%C3%BA%C3%A8ww%C3%85%1BQ%C3%A7%C2%81%C3%93F%C2%A3%C3%B1%C2%BCX%2CJ*%C2%95%C3%B2ou%C3%93%13y%C2%BB%C2%BEn%C2%9E%C3%88%02%C3%98%05%C3%97%26%C3%9058%01%3F%11%C3%ACq%C2%A1P%C2%88%5Ez%C2%88%1D%0A%C3%89_%C3%94%C2%84%C2%85%3E.%C2%95dg%7B%C3%9BO%C3%87%C3%B3%C2%BC3%1D%C2%84%C2%8F%C3%B62%C3%B8ho%C3%B57%22ZQ%00%C3%9F%C3%80%C3%A6%C3%BF%C3%BC%C3%98%C3%BE%090%00%C2%B97%C3%B8g%1C%C3%9D%C2%B3%0F%00%00%00%00IEND%C2%AEB%60%C2%82"; 
var iconbutton1 = group1.add("iconbutton", undefined, File.decode(iconbutton1_imgString), {name: "iconbutton1", style: "toolbutton"}); 
	iconbutton1.preferredSize.width = 26;	
	iconbutton1.minimumSize.width = 26;	
	iconbutton1.maximumSize.width = 26;	
var slider2 = group1.add("slider", undefined, undefined, undefined, undefined, {name: "slider2"}); 
    slider2.minvalue = 0; 
    slider2.maxvalue = 100; 
    slider2.value = 50; 

// GROUP2
// ======
var group2 = win.add("group", undefined, {name: "group2"});     
    group2.orientation = "row"; 
    group2.alignChildren = ["center","center"]; 
    group2.spacing = 2; 
    group2.margins = 0; 

var iconbutton2 = group2.add("iconbutton", undefined, File.decode(iconbutton1_imgString), {name: "iconbutton2", style: "toolbutton"}); 

var edittext1 = group2.add('edittext {justify: "right", properties: {name: "edittext1"}}'); 
    edittext1.text = "0"; 
    edittext1.preferredSize.width = 50; 

var iconbutton3 = group2.add("iconbutton", undefined, File.decode(iconbutton1_imgString), {name: "iconbutton3", style: "toolbutton"}); 

var edittext2 = group2.add('edittext {properties: {name: "edittext2"}}'); 
    edittext2.text = "0"; 
    edittext2.preferredSize.width = 50; 

var iconbutton4 = group2.add("iconbutton", undefined, File.decode(iconbutton1_imgString), {name: "iconbutton4", style: "toolbutton"}); 

showWindow(win);

function easeSelectedKeyframesWithTemporalContinuousSpeed(easeValue){
	easeSelectedKeyframesWithTemporalContinuousSpeed(easeValue, !(easeValue < 0));

	if (easeValue < 0) {
		easeSelectedKeyframesWithTemporalContinuousSpeed(easeValue, false);
	} else if (easeValue > 0) {
		easeSelectedKeyframesWithTemporalContinuousSpeed(easeValue, true);
	} else {
		easeSelectedKeyframesWithTemporalContinuousSpeed(0, true);				
	}    
}
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
                if (property.propertyValueType == PropertyValueType.TwoD_SPATIAL || property.propertyValueType == PropertyValueType.ThreeD_SPATIAL || property.propertyValueType == 6414 || property.propertyValueType == 6417) {                
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
// })();








