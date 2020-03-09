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
        document.querySelector("#fileName").value = that.model.activeModel.name;
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
      var dropdownInputs = folderInputs.add({fileName : ""}, 'fileName', Object.keys(that.model.filesInputs));

      //create model dropdown
      var folderOutputs = folder.addFolder('Output PLY Models');
      var dropdownOutputs = folderOutputs.add({fileName : ""}, 'fileName', Object.keys(that.model.filesOutputs));

      //run Model button
      this.gui.add(model, 'runModel').name("Run Model");

      //create list of labels available
      var folder3;
      var toggle = {};

      folder.open();
      folderInputs.open();
      folderOutputs.open();


      //on change of the hidden model button to the model
      this.btnModel.addEventListener('click', () => that.model.runModel());

      //on change of the hidden load button load a file
      this.btnLoad.addEventListener('change', () => that.model.loadGeometry(btnLoad.filesInputs[0].name));

      //when file is loaded update the dropdown list
      this.btnLoad.addEventListener('loaded', function (e) {

        dropdownInputs = dropdownInputs.options(Object.keys(that.model.filesInputs))
        dropdownInputs.name('File Name');
        dropdownInputs.onChange(function(value) {
               
          //if active model present, remove it
          if(that.model.activeModel)
          {
            that.view.scene.remove( that.model.activeModel);
          }

          that.model.activeModel = that.model.filesInputs[value];
          let activeLabelCount = that.model.activeModel.labels.length 

          folder.removeFolder("Filter Labels");

          if(activeLabelCount> 0)
          {
          //refresh the contents of the labels folder                 

            folder3 = folder.addFolder("Filter Labels");
            toggle = {};
          }

          for(var i = 0; i< activeLabelCount; i++){

            let key = objToString(that.model.activeModel.labels[i])
            toggle[that.model.labelMap[key]] = true;
          }

          for(const key of Object.keys(toggle)){
            folder3.add(toggle, key).onChange((bool) => that.changeColorLabelled(bool, key));;
          }

          that.view.scene.add(that.model.activeModel);

          console.log(that.model.activeModel)
      });


      dropdownOutputs = dropdownOutputs.options(Object.keys(that.model.filesOutputs))
      dropdownOutputs.name('File Name');
      dropdownOutputs.onChange(function(value) {
             
        //if active model present, remove it
        if(that.model.activeModel)
        {
          that.view.scene.remove( that.model.activeModel);
        }

        that.model.activeModel = that.model.filesOutputs[value];
        let activeLabelCount = that.model.activeModel.labels.length 

        folder.removeFolder("Filter Labels");

        if(activeLabelCount> 0)
        {
        //refresh the contents of the labels folder                 

          folder3 = folder.addFolder("Filter Labels");
          toggle = {};
        }

        for(var i = 0; i< activeLabelCount; i++){

          let key = objToString(that.model.activeModel.labels[i])
          toggle[that.model.labelMap[key]] = true;
        }

        for(const key of Object.keys(toggle)){
          folder3.add(toggle, key).onChange((bool) => that.changeColorLabelled(bool, key));;
        }

        that.view.scene.add(that.model.activeModel);

        console.log(that.model.activeModel)
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

  changeColorLabelled(bool, label)
  {

    if(this.model.activeModel){

      var colors = this.model.activeModel.geometry.attributes.color;
      var visible = this.model.activeModel.geometry.attributes.visible;


      colors.needsUpdate = true;
      visible.needsUpdate = true;

      const key = Object.keys(this.model.labelMap).find(key => this.model.labelMap[key] === label)
      const vals = key.slice(1, key.length-1).split(", ");
      var cols = vals.map(Number);
      var cols = cols.map(x => x / 255.0);

      var onColor = new THREE.Color().fromArray(cols);
      console.log(onColor);

      //need to save the toggle status


      //loop over the color attributes
      for ( var i = 0; i < colors.count; i ++ ) {

        if(this.model.activeModel.labelledPoints[i] === label)
        {
          if(bool){
            visible.setX(i, 2.0);
          }
          else
          {
            visible.setX(i, 0.0);
          }
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