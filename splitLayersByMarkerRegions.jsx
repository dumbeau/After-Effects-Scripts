(function() {
function splitByMarkerRegions(){
	app.beginUndoGroup("Split selected comps by region markers");
	if (app.project.activeItem && app.project.activeItem instanceof CompItem) {
	  var myComp = app.project.activeItem;
	  if (myComp.selectedLayers.length > 0) {
        for (var p = myComp.selectedLayers.length - 1; p >= 0; p--) {
            var myLayer = myComp.selectedLayers[p];
        
            for (var i = myLayer.property("marker").numKeys; i >= 1; i--) {
            var newLayer = myLayer.duplicate();
            newLayer.inPoint = myLayer.property("marker").keyTime(i);
            newLayer.outPoint = myLayer.property("marker").keyTime(i) + newLayer.marker.keyValue(i).duration;
            var layerMarkers = newLayer.property("marker").numKeys;
            for (var l = layerMarkers; l >= 1; l--){          
                if(i != l){
                    newLayer.property("marker").removeKey(l);
                    };
                }
            }
            if (myLayer.property("marker").numKeys > 0) {
                myLayer.outPoint = myLayer.property("marker").keyTime(1);
            }
            myLayer.remove();
        }		
	  }
	}
	app.endUndoGroup();
}
splitByMarkerRegions();
})();