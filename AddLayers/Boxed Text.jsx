(function() {
    #include "AE/addAsset.jsx";
        
    var AEFileName = "MyAssets.aep";

    var scriptFileName = File($.fileName).name.replace(/\.jsx$/, "");
    // unescape the script file name for use in the AE project
    scriptFileName = decodeURI(scriptFileName);
    addAsset(AEFileName,scriptFileName);
})();