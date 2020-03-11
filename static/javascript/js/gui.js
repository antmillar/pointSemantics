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

      //on change of the hidden load button load a file
      this.btnLoad.addEventListener('change', () => that.model.loadGeometry(btnLoad.filesInputs[0].name));

      //set up the GUI
      this.gui.add(controls, 'loadFile').name("Load OBJ File");

      var folder = this.gui.addFolder('Display Settings');
      //create color picker
      folder.addColor({modelcolor: 0.00}, 'modelcolor').name('Model Color').onChange((value) => this.changeColor(value));

      //create model dropdown
      var folderInputs = folder.addFolder('Input PLY Models');
      var displayInputs = folderInputs.add({toggleDisplay : true}, 'toggleDisplay');
      displayInputs.onChange((value) => this.display(value, that.model.activeModelInput));
      var dropdownInputs = folderInputs.add({fileName : ""}, 'fileName', Object.keys(that.model.filesInputs));
      var displayOpacity = folderInputs.add({opacity : 0.2}, 'opacity', 0.0, 0.2);
      displayOpacity.onChange((value) => this.changeOpacity(value));

      //run Model button
      folderInputs.add(controls, 'runModel').name("Run Model");

      //create model dropdown
      var folderOutputs = folder.addFolder('Output PLY Models');
      var displayOutputs = folderOutputs.add({toggleDisplay : true}, 'toggleDisplay');
      displayOutputs.onChange((value) => this.display(value,  that.model.activeModelOutput));
      var dropdownOutputs = folderOutputs.add({fileName : ""}, 'fileName', Object.keys(that.model.filesOutputs));
      var displayPointSize = folderOutputs.add({pointSize : 3.0}, 'pointSize', 0.0, 20.0);
      displayPointSize.onChange((value) => this.changePointSize(value));
      folderOutputs.add(controls, 'createMesh').name("Create Mesh");

      //create mesh dropdown
      var folderMeshes = folder.addFolder('Output Meshes');
      var displayMeshes = folderMeshes.add({toggleDisplay : true}, 'toggleDisplay');
      displayMeshes.onChange((value) => this.display(value,  that.model.activeModelMesh));
      var dropdownMeshes = folderMeshes.add({fileName : ""}, 'fileName', Object.keys(that.model.filesMeshes));
 
      //create list of labels available
      var toggle = {};

      folder.open();
      folderInputs.open();
      folderOutputs.open();
      folderMeshes.open();


      //input file dropdown
      //when file is loaded update the dropdown list
      this.btnLoad.addEventListener('loaded', function (e) {

        dropdownInputs = dropdownInputs.options(Object.keys(that.model.filesInputs))
        dropdownInputs.name('File Name');
        dropdownInputs.onChange(function(value) {
               
          //if active input model present, remove it
          if(that.model.activeModelInput)
          {
            that.view.scene.remove( that.model.activeModelInput);
          }

          that.model.activeModelInput = that.model.filesInputs[value];

          folder.removeFolder("Toggle Labels");

          that.view.scene.add(that.model.activeModelInput);

          console.log(that.model.activeModelInput)
      });

      //output file dropdown
      dropdownOutputs = dropdownOutputs.options(Object.keys(that.model.filesOutputs))
      dropdownOutputs.name('File Name');
      dropdownOutputs.onChange(function(value) {
             
        //if active model present, remove it
        if(that.model.activeModelOutput)
        {
          that.view.scene.remove( that.model.activeModelOutput);
        }

        that.model.activeModelOutput = that.model.filesOutputs[value];
        let activeLabelCount = that.model.activeModelOutput.labels.length 

        folder.removeFolder("Toggle Labels");

        if(activeLabelCount> 0)
        {
        //refresh the contents of the labels folder                 

          folderOutputs = folder.addFolder("Toggle Labels");
          folderOutputs.open()
          // toggle = {};
        }

        // for(var i = 0; i< activeLabelCount; i++){

        //   let key = objToString(that.model.activeModelOutput.labels[i])
        //   toggle[that.model.labelMap[key]] = true;
        // }

        that.model.activeModelOutput.toggles = toggle;

        for(const key of Object.keys(that.model.activeModelOutput.display)){
          folderOutputs.add(that.model.activeModelOutput.display, key).onChange((bool) => that.toggleDisplay(bool, key));;
        }

        that.view.scene.add(that.model.activeModelOutput);

        console.log(that.model.activeModelOutput)
    });


      //output mesh dropdown
      dropdownMeshes = dropdownMeshes.options(Object.keys(that.model.filesMeshes))
      dropdownMeshes.name('File Name');
      dropdownMeshes.onChange(function(value) {
             
        //if active model present, remove it
        if(that.model.activeModelMesh)
        {
          that.view.scene.remove( that.model.activeModelMesh);
        }

        that.model.activeModelMesh = that.model.filesMeshes[value];
        // let activeLabelCount = that.model.activeModelMesh.labels.length 

        // folder.removeFolder("Toggle Labels");

        // if(activeLabelCount> 0)
        // {
        // //refresh the contents of the labels folder                 

        //   folderMeshes = folder.addFolder("Toggle Labels");
        //   folderMeshes.open()
        //   toggle = {};
        // }

        // for(var i = 0; i< activeLabelCount; i++){

        //   let key = objToString(that.model.activeModelMesh.labels[i])
        //   toggle[that.model.labelMap[key]] = true;
        // }

        // that.model.activeModelMesh.toggles = toggle;

        // for(const key of Object.keys(toggle)){
        //   folderMeshes.add(toggle, key).onChange((bool) => that.toggleDisplay(bool, key));;
        // }

        that.view.scene.add(that.model.activeModelMesh);

        console.log(that.model.activeModelMesh)
    });
      
      }, false);
  }

  //change the color of the active objet
  changeColor(value)
  {
    console.log("Changing Color of Active Model");

    if(this.model.activeModelInput){

      var colors = this.model.activeModelInput.geometry.attributes.color;

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

    if(this.model.activeModelOutput){

      this.model.activeModelOutput.display[label] = bool;

      var colors = this.model.activeModelOutput.geometry.attributes.color;
      var pointSize = this.model.activeModelOutput.geometry.attributes.pointSize;
      var opacity  = this.model.activeModelOutput.geometry.attributes.opacity;
      
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

        if(this.model.activeModelOutput.labelledPoints[i] === label)
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

    this.model.activeModelOutput.toggles[label] = bool;
    console.log(this.model.activeModelOutput)
  }

  changePointSize(pointSize)
  {
    if(this.model.activeModelOutput){

      var attrPointSize = this.model.activeModelOutput.geometry.attributes.pointSize;
      this.model.defaultPointSize = pointSize;
      attrPointSize.needsUpdate = true;

      if(this.model.activeModelOutput.labels.length > 0) {
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
    if(this.model.activeModelInput){

  
      var attrOpacity = this.model.activeModelInput.geometry.attributes.opacity;
      this.model.defaultOpacity = opacity;
      attrOpacity.needsUpdate = true;
      

      //loop pts
        for ( var i = 0; i < attrOpacity.count; i ++ ) {

            attrOpacity.setX(i, opacity);
          
        }
      
    }
  }

  //need to fix case where model is changed and unticked
  display(value, activeModel)
  {
    if(value)
    {
      this.view.scene.add( activeModel);
    }
    else
    {
      this.view.scene.remove( activeModel);
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