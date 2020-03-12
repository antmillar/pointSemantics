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
    this.initialise();
  }

  initialise()
  {
    var that = this;

    //when load gui button is clicked, simulates a click of the hidden load button 
    const controls = {
        loadFile: function() {document.querySelector('#btnLoad').click();},
        createMesh : function() {that.model.createMesh()},
        runModel: function() {that.model.runModel()},
    };

    const displayLabels = {display : false};
    const displayMesh = {display : false};

    // //on change of the hidden load button load a file 
    // this.btnLoad.addEventListener('change', () => that.model.loadGeometry(btnLoad.filesInputs[0].name));

    //set up the GUI
    this.gui.add(controls, 'loadFile').name("Load OBJ File");

    //SCENE FOLDER
    var folderInputs = this.gui.addFolder('Scenes');
    var dropdownInputs = folderInputs.add({fileName : ""}, 'fileName', Object.keys(that.model.scenes)).name("File Name");
    var displayInputs = folderInputs.add({toggleDisplay : true}, 'toggleDisplay').name("Toggle Display");
    displayInputs.onChange((value) => this.display(value, that.model.activeScene, "input"));
    var toggleLabels = folderInputs.add(displayLabels, 'display').name("Toggle Labels");; //these get initialised later if scene has labels/mesh to display
    var toggleMesh = folderInputs.add(displayMesh, 'display').name("Toggle Mesh");;

    //DISPLAY FOLDER
    var folderDisplay = this.gui.addFolder('Display Settings');
    //create color picker
    // folder.addColor({modelcolor: 0.00}, 'modelcolor').name('Model Color').onChange((value) => this.changeColor(value));
    var displayOpacity = folderDisplay.add({opacity : 0.1}, 'opacity', 0.0, 0.2).name("Scene Opacity");
    displayOpacity.onChange((value) => this.changeOpacity(value));
    var displayPointSize = folderDisplay.add({pointSize : 3.0}, 'pointSize', 0.0, 20.0).name("Label Point Size");
    displayPointSize.onChange((value) => this.changePointSize(value));

    //MODEL FOLDER
    var folderModel = this.gui.addFolder('Segmentation');
    folderModel.add(controls, 'runModel').name("Run Model");
    
    //MESH FOLDER
    var folderMesh = this.gui.addFolder('Mesh Reconstruction');
    folderMesh.add(controls, 'createMesh').name("Create Mesh");


    //OPEN FOLDERS
    folderInputs.open();
    folderDisplay.open();
    folderModel.open();
    folderMesh.open();


    //input file dropdown
    //when file is loaded update the dropdown list
    this.btnLoad.addEventListener('loaded', function (e) {

      dropdownInputs = dropdownInputs.options(Object.keys(that.model.scenes))
      dropdownInputs.name('File Name');
      dropdownInputs.onChange(function(value) {
              
        //if active input model present, remove it
        if(that.model.activeScene)
        {
          if(that.model.activeScene.inputPLY) that.view.scene.remove(that.model.activeScene.inputPLY);
          if(that.model.activeScene.labelledPLY) that.view.scene.remove(that.model.activeScene.labelledPLY);
          if(that.model.activeScene.mesh) that.view.scene.remove(that.model.activeScene.mesh);
        }

        that.model.activeScene = that.model.scenes[value];

        that.gui.removeFolder("Toggle Labels");

        that.view.scene.add(that.model.activeScene.inputPLY);
        //if has labels create toggle
        if(that.model.activeScene.labelledPLY)
        {
          try
          {
            folderInputs.remove(toggleLabels)
          } catch{}

          toggleLabels = folderInputs.add(displayLabels, 'display').name("Toggle Labels");
          toggleLabels.onChange((value) => that.display(value, that.model.activeScene, "labels"));
        }
        else 
        {
          folderInputs.remove(toggleLabels)
        }

        //if has mesh create toggle
        if(that.model.activeScene.mesh)
        {
          try
          {
            folderInputs.remove(toggleMesh)
          } catch{}
          toggleMesh = folderInputs.add(displayMesh, 'display').name("Toggle Mesh");
          toggleMesh.onChange((value) => that.display(value, that.model.activeScene, "mesh"));
        }
        else 
        {
          folderInputs.remove(toggleMesh)
        }

        console.log(that.model.activeScene.inputPLY)
    }); 
  }, false);
}

  //change the color of the active objet
  changeColor(value)
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
  toggleDisplay(bool, label)
  {

    if(this.model.activeScene.labelledPLY){

      this.model.activeScene.labelledPLY.display[label] = bool;

      var colors = this.model.activeScene.labelledPLY.geometry.attributes.color;
      var pointSize = this.model.activeScene.labelledPLY.geometry.attributes.pointSize;
      var opacity  = this.model.activeScene.labelledPLY.geometry.attributes.opacity;
      
      colors.needsUpdate = true;
      pointSize.needsUpdate = true;
      opacity.needsUpdate = true;

      const key = Object.keys(this.model.labelMap).find(key => this.model.labelMap[key] === label)
      const vals = key.slice(1, key.length-1).split(", ");
      var cols = vals.map(Number);
      var cols = cols.map(x => x / 255.0);

      var onColor = new THREE.Color().fromArray(cols);
      console.log(onColor);

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
    }

    this.model.activeScene.labelledPLY.toggles[label] = bool;
    console.log(this.model.activeScene.labelledPLY)
  }

  changePointSize(pointSize)
  {
    if(this.model.activeScene.labelledPLY){

      var attrPointSize = this.model.activeScene.labelledPLY.geometry.attributes.pointSize;
      this.model.defaultPointSize = pointSize;
      attrPointSize.needsUpdate = true;

      if(this.model.activeScene.labelledPLY.labels.length > 0) {
      //loop over the color attributes
        for ( var i = 0; i < attrPointSize.count; i ++ ) {

          //check if the point is disabled
          if(attrPointSize.getX(i) != 0.0){

            attrPointSize.setX(i, pointSize);
          }
        }
      }
    }
  }

  changeOpacity(opacity)
  {
    if(this.model.activeScene){

  
      var attrOpacity = this.model.activeScene.inputPLY.geometry.attributes.opacity;
      this.model.defaultOpacity = opacity;
      attrOpacity.needsUpdate = true;
      
      //loop pts
        for ( var i = 0; i < attrOpacity.count; i ++ ) {

            attrOpacity.setX(i, opacity);
          
        }
      
    }
  }
    
    //need to fix case where model is changed and unticked
  display(value, activeModel, type)
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



  
  }
  function objToString(obj)
  {
    let arr = Object.values(obj);

    var str = "[";
    str += arr.join(", ");
    str += "]";
    
    return str;
  }


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