// AE Script: Attach a layer to a path in a shape layer.

/* 
Basically the Trace Path function in CreateNullsFromPaths.jsx, but with a few changes:

Input: 2 layers selected, the first is the layer to attach, the second is the path layer.
Output: A null layer with the path layer as a parent, and the attach layer as a child. The null layer has expressions for position and rotation that follow the path.
*/
(function() {  

    // Assume 2 layers are selected.
    
    var selectedLayers = app.project.activeItem.selectedLayers;
    var attachLayer;
    var pathLayer;

    var shapeLayers = [];
    var notShapeLayers = [];
    for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];
        if (layer.matchName === "ADBE Vector Layer") {
            shapeLayers.push(layer);
        } else {
            notShapeLayers.push(layer);
        }
    }
    if (shapeLayers.length === 1) {
        pathLayer = shapeLayers[0];
        attachLayer = notShapeLayers[0];
    } else if (shapeLayers.length === 2) {
        pathLayer = selectedLayers[selectedLayers.length - 1];
        attachLayer = selectedLayers[0];
    } else {
        alert("Please select 2 layers: The layer to attach, and then the path shape layer");
        return;
    }



    var pathProperty = {};

    if(pathLayer.selectedPathProperties){
        for (var i = 0; i < pathLayer.selectedPathProperties.length; i++){
            var pathProperty = pathLayer.selectedPathProperties[i];
            if(pathProperty.property("ADBE Vector Shape")){                
                pathLayer = pathProperty.property("ADBE Vector Shape");
                break;
            }
        }     
    } else {
        // var foundPaths = findPathsInLayer(pathLayer);
        var foundPaths = findAllPropertiesByMatchName(pathLayer.property("ADBE Root Vectors Group"), "ADBE Vector Shape", true);
        // alert('Found ' + foundPaths.length + ' paths in the path layer.');       

        if (foundPaths.length === 0) {
            alert("No paths found in the selected path layer.");
            return;
        } 
        if ( foundPaths.length > 1) {
            alert("Please select a layer with only one path or select the path property directly.");
            return;
        }


        pathProperty = foundPaths[0];        
    }

    

   

    // Find a trim path property on the path layer. If it doesn't exist, create one.
    


    app.beginUndoGroup("Attach to Path");
    var trimPathProperty = findFirstPropertyByMatchName(pathLayer.property("ADBE Root Vectors Group"), "ADBE Vector Filter - Trim", true);    

    // If no keyframe exists on the trim end property, add one at the current time
    


    //Create a null layer to attach to the path.
    var nullLayer = app.project.activeItem.layers.addNull();
    nullLayer.name = "Trace " + pathLayer.name;
    nullLayer.moveBefore(pathLayer);   
    nullLayer.label = 10; // Purple label

    // alert(isValid(pathProperty))
    // var timeout = 1000; // 1 seconds
    // var interval = 100; // 100 milliseconds
    // while (!isValid(pathProperty) && timeout > 0) {
    //     $.sleep(interval); // Wait for 100 milliseconds
    //     timeout -= interval;
    // }

    var pathPropertyExpressionPath = getPropertyExpressionPath(pathProperty);

    if (!trimPathProperty) {
        trimPathProperty = pathLayer.property("ADBE Root Vectors Group").addProperty("ADBE Vector Filter - Trim");
    }
    var trimEndProperty = trimPathProperty.property("ADBE Vector Trim End");
    var trimEndPropertyExpressionPath = getPropertyExpressionPath(trimEndProperty);
    if (trimEndProperty.numKeys === 0) {
        trimEndProperty.addKey(app.project.activeItem.time);        
    }

    nullLayer.transform.position.expression = '\/\/ Pin Position to Layer\nvar pathLayer = thisComp.layer(\"' + pathLayer.name + '\");\n' +
        'var pathProperty = ' + pathPropertyExpressionPath + ';\n' +
        'var progress = ' + trimEndPropertyExpressionPath + '/100;\n' +
        'pathLayer.toComp(pathProperty.pointOnPath(progress));\n';

    

    
    nullLayer.transform.rotation.expression = '\/\/ Align Rotation to Path\nvar pathLayer = thisComp.layer(\"' + pathLayer.name + '\");\n' +
        'var pathProperty = ' + pathPropertyExpressionPath + ';\n' +
        'var progress = ' + trimEndPropertyExpressionPath + '/100;\n' +
        'var pathTan = pathProperty.tangentOnPath(progress);\n'+
        'radiansToDegrees(Math.atan2(pathTan[1],pathTan[0]));\n';
    nullLayer.transform.rotation.expressionEnabled = false;

    // Parent the attach layer to the null layer.
    attachLayer.parent = nullLayer;
    attachLayer.transform.position.setValue([0, 0]);
    attachLayer.transform.rotation.setValue(0);

    app.endUndoGroup();

    function findFirstPropertyByMatchName(rootProp, targetMatchName, searchRecursively) {
        // Default to recursive search if not specified
        searchRecursively = (searchRecursively !== false);
        
        // Base case: if this property's match name matches the target
        if (rootProp.matchName === targetMatchName) {
            return rootProp;
        }
        
        // If this is a property group, search through its sub-properties
        if (rootProp.numProperties && rootProp.numProperties > 0) {
            for (var i = 1; i <= rootProp.numProperties; i++) {
                try {
                    var subProp = rootProp.property(i);
                    
                    // If this property matches, return it
                    if (subProp.matchName === targetMatchName) {
                        return subProp;
                    }
                    
                    // If recursive search is enabled and this is a property group
                    if (searchRecursively && subProp.numProperties && subProp.numProperties > 0) {
                        var foundProp = findFirstPropertyByMatchName(subProp, targetMatchName, true);
                        if (foundProp) {
                            return foundProp;
                        }
                    }
                } catch (err) {
                    // Skip properties that can't be accessed
                    continue;
                }
            }
        }
        
        // If we get here, the property wasn't found
        return null;
    }

    function findAllPropertiesByMatchName(rootProp, targetMatchName, searchRecursively) {
        // Default to recursive search if not specified
        searchRecursively = (searchRecursively !== false);
        
        // Array to store all matching properties
        var foundProperties = [];
        
        // Base case: if this property's match name matches the target
        if (rootProp.matchName === targetMatchName) {
            foundProperties.push(rootProp);
        }
        
        // If this is a property group, search through its sub-properties
        if (rootProp.numProperties && rootProp.numProperties > 0) {
            for (var i = 1; i <= rootProp.numProperties; i++) {
                try {
                    var subProp = rootProp.property(i);
                    
                    // If this property matches, add it to our results
                    if (subProp.matchName === targetMatchName) {
                        foundProperties.push(subProp);
                    }
                    
                    // If recursive search is enabled and this is a property group
                    if (searchRecursively && subProp.numProperties && subProp.numProperties > 0) {
                        // Recursively find properties in this group and add them to our results
                        var nestedProps = findAllPropertiesByMatchName(subProp, targetMatchName, true);
                        for (var j = 0; j < nestedProps.length; j++) {
                            foundProperties.push(nestedProps[j]);
                        }
                    }
                } catch (err) {
                    // Skip properties that can't be accessed
                    continue;
                }
            }
        }
        
        // Return all found properties
        return foundProperties;
    }

    function getPropertyExpressionPath(prop){        
        var lastQueriedProp = "";
        var queryProp = prop;
    
        var propCompactEnglishExprs =
        {
            "ADBE Transform Group":									"'transform'",
                                                                                    // Handle camera/light vs. AV layers
            "ADBE Anchor Point":											"((prop.propertyGroup(prop.propertyDepth).property('intensity')!=null) || (prop.propertyGroup(prop.propertyDepth).property('zoom')!=null)) ? '.pointOfInterest' : '.anchorPoint'",
            "ADBE Position":													"'.position'",
            "ADBE Scale":													"'.scale'",
            "ADBE Orientation":											"'.orientation'",
            "ADBE Rotate X":												"'.xRotation'",
            "ADBE Rotate Y":												"'.yRotation'",
                                                                                    // Handle 3D vs. 2D layers
            "ADBE Rotate Z":												"(prop.propertyGroup(prop.propertyDepth).threeDLayer || (prop.propertyGroup(prop.propertyDepth).property('intensity')!=null) || (prop.propertyGroup(prop.propertyDepth).property('zoom')!=null)) ? '.zRotation' : '.rotation'",
            "ADBE Opacity":													"'.opacity'",
            
            "ADBE Material Options Group":							"'materialOption'",
            "ADBE Casts Shadows":										"'.castsShadows'",
            "ADBE Light Transmission":									"'.lightTransmission'",
            "ADBE Accepts Shadows":									"'.acceptsShadows'",
            "ADBE Accepts Lights":										"'.acceptsLights'",
            "ADBE Ambient Coefficient":								"'.ambient'",
            "ADBE Diffuse Coefficient":									"'.diffuse'",
            "ADBE Specular Coefficient":								"'.specular'",
            "ADBE Shininess Coefficient":								"'.shininess'",
            "ADBE Metal Coefficient":									"'.metal'",
            
            "ADBE Light Options Group":								"'lightOption'",
            "ADBE Light Intensity":										"'.intensity'",
            "ADBE Light Color":											"'.color'",
            "ADBE Light Cone Angle":									"'.coneAngle'",
            "ADBE Light Cone Feather 2":								"'.coneFeather'",
            //"ADBE Casts Shadows":										"'.castsShadows'",	// Already covered previously
            "ADBE Light Shadow Darkness":							"'.shadowDarkness'",
            "ADBE Light Shadow Diffusion":							"'.shadowDiffusion'",
            
            "ADBE Camera Options Group":							"'cameraOption'",
            "ADBE Camera Zoom":										"'.zoom'",
            "ADBE Camera Depth of Field":							"'.depthOfField'",
            "ADBE Camera Focus Distance":							"'.focusDistance'",
            "ADBE Camera Aperture":									"'.aperture'",
            "ADBE Camera Blur Level":									"'.blurLevel'",
            
            "ADBE Text Properties":										"'text'",
            "ADBE Text Document":										"'.sourceText'",
            "ADBE Text Path Options":									"'.pathOption'",
            "ADBE Text Path":												"'.path'",
            "ADBE Text Reverse Path":									"'.reversePath'",
            "ADBE Text Perpendicular To Path":						"'.perpendicularToPath'",
            "ADBE Text Force Align Path":								"'.forceAlignment'",
            "ADBE Text First Margin":									"'.firstMargin'",
            "ADBE Text Last Margin":									"'.lastMargin'",
            "ADBE Text More Options":									"'.moreOption'",
            "ADBE Text Anchor Point Option":						"'.anchorPointGrouping'",
            "ADBE Text Anchor Point Align":							"'.groupingAlignment'",
            "ADBE Text Render Order":									"'.fillANdStroke'",
            "ADBE Text Character Blend Mode":						"'.interCharacterBlending'",
    
            "ADBE Text Animators":										"'.animator'",
            //"ADBE Text Animator":										"''",		// No equivalent
            "ADBE Text Selectors":										"'.selector'",
            //"ADBE Text Selector":											"''",		// No equivalent
            "ADBE Text Percent Start":									"'.start'",
            "ADBE Text Percent End":									"'.end'",
            "ADBE Text Percent Offset":								"'.offset'",
            "ADBE Text Index Start":										"'.start'",
            "ADBE Text Index End":										"'.end'",
            "ADBE Text Index Offset":									"'.offset'",
            "ADBE Text Range Advanced":								"'.advanced'",
            "ADBE Text Range Units":									"'.units'",
            "ADBE Text Range Type2":									"'.basedOn'",
            "ADBE Text Selector Mode":								"'.mode'",
            "ADBE Text Selector Max Amount":						"'.amount'",
            "ADBE Text Range Shape":									"'.shape'",
            "ADBE Text Selector Smoothness":						"'.smoothness'",
            "ADBE Text Levels Max Ease":								"'.easeHigh'",
            "ADBE Text Levels Min Ease":								"'.easeLow'",
            "ADBE Text Randomize Order":							"'.randomizeOrder'",
            "ADBE Text Random Seed":								"'.randomSeed'",
            //"ADBE Text Wiggly Selector":								"''",		// No equivalent
            "ADBE Text Selector Mode":								"'.mode'",
            "ADBE Text Wiggly Max Amount":						"'.maxAmount'",
            "ADBE Text Wiggly Min Amount":							"'.minAmount'",
            "ADBE Text Range Type2":									"'.basedOn'",
            "ADBE Text Temporal Freq":								"'.wigglesSecond'",
            "ADBE Text Character Correlation":						"'.correlation'",
            "ADBE Text Temporal Phase":								"'.temporalPhase'",
            "ADBE Text Spatial Phase":									"'.spatialPhase'",
            "ADBE Text Wiggly Lock Dim":								"'.lockDimensions'",
            "ADBE Text Wiggly Random Seed":						"'.randomSeed'",
            //"ADBE Text Expressible Selector":						"''",		// No equivalent
            "ADBE Text Range Type2":									"'.basedOn'",
            "ADBE Text Expressible Amount":						"'.amount'",
            "ADBE Text Animator Properties":						"'.property'",
            "ADBE Text Anchor Point 3D":								"'.anchorPoint'",
            "ADBE Text Position 3D":										"'.position'",
            "ADBE Text Scale 3D":										"'.scale'",
            "ADBE Text Skew":												"'.skew'",
            "ADBE Text Skew Axis":										"'.skewAxis'",
            "ADBE Text Rotation X":										"'.xRotation'",
            "ADBE Text Rotation Y":										"'.yRotation'",
            "ADBE Text Rotation":											"'.zRotation'",
            "ADBE Text Opacity":											"'.opacity'",
            "ADBE Text Fill Opacity":										"'.fillOpacity'",
            "ADBE Text Fill Color":										"'.fillColor'",
            "ADBE Text Fill Hue":											"'.fillHue'",
            "ADBE Text Fill Saturation":									"'.fillSaturation'",
            "ADBE Text Fill Brightness":									"'.fillBrightness'",
            "ADBE Text Stroke Opacity":								"'.strokeOpacity'",
            "ADBE Text Stroke Color":									"'.strokeColor'",
            "ADBE Text Stroke Hue":										"'.strokeHue'",
            "ADBE Text Stroke Saturation":							"'.strokeSaturation'",
            "ADBE Text Stroke Brightness":							"'.strokeBrightness'",
            "ADBE Text Stroke Width":									"'.strokeWidth'",
            "ADBE Text Line Anchor":									"'.lineAnchor'",
            "ADBE Text Line Spacing":									"'.lineSpacing'",
            "ADBE Text Track Type":									"'.trackingType'",
            "ADBE Text Tracking Amount":							"'.trackingAmount'",
            "ADBE Text Character Change Type":					"'.characterAlignment'",
            "ADBE Text Character Range":							"'.characterRange'",
            "ADBE Text Character Replace":							"'.characterValue'",
            "ADBE Text Character Offset":								"'.characterOffset'",
            "ADBE Text Blur":												"'.blur'",
            
            "ADBE Mask Parade":											"'mask'",
            "ADBE Mask Shape":											"'.maskPath'",
            "ADBE Mask Feather":										"'.maskFeather'",
            "ADBE Mask Opacity":											"'.maskOpacity'",
            "ADBE Mask Offset":											"'.maskExpansion'",
            
            "ADBE Effect Parade":											"'effect'",
            
            //"ADBE Paint":													"''",
            //"ADBE Paint On Transparent":								"''",
            "ADBE Paint Group":											"'.stroke'",
            //"ADBE Paint Atom":											"''",
            //"ADBE Paint Transfer Mode":								"''",
            //"ADBE Paint Duration":										"''",
            "ADBE Paint Shape":											"'.path'",
            "ADBE Paint Properties":										"'.strokeOption'",
            "ADBE Paint Begin":											"'.start'",
            "ADBE Paint End":												"'.end'",
            "ADBE Paint Color":											"'.color'",
            "ADBE Paint Diameter":										"'.diameter'",
            "ADBE Paint Angle":											"'.angle'",
            "ADBE Paint Hardness":										"'.hardness'",
            "ADBE Paint Roundness":									"'.roundness'",
            "ADBE Paint Tip Spacing":									"'.spacing'",
            "ADBE Paint Target Channels":							"'.channels'",
            "ADBE Paint Opacity":											"'.opacity'",
            "ADBE Paint Flow":												"'.flow'",
            "ADBE Paint Clone Layer":									"'.cloneSource'",
            "ADBE Paint Clone Position":								"'.clonePosition'",
            "ADBE Paint Clone Time":									"'.cloneTime'",
            "ADBE Paint Clone Time Shift":							"'.cloneTimeShift'",
            //"ADBE Paint Clone Source Type":							"''",
            "ADBE Paint Transform":										"'.transform'",
            "ADBE Paint Anchor Point":									"'.anchorPoint'",
            "ADBE Paint Position":											"'.position'",
            "ADBE Paint Scale":											"'.scale'",
            "ADBE Paint Rotation":										"'.rotation'",
            //"ADBE Paint Nibbler Group":								"''",
            
            "ADBE MTrackers":												"'motionTracker'",
            "ADBE MTracker Pt Feature Center":					"'.featureCenter'",
            "ADBE MTracker Pt Feature Size":						"'.featureSize'",
            "ADBE MTracker Pt Search Ofst":							"'.searchOffset'",
            "ADBE MTracker Pt Search Size":						"'.searchSize'",
            "ADBE MTracker Pt Confidence":							"'.confidence'",
            "ADBE MTracker Pt Attach Pt":								"'.attachPoint'",
            "ADBE MTracker Pt Attach Pt Ofst":						"'.attachPointOffset'",
            
            "ADBE Audio Group":											"'audio'",
            "ADBE Audio Levels":											"'.audioLevels'",
            
            "ADBE Time Remapping":									"'timeRemap'",
            
            "ADBE Layer Styles":											"'layerStyle'",
            "ADBE Blend Options Group":								"'.blendingOption'",
                "ADBE Global Angle2":										"'.globalLightAngle'",
                "ADBE Global Altitude2":										"'.globalLightAltitude'",
                "ADBE Adv Blend Group":									"'.advancedBlending'",
                "ADBE Layer Fill Opacity2":									"'.fillOpacity'",
                "ADBE R Channel Blend":									"'.red'",
                "ADBE G Channel Blend":									"'.green'",
                "ADBE B Channel Blend":										"'.blue'",
                "ADBE Blend Interior":										"'.blendInteriorStylesAsGroup'",
                "ADBE Blend Ranges":										"'.useBlendRangesFromSource'",
            "dropShadow/enabled":										"'.dropShadow'",
                "dropShadow/mode2":										"'.blendMode'",
                "dropShadow/color":											"'.color'",
                "dropShadow/opacity":										"'.opacity'",
                "dropShadow/useGlobalAngle":							"'.useGlobalLight'",
                "dropShadow/localLightingAngle":						"'.angle'",
                "dropShadow/distance":										"'.distance'",
                "dropShadow/chokeMatte":									"'.spread'",
                "dropShadow/blur":											"'.size'",
                "dropShadow/noise":											"'.noise'",
                "dropShadow/layerConceals":								"'.layerKnocksOutDropShadow'",
            "innerShadow/enabled":										"'.innerShadow'",
                "innerShadow/mode2":										"'.blendMode'",
                "innerShadow/color":											"'.color'",
                "innerShadow/opacity":										"'.opacity'",
                "innerShadow/useGlobalAngle":							"'.useGlobalLight'",
                "innerShadow/localLightingAngle":						"'.angle'",
                "innerShadow/distance":									"'.distance'",
                "innerShadow/chokeMatte":								"'.choke'",
                "innerShadow/blur":											"'.size'",
                "innerShadow/noise":											"'.noise'",
            "outerGlow/enabled":											"'.outerGlow'",
                "outerGlow/mode2":											"'.blendMode'",
                "outerGlow/opacity":											"'.opacity'",
                "outerGlow/noise":												"'.noise'",
                "outerGlow/AEColorChoice":								"'.colorType'",
                "outerGlow/color":												"'.color'",
                //"outerGlow/gradient":											"'.'",		// No equivalent
                "outerGlow/gradientSmoothness":						"'.gradientSmoothness'",
                "outerGlow/glowTechnique":								"'.technique'",
                "outerGlow/chokeMatte":									"'.spread'",
                "outerGlow/blur":												"'.size'",
                "outerGlow/inputRange":									"'.range'",
                "outerGlow/shadingNoise":									"'.jitter'",
            "innerGlow/enabled":											"'.innerGlow'",
                "innerGlow/mode2":											"'.blendMode'",
                "innerGlow/opacity":											"'.opacity'",
                "innerGlow/noise":												"'.noise'",
                "innerGlow/AEColorChoice":								"'.colorType'",
                "innerGlow/color":												"'.color'",
                //"innerGlow/gradient":											"'.'",		// No equivalent
                "innerGlow/gradientSmoothness":						"'.gradientSmoothness'",
                "innerGlow/glowTechnique":								"'.technique'",
                "innerGlow/innerGlowSource":							"'.source'",
                "innerGlow/chokeMatte":									"'.choke'",
                "innerGlow/blur":												"'.size'",
                "innerGlow/inputRange":										"'.range'",
                "innerGlow/shadingNoise":									"'.jitter'",
            "bevelEmboss/enabled":										"'.bevelAndEmboss'",
                "bevelEmboss/bevelStyle":									"'.style'",
                "bevelEmboss/bevelTechnique":							"'.technique'",
                "bevelEmboss/strengthRatio":								"'.depth'",
                "bevelEmboss/bevelDirection":							"'.direction'",
                "bevelEmboss/blur":											"'.size'",
                "bevelEmboss/softness":										"'.soften'",
                "bevelEmboss/useGlobalAngle":							"'.useGlobalLight'",
                "bevelEmboss/localLightingAngle":						"'.angle'",
                "bevelEmboss/localLightingAltitude":					"'.altitude'",
                "bevelEmboss/highlightMode":								"'.highlightMode'",
                "bevelEmboss/highlightColor":								"'.highlightColor'",
                "bevelEmboss/highlightOpacity":							"'.highlightOpacity'",
                "bevelEmboss/shadowMode":								"'.shadowMode'",
                "bevelEmboss/shadowColor":								"'.shadowColor'",
                "bevelEmboss/shadowOpacity":							"'.shadowOpacity'",
            "chromeFX/enabled":											"'.satin'",
                "chromeFX/mode2":											"'.blendMode'",
                "chromeFX/color":												"'.color'",
                "chromeFX/opacity":											"'.opacity'",
                "chromeFX/localLightingAngle":							"'.angle'",
                "chromeFX/distance":											"'.distance'",
                "chromeFX/blur":												"'.size'",
                "chromeFX/invert":											"'.invert'",
            "solidFill/enabled":												"'.colorOverlay'",
                "solidFill/mode2":												"'.blendMode'",
                "solidFill/color":													"'.color'",
                "solidFill/opacity":												"'.opacity'",
            "gradientFill/enabled":										"'.gradientOverlay'",
                "gradientFill/mode2":											"'.blendMode'",
                "gradientFill/opacity":											"'.opacity'",
                //"gradientFill/gradient":										"'.'",		// No equivalent
                "gradientFill/gradientSmoothness":						"'.gradientSmoothness'",
                "gradientFill/angle":											"'.angle'",
                "gradientFill/type":												"'.style'",
                "gradientFill/reverse":										"'.reverse'",
                "gradientFill/align":											"'.alignWithLayer'",
                "gradientFill/scale":											"'.scale'",
                "gradientFill/offset":											"'.offset'",
            "patternFill/enabled":											"'.patternOverlay'",
                "patternFill/mode2":											"'.blendMode'",
                "patternFill/opacity":											"'.opacity'",
                "patternFill/align":												"'.linkWithLayer'",
                "patternFill/scale":												"'.scale'",
                "patternFill/phase":											"'.offset'",
            "frameFX/enabled":											"'.stroke'",
                "frameFX/mode2":												"'.blendMode'",
                "frameFX/color":												"'.color'",
                "frameFX/size":													"'.size'",
                "frameFX/opacity":												"'.opacity'",
                "frameFX/style":												"'.position'",
        };
        
        // Array that converts property match names to their compact English scripting statements.
        // 
        var propCompactEnglishScriptingExprs =
        {
            "ADBE Text Animator Properties":	"",
        };
    
        function rd_GimmePropPath_findCompItemNum(comp)
        {
            var itemNum = 0, item;
            
            for (var i=1; i<=app.project.numItems; i++)
            {
                item = app.project.item(i);
                if ((item instanceof CompItem) && (item == comp))
                {
                    itemNum = i;
                    break;
                }
            }
            
            return itemNum;
        }
    
        function rd_GimmePropPath_buildPropPath()
        {
            // rd_GimmePropPath_getPropCompactEnglishExpr()
            // 
            // Description:
            // This function looks up the specified property's compact English
            // expression statement in the propCompactEnglishExprs associative
            // array, if available.
            // 
            // Parameters:
            //   prop - Property or PropertyGroup object.
            //   matchName - String representing the property's match name to
            //       use for lookup; in AE 6.5, this is overridden with the
            //       property's name.
            //   name - String representing the existing translation of the 
            //       property name.
            // 
            // Returns:
            // String representing the compact English equivalent, if available.
            // 
            function rd_GimmePropPath_getPropCompactEnglishExpr(prop, matchName, name)
            {
                var translatedName = propCompactEnglishExprs[matchName];
                
                if (translatedName != undefined)
                    return eval(translatedName);
                else
                    return ("(" + name + ")");
            }
            
            
            // rd_GimmePropPath_getPropCompactEnglishScriptExpr()
            // 
            // Description:
            // This function determines if the specified property has special 
            // naming when used via Scripting. Otherwise, it'll use the same 
            // as for expressions.
            // 
            // Parameters:
            //   prop - Property or PropertyGroup object.
            //   matchName - String representing the property's match name to
            //       use for lookup.
            //   name - String representing the existing translation of the 
            //       property name.
            // 
            // Returns:
            // String representing the compact English equivalent for Scripting, if available.
            // 
            function rd_GimmePropPath_getPropCompactEnglishScriptExpr(prop, matchName, name)
            {
                var translatedName = propCompactEnglishScriptingExprs[matchName];
                
                if (translatedName == undefined)
                    return rd_GimmePropPath_getPropCompactEnglishExpr(prop, matchName, name);
                else
                    return ("(" + name + ")");
            }
            
            
            var currProp = lastQueriedProp;
            
            if (currProp == null)
                return;
            
            // Get the preferred root object, and set a value representing it
            var rootObj;
            rootObj = 8;
    
            
            var scriptRefCollapse = false;
            var refModeAbs = false;
            var propNameRefsByMatchName = false;
            var propNameRefsByName = true;
            var propNameRefsByIndex = false;
            var propNameCompactEnglish = false;
            
            // Traverse up the property tree from the current property, until reaching the layer
            var scriptCode = "", exprCode = "";
            var name, compactName, compactScriptName;
            
            while (currProp.parentProperty != null)
            {
                // Reference by property index
                if ((currProp.parentProperty.propertyType == PropertyType.INDEXED_GROUP) && propNameRefsByIndex)
                    name = currProp.propertyIndex;
                else
                {
                    // Reference by match name or name
                    if (propNameRefsByMatchName) // && (currProp.parentProperty.propertyType == PropertyType.NAMED_GROUP))
                        name = "\"" + ((currProp.matchName != "") ? currProp.matchName : currProp.name) + "\"";
                    else
                        name = "\"" + currProp.name + "\"";
                }
                
                //alert('"'+currProp.name+'" = "'+currProp.matchName+'"; name="'+name+'", exprCode="'+exprCode+'"');
                
                // For compact English conversion, check for compact English equivalent
                if (propNameCompactEnglish)
                {
                    compactName = rd_GimmePropPath_getPropCompactEnglishExpr(currProp, currProp.matchName, name);
                    compactScriptName = rd_GimmePropPath_getPropCompactEnglishScriptExpr(currProp, currProp.matchName, name);
                    
                    scriptCode = compactScriptName + scriptCode;
                    exprCode = compactName + exprCode;
                }
                else
                {
                    scriptCode = (scriptRefCollapse ? "" : ".property") + "(" + name + ")" + scriptCode;
                    exprCode = "(" + name + ")" + exprCode;
                }
                
                // Traverse up the property tree
                currProp = currProp.parentProperty;
            }
            
            // Prefix the layer reference, if requested
            if (rootObj >= 4)				// Root Object = Layer
            {
                name = (propNameRefsByIndex) ? currProp.index : "\"" + currProp.name + "\"";
                
                if (propNameCompactEnglish)
                {
                    // If the sub-layer property is a property group, add the missing period
                    scriptCode = "layer(" + name + ")" + (((currProp != null) && (currProp.propertyType != PropertyType.PROPERTY)) ? "." : "") + scriptCode;
                    
                    if (rootObj > 4)
                        exprCode = "layer(" + name + ")." + exprCode;
                    else
                        exprCode = "thisLayer." + exprCode;
                }
                else
                {
                    scriptCode = "layer(" + name + ")" + scriptCode;
                    
                    if (refModeAbs || (rootObj > 4))
                        exprCode = "layer(" + name + ")" + exprCode;
                    else
                        exprCode = "thisLayer" + exprCode;
                }
            }
            
            // Prefix the comp reference, if requested
            if (rootObj >= 6)				// Root Object = Comp
            {
                // Determine the comp's item number in the Project window
                var compItemNum = rd_GimmePropPath_findCompItemNum(app.project.activeItem);
                //alert("item# "+compItemNum);
    
                scriptCode = "item(" + compItemNum + ")." + scriptCode;
                if (refModeAbs)
                    exprCode = "comp(\"" + app.project.activeItem.name + "\")." + exprCode;
                else
                    exprCode = "thisComp." + exprCode;
            }
            
            // Prefix the application and project references, if requested, for the script code
            if (rootObj >= 8)				// Root Object = Application
                scriptCode = "app.project." + scriptCode;
            
            // Update the code fields
            // grp.viaScript.viaScriptCode.text = scriptCode;
            // grp.viaExpr.viaExprCode.text = exprCode;
            return exprCode;
        }
    
        function rd_GimmePropPath_doGetPropPath()
        {
            // rd_GimmePropPath_findDeepestSelectedProp()
            // 
            // Description:
            // This function determines the deepest selected property or property group.
            // Assumes a single composition is selected or active.
            // 
            // Parameters:
            // None
            // 
            // Returns:
            // Property or PropertyGroup object if successful; null if no property or
            // property group, or if multiple of them, are selected.
            // 
            function rd_GimmePropPath_findDeepestSelectedProp()
            {
                var comp = app.project.activeItem;
                var deepestProp, numDeepestProps = 0, deepestPropDepth = 0;
                var prop;
                
                for (var i=0; i<comp.selectedProperties.length; i++)
                {
                    prop = comp.selectedProperties[i];
                    
                    if (prop.propertyDepth >= deepestPropDepth)
                    {
                        if (prop.propertyDepth > deepestPropDepth)
                            numDeepestProps = 0;
                        deepestProp = prop;
                        numDeepestProps++;
                        deepestPropDepth = prop.propertyDepth;
                    }
                    else
                        continue;
                }
                
                return (numDeepestProps > 1) ? null : deepestProp;
            }
            
            
            var prop;
            
            // Check that a single comp is selected or active
            if ((app.project.activeItem == null) || !(app.project.activeItem instanceof CompItem))
            {
                // alert(rd_GimmePropPath_localize(rd_GimmePropPathData.strErrNoCompSel), rd_GimmePropPathData.scriptName);
                return;
            }
            
            // prop = rd_GimmePropPath_findDeepestSelectedProp();
            prop = queryProp;
            if (prop == null)
            {
                // alert(rd_GimmePropPath_localize(rd_GimmePropPathData.strErrNoSinglePropSel), rd_GimmePropPathData.scriptName);
                return;
            }
            lastQueriedProp = prop;                
            
            // Build the property path
            return rd_GimmePropPath_buildPropPath();
        }
    
        return rd_GimmePropPath_doGetPropPath()
    }

})();


