export default class Controller
{

  constructor(view, model)
  {
    this.gui = new dat.GUI({width : '400px'});
    this.view = view;
    this.model = model;
    this.btnLoad = document.querySelector("#btnLoad");
    this.btnMesh = document.querySelector('#btnMesh');
    this.btnModel = document.querySelector("#btnModel");
    this.sceneData = document.querySelector("#metadata");
    this.UI = {};
    this.setupUI();
  }

  setupUI()
  {
    var that = this;
    var UI = this.UI;

    const controls = {
      loadFile: function() {that.btnLoad.click()},
      createMesh : function() {that.model.createMesh()},
      runModel: function() {that.model.runModel()},
    };

    UI.displayInput = {display: false};
    UI.displayLabel = {display : false};
    UI.displayMesh = {display : false};

    // //on change of the hidden load button load a file 
    this.btnLoad.addEventListener('change', () => that.model.copyFile());

    //set up the GUI
    this.gui.add(controls, 'loadFile').name("Load OBJ File");
    
    //SCENE FOLDER
    UI.folderInputs = this.gui.addFolder('Scenes');
    UI.dropdownInputs = UI.folderInputs.add({fileName : ""}, 'fileName', Object.keys(that.model.scenes)).name("File Name");
    UI.toggleInputs = UI.folderInputs.add(UI.displayInput, 'display').name("Show Scene");
    UI.toggleInputs.onChange((value) => this.displayModel(value, that.model.activeScene, "input"));
    UI.toggleLabels = UI.folderInputs.add(UI.displayLabel, 'display').name("Show Labels");
    UI.toggleMesh = UI.folderInputs.add(UI.displayMesh, 'display').name("Show Mesh");;
    // DISPLAY FOLDER
    UI.folderDisplay = this.gui.addFolder('Display Settings');
    //create color picker
    // folder.addColor({modelcolor: 0.00}, 'modelcolor').name('Model Color').onChange((value) => this.updateColor(value));
    UI.displayOpacity = UI.folderDisplay.add({opacity : 0.1}, 'opacity', 0.0, 0.2).name("Scene Opacity");
    UI.displayOpacity.onChange((value) => this.updateOpacity(value));
    UI.displayPointSize = UI.folderDisplay.add({pointSize : 2.0}, 'pointSize', 0.0, 20.0).name("Labels Point Size");
    UI.displayPointSize.onChange((value) => this.updatePointSize(value));

    //MODEL FOLDER
    UI.folderModel = this.gui.addFolder('Segmentation');
    UI.folderModel.add(controls, 'runModel').name("Run Model");
    
    //MESH FOLDER
    UI.folderMesh = this.gui.addFolder('Mesh Reconstruction');
    UI.folderMesh.add(controls, 'createMesh').name("Create Mesh");

    //LABELS FOLDER
    UI.folderLabels;
    
    //OPEN FOLDERS
    UI.folderInputs.open();
    UI.folderDisplay.open();
    UI.folderModel.open();
    UI.folderMesh.open();

    this.listen();
  }

  listen()
  {
    var that = this;
    var UI = this.UI;

    //when loaded event sent update the dropdown list
    this.btnLoad.addEventListener('loaded', function (e) {

      UI.dropdownInputs = UI.dropdownInputs.options(Object.keys(that.model.scenes))
      UI.dropdownInputs.name('File Name');
      //whenever dropdown is updated update the UI as follows...
      UI.dropdownInputs.onChange(function(value) {
              
        //if active input model present, remove it
        if(that.model.activeScene)
        {
          if(that.model.activeScene.inputPLY) that.view.scene.remove(that.model.activeScene.inputPLY);
          if(that.model.activeScene.labelledPLY) that.view.scene.remove(that.model.activeScene.labelledPLY);
          if(that.model.activeScene.mesh) that.view.scene.remove(that.model.activeScene.mesh);
        }

        //specify new active scene
        that.model.activeScene = that.model.scenes[value];
        that.view.scene.add(that.model.activeScene.inputPLY);

        //reset display booleans
        UI.displayInput.display = true;
        UI.displayLabel.display = false;
        UI.displayMesh.display = false;

        //add display toggles
        that.updateTogglesDisplay();

        //display the label filters if available
        that.updateTogglesLabels();

        //display the point size controller if available
        that.updateTogglesPointSize();

        // //update the metadata for the scene
        that.updateSceneData();



    }); 
  }, false);
}

