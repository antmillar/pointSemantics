export default class Controller
{

  constructor(view, model)
  {
    this.gui = new dat.GUI({width : '400px'});
    this.view = view;
    this.model = model;
    this.btnLoad = document.querySelector("#btnLoad");
    this.btnModel = document.querySelector("#btnModel");
    this.initialise();
  }

  initialise()
  {
    var that = this;

    //when load gui button is clicked, simulates a click of the hidden load button 
    const loader = {
        loadFile: function() {document.querySelector('#btnLoad').click();}
    };

    const model = {
      runModel: function() {
        document.querySelector("#fileName").value = that.model.activeModelInput.name;
        document.querySelector('#btnModel').submit();
      }
   };

    //set default color for color picker
    const color =  {
        modelcolor: 0.00
      };

      //set up the GUI
      this.gui.add(loader, 'loadFile').name("Load OBJ File");

      var folder = this.gui.addFolder('Display Settings');
      //create color picker
      folder.addColor(color, 'modelcolor').name('Model Color').onChange((value) => this.changeColor(value));

      //create model dropdown
      var folderInputs = folder.addFolder('Input PLY Models');
      var displayInputs = folderInputs.add({toggleDisplay : true}, 'toggleDisplay')
      displayInputs.onChange((value) => this.display(value, that.model.activeModelInput))
      var dropdownInputs = folderInputs.add({fileName : ""}, 'fileName', Object.keys(that.model.filesInputs));

      //run Model button
      folderInputs.add(model, 'runModel').name("Run Model");

      //create model dropdown
      var folderOutputs = folder.addFolder('Output PLY Models');
      var displayOutputs = folderOutputs.add({toggleDisplay : true}, 'toggleDisplay')
      displayOutputs.onChange((value) => this.display(value,  that.model.activeModelOutput))
      var dropdownOutputs = folderOutputs.add({fileName : ""}, 'fileName', Object.keys(that.model.filesOutputs));
      var displayPointSize = folderOutputs.add({pointSize : 2.0}, 'pointSize', 0.0, 20.0)
      displayPointSize.onChange((value) => this.changePointSize(value))
 
      //create list of labels available
      var toggle = {};

      folder.open();
      folderInputs.open();
      folderOutputs.open();

      //on change of the hidden model button to the model
      this.btnModel.addEventListener('click', () => that.model.runModel());

      //on change of the hidden load button load a file
      this.btnLoad.addEventListener('change', () => that.model.loadGeometry(btnLoad.filesInputs[0].name));

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
          toggle = {};
        }

        for(var i = 0; i< activeLabelCount; i++){

          let key = objToString(that.model.activeModelOutput.labels[i])
          toggle[that.model.labelMap[key]] = true;
        }

        for(const key of Object.keys(toggle)){
          folderOutputs.add(toggle, key).onChange((bool) => that.changeColorLabelled(bool, key));;
        }

        that.view.scene.add(that.model.activeModelOutput);

        console.log(that.model.activeModelOutput)
    });
      
      }, false);
  }

  //change the color of the active objet
  changeColor(value)
  {
    console.log("Changing Color of Active Model");

    if(this.model.activeModel){

      var colors = this.model.activeModel.geometry.attributes.color;

      //loop over the color attributes
      for ( var i = 0; i < colors.count; i ++ ) {
      
        var color = new THREE.Color(value);
        colors.setXYZ( i, color.r, color.g, color.b);
      }
      colors.needsUpdate = true;
    }
  }

  //toggles point display by label via shaders
  changeColorLabelled(bool, label)
  {

    if(this.model.activeModelOutput){

      var colors = this.model.activeModelOutput.geometry.attributes.color;
      var visible = this.model.activeModelOutput.geometry.attributes.visible;

      colors.needsUpdate = true;
      visible.needsUpdate = true;

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
            visible.setX(i, 50.0);
          }
          else
          {
            visible.setX(i, 0.0);
          }
        }
      }
    }
  }

  changePointSize(pointSize)
  {
    if(this.model.activeModelOutput){

      var visible = this.model.activeModelOutput.geometry.attributes.visible;

      visible.needsUpdate = true;

      if(this.model.activeModelOutput.labels.length > 0) {
      //loop over the color attributes
        for ( var i = 0; i < visible.count; i ++ ) {

            visible.setX(i, pointSize);
        }
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