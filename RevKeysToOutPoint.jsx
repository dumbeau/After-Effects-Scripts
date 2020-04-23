//Add reversed initial keyframes to out point on selected properties

(function() {  
    var differentSlidersForProperties = true;  
    var composition = app.project.activeItem;  
    if (!composition || !(composition instanceof CompItem))  
        return alert("Please open a composition and select some properties\n\nyou silly goose");
  
    app.beginUndoGroup("Add Controllers");  
    forSelectedProperties(addExpression); 
    app.endUndoGroup();
  
    function forSelectedProperties(callback) {  
        var selectedProperties = composition.selectedProperties;  
        if(selectedProperties.length == 0){
            return alert("You didn't select any properties so idk what you want me to do ¯\_(ツ)_/¯.  \n\nReally though you need to have properties selected.")
            }
        for (var i = 0, il = selectedProperties.length; i < il; i++) {  
            callback(selectedProperties[i]);
        }
    }
    function addExpression(property) {  
        if (!property.canSetExpression) return;
            var expression = 'key1 = key(1).time-inPoint; key2 = key(numKeys).time-inPoint; keyD = key2 - key1; if(time >= (outPoint - keyD)){ valueAtTime((inPoint+keyD)-(time-(outPoint-keyD))); }else{ value;}';  
            property.expression = expression;
    }
})();