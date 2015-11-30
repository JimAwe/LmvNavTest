
// LoadModel.js
//
// This file handles changing Models and Views (3D/2D).  All the models come from my bucket and are authorized by 
// a AuthToken Service running in the cloud.  If you want to extend this, you'll have to clone the AuthTokenServer 
// project and setup your own version with the appropriate ConsumerKey and SecretKey from your app.
//
// Jim Awe
// Autodesk, Inc.


    // some global vars  (TBD: consider consolidating into an object)
var _viewerMain = null;             // the viewer
var _viewerSecondary = null;        // the viewer
var _loadedDocument = null;
var _loadedSecondaryDocument = null;
var _selectedPlantModel = null;
var _views2D = null;
var _views3D = null;

var _blockEventMain = false;
var _blockEventSecondary = false;
var _blockPropagateSelection = false;

var _secondaryModelLeafNodes = null;

    // setup for STAGING
/*var _viewerEnv = "AutodeskStaging";
var _myAuthToken = new MyAuthToken("STG");

var _lmvModelOptions = [
    { label : "Urban House (Revit)",        urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3N0Zy9VcmJhbiUyMEhvdXNlJTIwLSUyMG5ldy5ydnQ="},
    { label : "rme-basic-sample (Revit)",   urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6am1hYnVja2V0My9ybWVfYmFzaWNfc2FtcGxlX3Byb2plY3QucnZ0"},
    { label : "ViewTest1 (Revit)",          urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6am1hYnVja2V0My9WaWV3VGVzdDEucnZ0"},
    { label : "Factory (Navisworks)",       urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6am1hYnVja2V0My9Db21wbGV0ZWQlMjBQbGFudCUyMExheW91dCUyMGNvbnN0cnVjdGlvbi5ud2Q="},
    { label : "Lego Guy (Fusion)",          urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6am1hYnVja2V0My9sZWdvX2d1eTIwMTQwMTMxMDkxOTU4LmYzZA=="},
    { label : "Utility Knife (Fusion)",     urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6am1hYnVja2V0My9VdGlsaXR5X0tuaWZlMjAxNDAxMjkxNDAwNDEuZjNk"},
    { label : "Bomba KSB ETA 80-20.f3d (Fusion)",     urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3N0Zy9Cb21iYSUyMEtTQiUyMEVUQSUyMDgwLTIwJTIwLSUyMDVDViUyMC0lMjAxNzAwcnBtJTIwLSUyMCUyMHY1LmYzZA=="},
    { label : "F10K (Fusion)",          urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3N0Zy9GMTBLLmYzZA=="},
    { label : "KAW_48_3D _2 (DWG)",        urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3N0Zy9LQVdfNDhfM0QlMjBfMi5kd2c="},
    { label : "2D Floorplan (DWG)",        urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3N0Zy8yRCUyMEZsb29ycGxhbi5kd2c="}
];*/

    // setup for PRODUCTION
var _viewerEnv = "AutodeskProduction";
var _myAuthToken = new MyAuthToken("PROD");

