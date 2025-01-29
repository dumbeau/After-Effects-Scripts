(function() {
	if(Array.prototype.indexOf == undefined){	
		Array.prototype.indexOf = function ( item ) {
			var index = 0, length = this.length;
			for ( ; index < length; index++ ) {
					if ( this[index] === item )
								return index;
			}
			return -1;
		};
	}

	function replaceGettyAssets(){
	
	
		// Check for selected items in Project Panel
		var selectedItems = app.project.selection;
		if (selectedItems.length === 0) {
			alert("Select one or more Getty assets in the Project panel.");
			return;
		}
	
		if ((selectedItems.length > 1)) {
	
			// var newAssetFile = File.openDialog("Select any file in the folder containing your Getty assets.");	
			var newAssetFile = File.openDialog("Select any file in the folder containing your Getty assets.");	
			if (!newAssetFile){
				return;
			}
			app.beginUndoGroup("Replace Getty Assets");
	
			var folder = newAssetFile.parent;
			var files = folder.getFiles();
	
			//Filter out any non-Getty assets or comp Getty assets		
			var gettyFiles = [];
			for (var i = 0; i < files.length; i++){
				if(files[i].name.indexOf("GettyImages") > -1){
					gettyFiles.push(files[i]);
				}
			}
			files = gettyFiles;
	
	
			var itemsNotFound = [];
			var anyItemsWithDifferentFrameRate = false;
			var anyItemsWithDifferentAspectRatio = false; // Not implemented yet!!!
	
			for(var i = 0; i < selectedItems.length; i++){
				var selectedAsset = selectedItems[i];
				var selectedAssetID = extractGettyID(selectedAsset.file.name);
	
				for (var j = 0; j < files.length; j++){				
					var file = files[j];
					var fileID = extractGettyID(file.name);
	
					if (fileID == selectedAssetID){
						precompAndReplaceAsset(selectedAsset, file);
						break;
					}
					if (j == files.length - 1){
						itemsNotFound.push(selectedAsset.name);
					}
				}
			}
			if (itemsNotFound.length > 0){
				alert("The following Getty assets were not found:\n\n" + itemsNotFound.join("\n") + "\n\nThese items will remain selected.");
				for (var i = 0; i < selectedItems.length; i++){
					if( itemsNotFound.indexOf(selectedItems[i].name) == -1){
						selectedItems[i].selected = false;
					}
				}
			}
			if (anyItemsWithDifferentFrameRate){
				alert("Some Getty assets have a different frame rate than the composition. These assets have been colored yellow.");
			}
			if (anyItemsWithDifferentAspectRatio){
				alert("Some Getty assets have a different aspect ratio than the composition. These assets have been colored yellow.");
			}			
		} else {
			var newAssetFile = File.openDialog("Replace footage file (" + selectedItems[0].name + ")");
			if (!newAssetFile){
				return;
			}
			app.beginUndoGroup("Replace Getty Asset");
			precompAndReplaceAsset(selectedItems[0], newAssetFile);
		}
		app.endUndoGroup();
	
		function precompAndReplaceAsset(footageItem, newAssetFile){	
			var footageItemIsImage = (footageItem.duration == 0);
	
			if (footageItem instanceof FootageItem) {
	
				//Check that footageItem is used in the project
				var compsContainingItem = footageItem.usedIn
				if (compsContainingItem.length == 0){
					confirm(footageItem.name + " is not used in any compositions.\n\n Remove from project?", true);
					footageItem.remove();				
					return true;
				}
	
				// Check if the item is a Getty preview asset
				var footageFileName = footageItem.file.name;
				if (footageFileName.toLowerCase().indexOf("getty") == -1) {
					return false;  //Item is not a getty asset
				}
				// Create a composition with the Getty asset and replace all existing layer instances of the asset			
				if (footageItemIsImage){				
					assetPrecomp = app.project.items.addComp(newAssetFile.name, footageItem.width, footageItem.height, footageItem.pixelAspect, compsContainingItem[0].frameDuration, compsContainingItem[0].frameRate);				
				} else {
					assetPrecomp = app.project.items.addComp(newAssetFile.name, footageItem.width, footageItem.height, footageItem.pixelAspect, footageItem.duration, footageItem.frameRate);				
				}
				
				var assetLayer = assetPrecomp.layers.add(footageItem);
	
				var originalFrameRate = footageItem.frameRate;
				var originalAspectRatio = footageItem.width / footageItem.height;
				
				footageItem.replace(newAssetFile);	
				var newFrameRate = footageItem.frameRate;
				var newAspectRatio = footageItem.width / footageItem.height;
	
				//If the frame rate of the new asset is different from the comp, color this footageItem yellow.
				if (!footageItemIsImage && (originalFrameRate != newFrameRate)){
					footageItem.label = 2;
					anyItemsWithDifferentFrameRate = true;
				}
	
				//If the aspect ratio of the new asset is different from the comp, color this footageItem yellow.
				// !!! Not implemented yet!!!
				var aspectRatioErrorTolerance = 0.2;			
				if (Math.abs(originalAspectRatio - newAspectRatio) > aspectRatioErrorTolerance){
					alert("Aspect ratio of " + footageItem.name + " has changed!!!");
					alert("1: " + originalAspectRatio + "\n2: " + newAspectRatio);
					footageItem.label = 2;
					anyItemsWithDifferentAspectRatio = true;
				}
	
				
				
				//Scale the updated layer to the width of the comp
				widthScale = (assetPrecomp.width*100 / assetLayer.width);			
				assetLayer.scale.setValue([widthScale, widthScale]);
	
				//Update so that the layer is 3d enabled if the original layer was 3d enabled
				
				//Replace all layers with the precomp
				for (var i = 0; i < compsContainingItem.length; i++) {
					var comp = compsContainingItem[i];
					var layers = comp.layers;
					for (var j = 1; j <= layers.length; j++) {
						var layer = layers[j];
						if (layer.source === footageItem) {
							layer.replaceSource(assetPrecomp, false); //Won't fix expressions, keep same layer name
							if(footageItemIsImage){
								layer.timeRemapEnabled = true;                                
								layer.timeRemap.removeKey(2);
								
							}
							//Turn on continuous rasterization for layer
							layer.collapseTransformation = true;
						}
					}
				}			
			}		
		}  
		function extractGettyID(fileNameString){
			fileNameString = fileNameString.toLowerCase();
			var gettyIndex = fileNameString.indexOf("gettyimages");
			if (gettyIndex === -1) {
				return "";
			}
			var cutFileNameString = fileNameString.substring(gettyIndex);			
			var fileNameArray = cutFileNameString.split(/[-\s]/);
			var gettyID = fileNameArray[fileNameArray.indexOf("gettyimages")+1].split(".")[0];				
			return gettyID;
		}
		return;	
	}
	replaceGettyAssets();
})();