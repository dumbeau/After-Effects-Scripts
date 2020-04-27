//Add expression to selected properties
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
        
 
            //Replace this variable's string value with your favorite expression
            var expression = 'key1 = key(1).time-inPoint;\nkey2 = key(numKeys).time-inPoint;\nkeyD = key2 - key1;\nif(time >= (outPoint - keyD)){\nvalueAtTime((inPoint+keyD)-(time-(outPoint-keyD)));\n}else{value;}';  
            property.expression = expression;
    }
})();