    //need to fix case where model is changed and unticked
    displayModel(value, activeModel, type)
    {
      if(activeModel)
      {
        if(value)
        {
          if(type == "input")
          {
            this.view.scene.add( activeModel.inputPLY);
            console.log("input")
          }
          else if(type == "labels")
          {
            this.view.scene.add( activeModel.labelledPLY);
            console.log("lablled")
          }
          else if(type == "mesh")
          {
            this.view.scene.add( activeModel.mesh);
          }
        }
        else
        {
          if(type == "input")
          {
            this.view.scene.remove( activeModel.inputPLY);
          }
          else if(type == "labels")
          {
            this.view.scene.remove( activeModel.labelledPLY);
          }
          else if(type == "mesh")
          {
            this.view.scene.remove( activeModel.mesh);
          }
        }
      }
    }

    
  //change the color of the active objet
  updateColor(value)
  {
    console.log("Changing Color of Active Model");

    if(this.model.activeScene){

      var colors = this.model.activeScene.inputPLY.geometry.attributes.color;

      //loop over the color attributes
      for ( var i = 0; i < colors.count; i ++ ) {
      
        var color = new THREE.Color(value);
        colors.setXYZ( i, color.r, color.g, color.b);
      }
      colors.needsUpdate = true;
    }
  }


  //toggles point display by label via shaders
  togglePoints(bool, label)
  {

    this.model.activeScene.labelledPLY.display[label] = bool;

    var colors = this.model.activeScene.labelledPLY.geometry.attributes.color;
    var pointSize = this.model.activeScene.labelledPLY.geometry.attributes.pointSize;
    
    colors.needsUpdate = true;
    pointSize.needsUpdate = true;

    const key = Object.keys(this.model.labelMap).find(key => this.model.labelMap[key] === label)
    const vals = key.slice(1, key.length-1).split(", ");
    var cols = vals.map(Number);
    var cols = cols.map(x => x / 255.0);

    var onColor = new THREE.Color().fromArray(cols);

    //loop over the color attributes
    for ( var i = 0; i < colors.count; i ++ ) {

      if(this.model.activeScene.labelledPLY.labelledPoints[i] === label)
      {
        if(bool){
          pointSize.setX(i, this.model.defaultPointSize);
        }
        else
        {
          pointSize.setX(i, 0.0);
        }
      }
    }
  

    this.model.activeScene.labelledPLY.toggles[label] = bool;
  }


  //update the point size attribute which is passed to the shader
  updatePointSize(pointSize)
  {
    if(this.model.activeScene.labelledPLY){

      var attrPointSize = this.model.activeScene.labelledPLY.geometry.attributes.pointSize;
      this.model.defaultPointSize = pointSize;
      attrPointSize.needsUpdate = true;

      //loop over the point size attributes
      for ( var i = 0; i < attrPointSize.count; i++ ) {

          attrPointSize.setX(i, pointSize);
        
      }
    }
  }

  //changes opacity of points in cloud
  updateOpacity(opacity)
  {
    if(this.model.activeScene){

      var attrOpacity = this.model.activeScene.inputPLY.geometry.attributes.opacity;
      this.model.defaultOpacity = opacity;
      attrOpacity.needsUpdate = true;
      
      //loop over opacity attribute
        for ( var i = 0; i < attrOpacity.count; i++ ) {

            attrOpacity.setX(i, opacity);
          
        }
    }
  }


