(function() {
#include "addLayersFromAEFile.jsx";

// In "AddLayersFromAEFile.jsx", be sure to add your folder paths containing your AE asset files.
// addLayersFromAEFileComp("YourAssetFile.aep","CompInFileContainingLayer","LayerNameInComp")
// addLayersFromAEFileComp("YourAssetFile.aep","CompInFileContainingLayer",["BottomLayerNameInComp","TopLayerNameInComp"])

addLayersFromAEFileComp("HAI_General Assets_2025.aep","HAI - General Assets",["Ruler-Null B","Ruler"])

// If you only specify the first parameter, the script will only import the AE file and not add any layers.
// addLayersFromAEFileComp("HAI_General Assets_2025.aep")
})();


