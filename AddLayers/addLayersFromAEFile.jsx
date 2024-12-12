function addLayersFromAEFileComp(AEProjectFileNameOrPath, sourceCompName, assetLayerNames){

	// Add your own folder paths to check for your Asset AE Files
	var scriptDir = $.fileName.slice(0, $.fileName.lastIndexOf("/"));	
	var checkFolderPaths = [		
		// 'C:/Add/Your/Own/Path/Here',
		scriptDir + '/AEFiles'
	]

	
	var AEProjectFileName = File(AEProjectFileNameOrPath).displayName;
	

	//Import Only if only AEProjectFileNameOrPath is defined.
	if(AEProjectFileNameOrPath && !sourceCompName && !assetLayerNames){
		var projectFolder = findFolder(AEProjectFileName)
		if (projectFolder){
			// Maybe add prompt to rename old folder and import a new one ???
			var userConfirmSelection = confirm("Project Folder: " + projectFolder.name + "\nAlready exists in this project\n\nRename the old folder and import file?", true, "Ya silly goose");	
			if (userConfirmSelection){
				projectFolder.name = projectFolder.name + " - Old";
				attemptAEFileImport(AEProjectFileNameOrPath);
			}
		} else {
			attemptAEFileImport(AEProjectFileNameOrPath);
		}
		return	

		function attemptAEFileImport(fileNameOrPath){
			var AEfile = "";	
			var test = File(fileNameOrPath)	
			if(File(fileNameOrPath).exists){
				AEfile = fileNameOrPath;	
			} else {
				AEfile = checkFoldersForAEFile(fileNameOrPath);
			}
			
			try {
				importAEFile(AEfile);
			} catch (e) {
				alert("Failed to import " + AEfile);
				return
			};
		}
	}

	//Make assetLayerNames an array if it is a string
	var assetLayerNames = assetLayerNames;
	if (typeof assetLayerNames === 'string' || assetLayerNames instanceof String){
		assetLayerNames = [assetLayerNames];
	}
	
    // Set the path to the file you want to import    
	var activeItem = app.project.activeItem;
	if (!activeItem){app.activeViewer.views[0].setActive();}
	activeItem = app.project.activeItem;

	var selectedLayers = activeItem.selectedLayers;
	var topSelectedLayer = (selectedLayers.length > 0) ? activeItem.layer(getTopSelectedLayerIndex()) : null;
	var targetComp = activeItem;
	

    // var sourceComp = getCompByName(sourceCompName);
    var sourceComp = getCompWithinFolder(AEProjectFileName, sourceCompName, true);

	//Import Source AE File if Source comp does not exist
	if (!(sourceComp instanceof CompItem)) {

		//Check as full path first
		if(!File(AEProjectFileNameOrPath).exists){
			// Check in User assets folder			
			AEProjectFilePath = checkFoldersForAEFile(AEProjectFileName);			
		}

		try {
			var importedFile = importAEFile(AEProjectFilePath);			
			sourceComp = getCompWithinFolder(AEProjectFileName, sourceCompName)
			var test = ""			
		} catch (e) {
			alert("Failed to import " + sourceCompName);
			return
		};
	}

	


		

	var assets = new AssetLayerFactory();	

	app.beginUndoGroup('Add Layers from File and Comp');	
	assets.unsetParentLayers();
	assets.copyLayersToComp(targetComp);	
	assets.resetParentLayers();
	assets.setCopiedLayersInOutPoints();
	assets.setLayerControls();	
	assets.placeCenteredLayersInCenter();	
	assets.makeFlaggedCompLayersUnique();
	deselectSelectedLayers();
	assets.selectCopiedLayers();
	
	app.endUndoGroup();
	// return assets.copiedLayers;	

	

	function AssetLayerFactory(){
		function AssetLayer(sourceLayer) {
			//Constructor
			this.sourceLayer = sourceLayer;		
			this.sourceComp = sourceComp;				
			this.copiedLayer = null;
			

			
			// this.parentRelativeIndex = parentRelativeIndex;

			this.isSourceLayerCentered = function(){
				var pos = this.sourceLayer.position.value;
				isXCenter = (pos[0] == this.sourceComp.width/2);
				isYCenter = (pos[1] == this.sourceComp.height/2);					
				return (isXCenter && isYCenter);
			}
			this.isCentered = this.isSourceLayerCentered();

			this.isCompLayer = (sourceLayer.source instanceof CompItem)	
				

			function getLayerControlProperties(layer){
				function LayerControlProperty(property, value){
					this.property = property;	
					this.propertyValue = value;	
					this.relativePropertyValue = value - layer.index;	
				}

				var layerControlProperties = [];
				// var EffectMatchNamesWithLayerControls = ["ADBE Layer Control", "CS Composite", "ADBE Set Matte3"]
				var LayerControlPropertyMatchNames =  ["ADBE Layer Control-0001", "CS Composite-0004", "ADBE Set Matte3-0001"]

				for (var i = 1; i <= layer.effect.numProperties; i++) {
					var effect = layer.effect(i);
					// Loop through the effect's properties
					for (var j = 1; j <= effect.numProperties; j++) {
						var prop = effect.property(j);
						// Check if the property match name begins with any of the layerControlNames
						// Apparently LAYER_INDEX is 6421 and not 6212??? 
						// if (prop.propertyType == PropertyValueType.LAYER_INDEX || prop.propertyType == 6212) {				
						// if (prop.propertyType == PropertyValueType.LAYER_INDEX ) {

						// if (LayerControlPropertyMatchNames.indexOf(prop.matchName) > -1) {		
						if (ArrayIncludes(LayerControlPropertyMatchNames, prop.matchName)) {
							try{
								prop.value;					                
							} catch (e) {};	
							layerControlProperties.push(new LayerControlProperty(prop, prop.value));
						} 
					}
				}
				return layerControlProperties;
			}
			this.sourceLayerControlProperties = getLayerControlProperties(this.sourceLayer);	
			this.copiedLayerControlProperties = [];	


			// this.parentLayerRelativeIndex = this.getParentLayerRelativeIndex();
			this.parentLayerRelativeIndex = (this.sourceLayer.parent) ? this.sourceLayer.parent.index - this.sourceLayer.index : 0;
			this.getParentLayerRelativeIndex = function(){
				var relativeIndex = 0;
				if (this.sourceLayer.parent){
					relativeIndex = this.sourceLayer.parent.index - this.sourceLayer.index;
				}
				return
			}

			this.setInOutPoints = function(){
				var extendLayerToEnd = this.sourceLayer.outPoint > this.sourceComp.duration ? true : false;	
				var extendLayerToBeginning = this.sourceLayer.startTime < 0 ? true : false;	

				if (extendLayerToBeginning){
					var originalEndTime = this.sourceLayer.outPoint;
					this.copiedLayer.startTime = 0; //Setting start time adds an undo group?
					this.copiedLayer.outPoint = originalEndTime;
				} else {
					this.copiedLayer.startTime = targetComp.time;
				}
				if (extendLayerToEnd){
					this.copiedLayer.outPoint = targetComp.duration;
				}
			};

			this.unsetParentLayer = function(){
				if(this.sourceLayer.parent){
					// this.sourceLayer.parent = null;
					this.sourceLayer.setParentWithJump(null);
				}
			}

			this.copyToComp = function(targetComp){					
				

				this.sourceLayer.copyToComp(targetComp);				

				this.copiedLayer = (topSelectedLayer) ? targetComp.layer(topSelectedLayer.index-1) : targetComp.layer(1)				

				// if(this.copiedLayer.name != this.sourceLayer.name){
				// 	alert(this.copiedLayer.name + " != " + this.sourceLayer.name);
				// }

				this.copiedLayerControlProperties = getLayerControlProperties(this.copiedLayer);				

				// this.setInOutPoints();
				
				return this.copiedLayer;		
			}

			this.resetParentLayer = function(){
				if(this.parentLayerRelativeIndex){	
					// this.sourceLayer.parent = this.sourceLayer.containingComp.layer(this.sourceLayer.index + this.parentLayerRelativeIndex);
					// this.copiedLayer.parent = this.copiedLayer.containingComp.layer(this.copiedLayer.index + this.parentLayerRelativeIndex);

					this.sourceLayer.setParentWithJump(this.sourceLayer.containingComp.layer(this.sourceLayer.index + this.parentLayerRelativeIndex));
					this.copiedLayer.setParentWithJump(this.copiedLayer.containingComp.layer(this.copiedLayer.index + this.parentLayerRelativeIndex));
				}				
			};

			this.setCopiedLayerControlProperties = function(){
				for (var i = 0; i < this.copiedLayerControlProperties.length; i++) {
					copiedLayerControlProperty = this.copiedLayerControlProperties[i];					
					copiedLayerControlProperty.property.setValue(this.copiedLayer.index + this.sourceLayerControlProperties[i].relativePropertyValue);
				}
			}
		}
		function getAssetLayers(comp, assetLayerNames){
			var comp = comp;
			var layerNamesToCopy = [];
			if (assetLayerNames.length == 2){

				var layer1 = comp.layer(assetLayerNames[0]);
				var layer2 = comp.layer(assetLayerNames[1]);			

				// Get all layers between these two layers
				if(!layer1 || !layer2){
					alert("One or more layers not found in " + comp.name);
					return [];
				}
				var topLayerIndex = Math.min(layer1.index, layer2.index);
				var bottomLayerIndex = Math.max(layer1.index, layer2.index);
				for (var i = topLayerIndex; i <= bottomLayerIndex; i++) {
					var layer = comp.layer(i);
					layerNamesToCopy.push(layer.name);						
				}

			} else {

				var foundNullLayer = false;
				for (var i = 0; i < assetLayerNames.length; i++) {						
					var assetLayer = comp.layer(assetLayerNames[i]);					
					if (!assetLayer){
						foundNullLayer = true;
						break;
					}
					layerNamesToCopy.push(assetLayer.name);
				}	
				if (foundNullLayer){
					alert("One or more layers not found in " + comp.name);
					return [];
				}
			}
			
			var returnAssetLayers = [];
			for(var i = 0; i < layerNamesToCopy.length; i++){
				returnAssetLayers.push(new AssetLayer(comp.layer(layerNamesToCopy[i])));
			}
			return returnAssetLayers;
		}
		this.assetLayers = getAssetLayers(sourceComp, assetLayerNames);				

		this.copiedLayers = [];
		this.copyLayersToComp = function(targetComp){
			if(selectedLayers.length == 0){this.assetLayers.reverse();}
			for (var i = 0; i < this.assetLayers.length; i++) {
				var copiedLayer = this.assetLayers[i].copyToComp(targetComp);
				this.copiedLayers.push(copiedLayer);
			}
		}

		
		this.setLayerControls = function(){
			for (var i = 0; i < this.assetLayers.length; i++) {
				this.assetLayers[i].setCopiedLayerControlProperties();
			}
		}

		this.selectCopiedLayers = function(){			
			for (var i = 0; i < this.assetLayers.length; i++) {
				this.assetLayers[i].copiedLayer.selected = true;
			}
		}

		this.unsetParentLayers = function(){
			for (var i = 0; i < this.assetLayers.length; i++) {
				this.assetLayers[i].unsetParentLayer();
			}
		}

		this.resetParentLayers = function(){
			for (var i = 0; i < this.assetLayers.length; i++) {
				this.assetLayers[i].resetParentLayer();
			}
		}

		this.setCopiedLayersInOutPoints = function(){
			
			for (var i = 0; i < this.assetLayers.length; i++) {
				sourceLayer = this.assetLayers[i].sourceLayer;
				copiedLayer = this.assetLayers[i].copiedLayer;

				var extendLayerToEnd = (sourceLayer.outPoint > sourceComp.duration)
				var extendLayerToBeginning = (sourceLayer.inPoint < 0)	

				if (extendLayerToBeginning){
					var originalEndTime = sourceLayer.outPoint;
					copiedLayer.startTime = 0; //Setting start time adds an undo group?
					copiedLayer.inPoint = 0;
					copiedLayer.outPoint = originalEndTime;
				} else {					
					copiedLayer.startTime = targetComp.time + (sourceLayer.inPoint);
					copiedLayer.inPoint = targetComp.time + (sourceLayer.inPoint);
				}
				if (extendLayerToEnd){
					copiedLayer.outPoint = targetComp.duration;
				}
			}			
		}

		this.makeFlaggedCompLayersUnique = function(){
			function makeCompLayersUnique(layers,deepCopy){

				deepCopy = deepCopy || false;
			
				var compLayers = [];
				for (var i = 0; i < layers.length; i++) {
					var layer = layers[i];
					if (layer.source instanceof CompItem) {
						compLayers.push(layer);
					}
				}
				
				
				//Determine different comp sources
				 var compLayerSources = [];
				 var compLayerDuplicates = [];
				for (var i = 0; i < compLayers.length; i++) {
					var layer = compLayers[i]; 
					compLayerSourceIndex = compLayerSources.indexOf(layer.source);
			
					if(compLayerSourceIndex == -1){
						compLayerSources.push(layer.source)
						var newComp = layer.source.duplicate();     
						compLayerDuplicates.push(newComp);
						compLayerSourceIndex = compLayerDuplicates.length-1        
						}
					layer.replaceSource(compLayerDuplicates[compLayerSourceIndex], true); 
					layer.name = layer.source.name;
				}
			}
			var compLayers = [];
			for (var i = 0; i < this.assetLayers.length; i++) {
				assetLayer = this.assetLayers[i];
				if (assetLayer.isCompLayer && assetLayer.sourceLayer.name.slice(-1) == "*") {
					compLayers.push(this.assetLayers[i].copiedLayer);
				}
			}			
			makeCompLayersUnique(compLayers);			
		}
		
		this.placeCenteredLayersInCenter = function(){
			for (var i = 0; i < this.assetLayers.length; i++) {
				assetLayer = this.assetLayers[i];
				if (assetLayer.isCentered && !assetLayer.copiedLayer.parent){
					assetLayer.copiedLayer.position.setValue([targetComp.width/2, targetComp.height/2]);
				}
			}
		}
	}

	function checkFoldersForAEFile(AEProjectFileName){
		var fullAEFilePath = null;
		for (var i = 0; i < checkFolderPaths.length; i++) {	
			checkFolder = Folder(checkFolderPaths[i]);
			fullAEFilePath = checkFolder.fullName + "/" + AEProjectFileName;	
			if(File(fullAEFilePath).exists){
				break;
			}				
		}	
		return fullAEFilePath;
	}

	function importAEFile(pathToFile){        
        // Create a variable for the imported project
        var importedProject;         
        // Import the project file
        try {
            importedProject = app.project.importFile( new ImportOptions(new File(pathToFile)) );
        } catch (err) {
            alert("Error importing file: " + err);			
        }
        if (!importedProject) {
            alert("File import failed.");
        }
		importedProject.selected = false;
		return importedProject;
    }

	function deselectSelectedLayers(){
		for (var i = 0; i < app.project.activeItem.selectedLayers.length; i++) {
			app.project.activeItem.selectedLayers[i].selected = false;
		}
	}

	function getTopSelectedLayerIndex(){
		var selectedLayers;
		try {selectedLayers = app.project.activeItem.selectedLayers; } catch (e) {
			selectedLayers = [];
			}
		var topLayerIndex;
		
		if (selectedLayers.length > 0){
			var topLayerIndex = selectedLayers[selectedLayers.length - 1].index;
			} else {
			topLayerIndex = 1;
			}
		return topLayerIndex
	}	
	
	function getCompByName(compName){ //function to select composition
		var returnComp = null;
		for (var i = 1; i <= app.project.numItems; i ++){
			if ((app.project.item(i) instanceof CompItem) && (app.project.item(i).name == compName)){
				returnComp = app.project.item(i);
				break;
			}    
		}
		if(returnComp == null){
			return false
		}else{
			return returnComp
		}
	}	

	function getCompWithinFolder(folderName, compName, ignoreErrors){
		var ignoreErrors = ignoreErrors || false;

		var folder = findFolder(folderName);
		if (!folder){
			if (!ignoreErrors){
				alert("Folder not found: " + folderName);
			}
			return null;
		}
		for (var i = 1; i <= folder.numItems; i ++){
			if ((folder.item(i) instanceof CompItem) && (folder.item(i).name == compName)){
				return folder.item(i);
			} 
		}		
		if (!ignoreErrors){
			alert("Comp not found in \"" + folderName + "\" folder:\n" + compName);
		}
		return null;
	}

	function findFolder(FolderName){ //function to select folder
		var returnFolder = null;
		for (var i = 1; i <= app.project.numItems; i ++){
			if ((app.project.item(i) instanceof FolderItem) && (app.project.item(i).name == FolderName)){
				returnFolder = app.project.item(i);
				break;
			}    
		}
		return returnFolder;
	}

	function ArrayIncludes(array, value){
		for (var i = 0; i < array.length; i++){
			if (array[i] == value){
				return true
			}
		}
		return false
	}
}