  updateTogglesLabels()
  {
    try
    {
      this.gui.removeFolder("Filter by Labels");
    }
    catch
    {}

    if(this.model.activeScene.labelledPLY) {

      //create dictionary to hold the label toggle state
      let toggle = {};

      let activeLabelCount = this.model.activeScene.labelledPLY.labels.length 

      for(var i = 0; i < activeLabelCount; i++){

        let key = stringifyArray(this.model.activeScene.labelledPLY.labels[i])
        toggle[this.model.labelMap[key]] = true;
      }

      this.model.activeScene.labelledPLY.toggles = toggle;

      this.UI.folderLabels = this.gui.addFolder('Filter by Labels');

      this.UI.folderLabels.open()

      for(const key of Object.keys(this.model.activeScene.labelledPLY.display)){
        this.UI.folderLabels.add(this.model.activeScene.labelledPLY.display, key).onChange((bool) => this.togglePoints(bool, key));;
      }

  }
  }

  //add the display toggles
  updateTogglesDisplay()
  {

    let UI = this.UI;

    //add display toggle for input
    UI.folderInputs.remove(UI.toggleInputs)
    UI.toggleInputs = UI.folderInputs.add(UI.displayInput, 'display').name("Show Input");
    UI.toggleInputs.onChange((value) => this.displayModel(value, this.model.activeScene, "input"));

    try
    {
      UI.folderInputs.remove(UI.toggleLabels)
    } 
    catch
    {}

    try
    {
      UI.folderInputs.remove(UI.toggleMesh)
    } 
    catch
    {}

    //add display toggle for labels if present
    if(this.model.activeScene.labelledPLY)
    {
      UI.toggleLabels = UI.folderInputs.add(UI.displayLabel, 'display').name("Show Labels");
      UI.toggleLabels.onChange((value) => this.displayModel(value, this.model.activeScene, "labels"));
    }
 

    //add display toggle for mesh if present
    if(this.model.activeScene.mesh)
    {      
      UI.toggleMesh = UI.folderInputs.add(UI.displayMesh, 'display').name("Show Mesh");
      UI.toggleMesh.onChange((value) => this.displayModel(value, this.model.activeScene, "mesh"));
    }
  }

  updateTogglesPointSize()
  {
    let UI = this.UI;

    try{        
      UI.folderDisplay.remove(UI.displayPointSize);
    } 
    catch 
    {}
    if(this.model.activeScene.labelledPLY){

      UI.displayPointSize = UI.folderDisplay.add({pointSize : 2.0}, 'pointSize', 0.0, 20.0).name("Labels Point Size");
      UI.displayPointSize.onChange((value) => this.updatePointSize(value));
    }
  }

updateSceneData()
{
  console.log(this.model.activeScene)
  let unitsVol = " m<sup>3</sup>"
  let unitsDens = " pts / m<sup>3</sup>"
  let inputData = 
   
    "Input Point Count - " + this.model.activeScene.inputPLY.ptCount + "<br>" +
    "Input Point Volume - " + this.model.activeScene.inputPLY.volume.toFixed(2) +  unitsVol + "<br>" + 
    "Input Point Density - " + this.model.activeScene.inputPLY.density.toFixed(2) +  unitsDens + "<br>" 


  let labelledData = "";
  if(this.model.activeScene.labelledPLY){
    labelledData = "<br>" + 
    "Labelled Point Count - "  + this.model.activeScene.labelledPLY.ptCount + "<br>" + 
    "Labelled Point Volume - " + this.model.activeScene.labelledPLY.volume.toFixed(2)  + unitsVol + "<br>" + 
    "Labelled Point Density - " + this.model.activeScene.labelledPLY.density.toFixed(2)  + unitsDens 
  }

  this.sceneData.innerHTML = inputData + labelledData;

  }
}

//helper functions

//convert from an array [125, 125, 125] to a string like "[125, 125, 125]"
function stringifyArray(obj)
{
  let arr = Object.values(obj);

  var str = "[";
  str += arr.join(", ");
  str += "]";
  
  return str;
}

//add remove folder to dat gui
//https://stackoverflow.com/questions/14710559/dat-gui-how-to-hide-menu-with-code
dat.GUI.prototype.removeFolder = function(name) {
  var folder = this.__folders[name];
  if (!folder) {
    return;
  }
  folder.close();
  this.__ul.removeChild(folder.domElement.parentNode);
  delete this.__folders[name];
  this.onResize();
}