var _lmvModelOptions = [
    // { label : "House",        urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE1LTA2LTE2LTE4LTE2LTUxLWhucHM0dG45ZDdmaTR3bnFhY2Fjdzl4b2poeHAvR2F0ZUhvdXNlLm53ZA=="},
    // { label : "RobotArm",     urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE1LTA2LTE2LTE4LTEwLTUyLWhucHM0dG45ZDdmaTR3bnFhY2Fjdzl4b2poeHAvUm9ib3RBcm0uZHdmeA=="},
    // { label : "Seat",         urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE1LTA2LTE2LTE4LTM4LTE0LWhucHM0dG45ZDdmaTR3bnFhY2Fjdzl4b2poeHAvU2VhdC5kd2Y="},

    { label : "Urban House (Revit)",        urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3Byb2QvVXJiYW4lMjBIb3VzZSUyMC0lMjBuZXcucnZ0"},
    { label : "Chruch (Revit)",             urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3Byb2QvQ2h1cmNoUmVub3ZhdGlvbjIucnZ0"},
    { label : "SaRang - Struct (Revit)",    urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3Byb2QvU2FSYW5nLVN0cnVjdHVyZS0yMDE1LnJ2dA=="},
    //{ label : "SaRang - ArchBase (Revit)",  urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3Byb2QvU2FSYW5nLUFyY2gtQmFzZS0yMDE1LnJ2dA=="},
    //{ label : "SaRang - ArchSkin (Revit)",  urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3Byb2QvU2FSYW5nLUFyY2gtU2tpbi0yMDE1LnJ2dA=="},
    { label : "rme-basic-sample (Revit)",   urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3Byb2Qvcm1lX2Jhc2ljX3NhbXBsZV9wcm9qZWN0LnJ2dA=="},
    { label : "Audobon Structure (Revit)",  urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3Byb2QvQXVkb2JvbiUyMC0lMjBTdHJ1Y3R1cmUucnZ0"},
    
    { label : "Factory (Navisworks)",       urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6am1hYnVja2V0NC9Db21wbGV0ZWQlMjBQbGFudCUyMExheW91dCUyMGNvbnN0cnVjdGlvbi5ud2Q="},
    { label : "Gatehouse (Navisworks)",     urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6am1hYnVja2V0NC9nYXRlaG91c2UyLm53ZA=="},
    { label : "Trapelo (Navisworks)",       urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3Byb2QvVFJBUEVMTy5ud2Q="},
    { label : "Millenium (Navisworks)",     urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3Byb2QvTWlsbGVuaXVtJTIwU3VwZXJtYXJrZXQubndk"},
    
    { label : "Lego Man (Fusion)",          urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6am1hYnVja2V0NC9sZWdvX2d1eTIwMTQwMTMxMDkxOTU4LmYzZA=="},
    { label : "Utility Knife (Fusion)",     urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6am1hYnVja2V0NC9VdGlsaXR5X0tuaWZlMjAxNDAxMjkxNDAwNDEuZjNk"},
    { label : "Fender Guitar (Fusion)",     urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6am1hYnVja2V0NC9GZW5kZXJfU3RyYXRfTlguc3RwLmM5ZTZhODg0LWU0NWItNGQ3ZC1iNjcyLTY2NjM1OTVhYTRkOTIwMTQwMjIwMTA0OTA3LmYzZA=="},
    { label : "Go Kart (Fusion)",           urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3Byb2QvZ29rYXJ0LVY0LmYzZA=="},
    { label : "Rally Fighter (Fusion)",     urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3Byb2QvUmFsbHlGaWdodGVyMi5mM2Q="},
    
    { label : "Whiskey Drinks (DWG)",       urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3Byb2Qvd2hpc2tleS1kcmlua3MuZHdn"},
    { label : "Slip Form Paver (DWG)",      urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3Byb2QvU2xpcCUyMEZvcm0lMjBQYXZlci5kd2c="},
    { label : "Engine (DWG)",               urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3Byb2QvRW5naW5lJTIwTUtJSS5kd2c="},
    
    { label : "AC11 Institute (IFC)",       urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YWRza19xdWlja3N0YXJ0L0FDMTEtSW5zdGl0dXRlLVZhci0yLUlGQy5pZmM="},
    { label : "Hunter Residence (SKP)",     urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3Byb2QvTUFUVEhFV19IVU5URS1SRVMtMDRfRVBELnNrcA=="},

];

var _lmvPlantModelOptions = [

    {
        label: "1-PE-001 (Plant 3D)", urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3Byb2QvMS1QRS0wMDEtTW9kZWwuZHdmeA==",
        views:
        [
            { label: "1-A1-1001 (P&ID)", urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3Byb2QvMS1BMS0xMDAxLmR3Zng=" },
            { label: "1-A1-1002 (P&ID)", urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGJnX3Byb2QvMS1BMS0xMDAyLmR3Zng=" }
        ]
    }

];

function blankOutReportPane() {
    $("#pieChart").empty();
    $("#barChart").empty();
    $("#bar-chart").empty();
    $("#sheetThumbs").empty();

}

    // populate the popup menu with the avaialable models to load (from the array above)
function loadModelMenuOptions() {
        // add the new options for models
    var sel = $("#pu_modelToLoad");
    $.each(_lmvModelOptions, function(i, item) {
        sel.append($("<option>", { 
            value: i,
            text : item.label 
        }));
    });

    $.each(_lmvPlantModelOptions, function (i, item) {
        sel.append($("<option>", {
            value: i + _lmvModelOptions.length,
            text: item.label
        }));
    });

}

    // user selected a new model to load
 $("#pu_modelToLoad").change(function(evt) {  
     evt.preventDefault();
     
     var index = parseInt($("#pu_modelToLoad option:selected").val(), 10);
     
     // determine if regular model or plant model
     //
     if (index >= _lmvModelOptions.length) {
         index = index - _lmvModelOptions.length;
         console.log("Changing model to: " + _lmvPlantModelOptions[index].label);
         loadPlantDocument(_lmvPlantModelOptions[index])
     }
     else {
         console.log("Changing model to: " + _lmvModelOptions[index].label);
         loadDocument(_lmvModelOptions[index].urn);
     }

     uninitializePinPanel();
     unitializeThemePanel();
     blankOutReportPane();
});

    // populate the popup menu with the avaialable views to load (from the array above)
function loadViewMenuOptions() {
    var sel = $("#pu_viewToLoad");
    
    sel.find("option").remove().end();  // remove all existing options
    
            // add the 3D options
    $.each(_views3D, function(i, item) {
        sel.append($("<option>", { 
            value: i,
            text : item.name 
        }));
    });
    
    sel.append($("<option disabled>─────────────────</option>"));    // add a separator
    
        // add the 2D options
    $.each(_views2D, function(i, item) {
        sel.append($("<option>", { 
            value: i + 1000,    // make 2D views have a value greater than 1000 so we can tell from 3D
            text : item.name 
        }));
    });
}

// populate the popup menu with the avaialable views to load (from the array above)
function loadPlantViewMenuOptions(views) {
    var sel = $("#pu_viewToLoad");

    sel.find("option").remove().end();  // remove all existing options

    // add the 2D options
    $.each(views, function (i, item) {
        sel.append($("<option>", {
            value: i + 5000,    // make Plant 2D views have a value greater than 5000 so we can tell from others
            text: item.label
        }));
    });
}

    // user selected a new view to load
 $("#pu_viewToLoad").change(function(evt) {  
    evt.preventDefault();
     
    var index = parseInt($("#pu_viewToLoad option:selected").val(), 10);
     
    if (index >= 5000) {
        index -= 5000;
        console.log("Changing to 2D view: " + _selectedPlantModel.views[index].label);
        loadPlantSecondaryDocument(index);
    }
    else if (index >= 1000) {    // 2D views we gave a higher index to in the Popup menu
        index -= 1000;
        console.log("Changing to 2D view: " + _views2D[index].name);
        switchSheet();
        loadView(_loadedDocument, _viewerSecondary, _views2D[index]);
    }
    else {
        console.log("Changing to 3D view: " + _views3D[index].name);
        switchSheet();
        loadView(_loadedDocument, _viewerSecondary, _views3D[index]);
    }
});

function switchSheet() {
    
    if (_viewerSecondary !== null) {
        _viewerSecondary.tearDown();     // delete everything associated with the current loaded asset
    }

    _viewerSecondary.setUp();    // set it up again for a new asset to be loaded
}

function mainViewerSelectionChanged(event) {        
    if (_blockEventSecondary)
        return;
        
    // if a single item selected in 3D, select that same item in 2D.
    var curSelSetMain = _viewerMain.getSelection();
    //if (curSelSetMain.length === 1) {
    _blockEventMain = true;
    _viewerSecondary.select(curSelSetMain)//select objects in secondary view
    _blockEventMain = false;
    //}
}

function secondaryViewerSelectionChanged(event) {
    if (_blockEventMain)
        return;
                
    // if a single item, select and isolate same thing in 3D.
    var curSelSetSecondary = _viewerSecondary.getSelection();
    if (curSelSetSecondary.length === 1) {            
        _blockEventSecondary = true;
            
        //_viewerMain.clearSelection();   // reset to nothing selected (otherwise we end up in cases where it just adds to the existing selection)
            
        // normal behavior is to isolate and zoom into the selected object, but we can only do that in 3D.
        if (_viewerMain.model.is2d() == false) {
            _viewerMain.select(curSelSetSecondary);
            _viewerMain.isolate(curSelSetSecondary);
            _viewerMain.fitToView(curSelSetSecondary);
        }
        else {
            _viewerMain.select(curSelSetSecondary);   // Call work-around to select objects in secondary view (see file TestFuncs.js)
            _viewerMain.fitToView(curSelSetSecondary);
        }
            
        _blockEventSecondary = false;
    }
}

function selectMatching(viewer, prop_name, prop_value, leaf_nodes, callback) {
    console.log("Queueing selection of " + prop_name + " = " + prop_value);
    var selected = [];

    function isMatch(obj) {
        var isMatch = false;
        // and try to find prop_name
        obj.properties.forEach(function (item_prop) {
            // with a matching value
            if (item_prop.displayName.localeCompare(prop_name) == 0 &&
                item_prop.displayValue.localeCompare(prop_value) == 0) {
                isMatch = true;
            }
            // special line number matching check; selecting 3D object 
            else if (prop_name.localeCompare("LineNumberTag") == 0 &&
                     item_prop.displayName.localeCompare("Tag") == 0) {
                var tokens = item_prop.displayValue.split("-");
                // temp logic; should do something better
                if (tokens.length > 3) {
                    // check the last token to see if it matches
                    if (tokens[tokens.length - 1].localeCompare(prop_value) == 0) {
                        isMatch = true;
                    }
                }
            }
            // special line number matching check; selecting 2D SLINE
            else if (item_prop.displayName.localeCompare("LineNumberTag") == 0) {
                var tokens = prop_value.split("-");
                // temp logic; should do something better
                if (tokens.length > 3) {
                    // check the last token to see if it matches
                    if (tokens[tokens.length - 1].localeCompare(item_prop.displayValue) == 0) {
                        isMatch = true;
                    }
                }
            }
        });
        return isMatch;
    }

    viewer.model.getBulkProperties(leaf_nodes, ["Tag", "LineNumberTag"], function (objs) {
        objs.forEach(function (obj) {
            if (isMatch(obj)) {
                selected.push(obj.dbId);
            }
        });
        callback(selected);
    });
}

// get selected object properties and propagate selection
function propagateSelection(src_viewer, dst_viewer, props, leaf_nodes) {
    var select_promises = [];
    var selected = [];

    var selset = src_viewer.getSelection();

    function getSelectPromise(prop) {
        var deferred = $.Deferred();

        // so that matching items in destination view
        // can be found and selected
        selectMatching(dst_viewer, prop.displayName, prop.displayValue, leaf_nodes, function (curr_selected) {
            selected = selected.concat(curr_selected);
            deferred.resolve();
        });

        return deferred.promise();
    }

    src_viewer.model.getBulkProperties(selset, props, function (objs) {
        objs.forEach(function (obj) {
            obj.properties.forEach(function (item_prop) {
                select_promises.push(getSelectPromise(item_prop));
            });
        });

        // when all the selectMatching() promises are fulfilled, then select objects
        $.when.apply($, select_promises).then(function () {
            console.log("Selecting " + selected.length + " items in target view.");
            if (selected.length > 0) {
                // normal behavior is to isolate and zoom into the selected object, but we can only do that in 3D.
                dst_viewer.select(selected);
                if (dst_viewer.model.is2d() == false) {
                    dst_viewer.isolate(selected);
                }
                dst_viewer.fitToView(selected);
            }

            // unblock propagation now
            _blockPropagateSelection = false;
        });
    });
}

function plantMainViewerSelectionChanged(event) {
    if (_blockPropagateSelection)
        return;

    // workaround to getObjectTree() not having nodes in 2D dwgs
    if (_secondaryModelLeafNodes.length == 0) {
        var num = _viewerSecondary.model.getData().hasObjectProperties;
        for (var i = 1; i <= num; ++i) {
            _secondaryModelLeafNodes.push(i);
        }
    }

    _blockPropagateSelection = true;
    propagateSelection(_viewerMain, _viewerSecondary, ["Tag", "LineNumberTag"], _secondaryModelLeafNodes);
}

function plantSecondaryViewerSelectionChanged(event) {
    if (_blockPropagateSelection)
        return;

    _blockPropagateSelection = true;
    propagateSelection(_viewerSecondary, _viewerMain, ["Tag"], _modelLeafNodes);
}

function secondaryViewerGeometryLoaded(event) {
    _blockEventMain = true; // prevent normal event of select/isolate/fit in main viewer
    if (_viewerMain.model)
        _viewerSecondary.select(_viewerMain.getSelection());
    _blockEventMain = false;
}

function plantSecondaryViewerGeometryLoaded(event) {
    _secondaryModelLeafNodes = [];
}

// STEPS:
//  0)  Initialize the Viewing Runtime
//  1)  Load a Document
//  2)  Get the available views (both 2D and 3D)
//  3)  Load a specific view
//      a)  initialize viewer for 2D or 3D
//      b)  load a "viewable" into the appropriate version of the viewer
//  4)  Attach a "listener" so we can keep track of events like Selection


    // initialize the viewer into the HTML placeholder
function initializeViewerMain(sel_changed_callback) {
    
        // if we already have something loaded, uninitialize and re-init (can't just load a new file!:  ?? is that a bug?)
    if (_viewerMain !== null) {
        _viewerMain.uninitialize();
        _viewerMain = null;
    }

    var viewerElement = document.getElementById("viewerMain");  // placeholder in HTML to stick the viewer
    _viewerMain = new Autodesk.Viewing.Private.GuiViewer3D(viewerElement, {});
   
    var retCode = _viewerMain.initialize();
    if (retCode !== 0) {
        alert("ERROR: Couldn't initialize main viewer!");
        console.log("ERROR Code: " + retCode);      // TBD: do real error handling here
    }
    
        // when the geometry is loaded, automatically run the first report

    disableReportMenu();
    _viewerMain.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, function (event) {

        enableReportMenu();
        //runReport(-1);   // run the currently selected report (the first one if this is the first model loaded, current one if loading a subsequent model)
        
        $("#tab_button_1").click();
        startReportDataLoader(runReport);
    });
    
        // when selecting in the Primary viewer, select the matching items in the Secondary viewer
    _viewerMain.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, sel_changed_callback);
}

function initializeViewerSecondary(sel_changed_callback, geom_loaded_callback) {
    
        // if we already have something loaded, uninitialize and re-init (can't just load a new file!:  ?? is that a bug?)
    if (_viewerSecondary !== null) {
        _viewerSecondary.uninitialize();
        _viewerSecondary = null;
    }

    var viewerElement = document.getElementById("viewerSecondary");  // placeholder in HTML to stick the viewer
    _viewerSecondary = new Autodesk.Viewing.Private.GuiViewer3D(viewerElement, {});
   
    var retCode = _viewerSecondary.initialize();
    if (retCode !== 0) {
        alert("ERROR: Couldn't initialize secondary viewer!");
        console.log("ERROR Code: " + retCode);      // TBD: do real error handling here
    }
    
        // when we change sheets, we want to re-select things after this sheet is loaded
    _viewerSecondary.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, geom_loaded_callback);

    // when selecting objects in the Secondary viewer, also select the matching itmes in the Primary viewer
    _viewerSecondary.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, sel_changed_callback);
}
    

    // load a specific document into the intialized viewer
function loadDocument(urnStr) {
    
    _loadedDocument = null; // reset to null if reloading
    _loadedSecondaryDocument = null;

    if (!urnStr || (0 === urnStr.length)) {
        alert("You must specify a URN!");
        return;
    }
    var fullUrnStr = "urn:" + urnStr;
    
    Autodesk.Viewing.Document.load(fullUrnStr, function(document) {
        _loadedDocument = document; // keep this in a global var so we can reference it in other spots

            // get all the 3D and 2D views (but keep in separate arrays so we can differentiate in the UX)
        _views3D = Autodesk.Viewing.Document.getSubItemsWithProperties(document.getRootItem(), {'type':'geometry', 'role':'3d'}, true);
        _views2D = Autodesk.Viewing.Document.getSubItemsWithProperties(document.getRootItem(), {'type':'geometry', 'role':'2d'}, true);
        
        loadViewMenuOptions();                   // populate UX with views we just retrieved
        initializeViewerMain(mainViewerSelectionChanged);
        initializeViewerSecondary(secondaryViewerSelectionChanged, secondaryViewerGeometryLoaded);
            
            // load up first 3D view by default into the primary viewer
        if (_views3D.length > 0) {
            loadView(_loadedDocument, _viewerMain, _views3D[0]);
        }
        else {      // there weren't any 3D views!
            if (_views2D.length > 0) {
                loadView(_loadedDocument, _viewerMain, _views2D[0]);
                $('#pu_viewToLoad').val('1000'); // selects first option in 2D list
            }
            else {
                alert("ERROR: No 3D or 2D views found in this drawing!");
            }
        }
            // now load the Secondary viewer with the first 2D view by default
        if (_views2D.length > 0) {
            loadView(_loadedDocument, _viewerSecondary, _views2D[0]);
            $('#pu_viewToLoad').val('1000'); // selects first option in 2D list
        }
        else {
            console.log("WARNING: No 2D views found for secondary view, using additional 3D view");
            if (_views3D.length > 0)
                loadView(_loadedDocument, _viewerSecondary, _views3D[0]);
        }

        
    }, function(errorCode, errorMsg) {
        alert('Load Error: ' + errorCode + " " + errorMsg);
    });
}

function loadPlantSecondaryDocument(index)
{
    _loadedSecondaryDocument = null;
    _views2D = null;

    initializeViewerSecondary(plantSecondaryViewerSelectionChanged, plantSecondaryViewerGeometryLoaded);

    if (_selectedPlantModel.views == null ||
        _selectedPlantModel.views.length == 0) {
        alert("ERROR: No 2D view found in this drawing!");
        return;
    }

    var fullUrnStr = "urn:" + _selectedPlantModel.views[index].urn;
    Autodesk.Viewing.Document.load(fullUrnStr, function (document) {
        _loadedSecondaryDocument = document; // keep this in a global var so we can reference it in other spots

        // get all 2D views 
        _views2D = Autodesk.Viewing.Document.getSubItemsWithProperties(document.getRootItem(), { 'type': 'geometry', 'role': '2d' }, true);

        // load up first 2D view by default into the secondary viewer
        if (_views2D.length > 0) {
            loadView(_loadedSecondaryDocument, _viewerSecondary, _views2D[0]);
        }
        else {
            alert("ERROR: No 2D views found in this drawing!");
        }

    }, function (errorCode, errorMsg) {
        alert('Load Error: ' + errorCode + " " + errorMsg);
    });
}

// load a specific document into the intialized viewer
function loadPlantDocument(plant_model) {

    _loadedDocument = null; // reset to null if reloading
    _selectedPlantModel = plant_model;

    if (plant_model == null ||
        plant_model.urn == null ||
        (0 === plant_model.urn.length))
    {
        alert("You must specify a URN!");
        return;
    }

    loadPlantViewMenuOptions(plant_model.views);                   // populate UX with views
    initializeViewerMain(plantMainViewerSelectionChanged);

    var fullUrnStr = "urn:" + plant_model.urn;
    Autodesk.Viewing.Document.load(fullUrnStr, function (document) {
        _loadedDocument = document; // keep this in a global var so we can reference it in other spots

        // get all the 3D views
        _views3D = Autodesk.Viewing.Document.getSubItemsWithProperties(document.getRootItem(), { 'type': 'geometry', 'role': '3d' }, true);

        // load up first 3D view by default into the primary viewer
        if (_views3D.length > 0) {
            loadView(_loadedDocument, _viewerMain, _views3D[0]);
        }
        else {      // there weren't any 3D views!
            alert("ERROR: No 3D view found in this drawing!");
        }

    }, function (errorCode, errorMsg) {
        alert('Load Error: ' + errorCode + " " + errorMsg);
    });

    // load up the first 2D view by default in the secondary viewer
    loadPlantSecondaryDocument(0);
}

    // for now, just simple diagnostic functions to make sure we know what is happing
function loadViewSuccessFunc()
{
    console.log("Loaded viewer successfully with given asset...");
}

function loadViewErrorFunc()
{
    console.log("ERROR: could not load asset into viewer...");
}

    // load a particular viewable into the viewer (either Primary or Secondary depending on what's passed in)
function loadView(document, viewer, viewObj) {
    var path = document.getViewablePath(viewObj);
    console.log("Loading view URN: " + path);
    
    viewer.load(path, document.getPropertyDbPath(), loadViewSuccessFunc, loadViewErrorFunc);
}

    // wrap this in a simple function so we can pass it into the Initializer options object
function getAccessToken() {
    return _myAuthToken.value();
}

function dbgPrintLmvVersion()
{
        // builds greater than 0.1.98 will have a variable listing the version number
    if (typeof LMV_VIEWER_VERSION !== "undefined") {
        console.log("LMV_VIEWER_VERSION: " + LMV_VIEWER_VERSION);
    }
    else {
        console.log("LMV_VIEWER_VERSION: 0.1.98 or earlier");
    }
}

    // called when HTML page is finished loading, trigger loading of default model into viewer
function loadInitialModel() {

    console.log("onload: loadInitialModel in LoadModel.js");

    dbgPrintLmvVersion(); 

    loadModelMenuOptions();                  // populate the list of available models for the user
    
    var options = {};
    options.env = _viewerEnv;                // AutodeskProduction, AutodeskStaging, or AutodeskDevelopment (set in global var in this project)
    options.getAccessToken = getAccessToken;
    options.refreshToken   = getAccessToken;
    
    Autodesk.Viewing.Initializer(options, function() {
        loadDocument(_lmvModelOptions[0].urn);   // load first entry by default
    });
}
