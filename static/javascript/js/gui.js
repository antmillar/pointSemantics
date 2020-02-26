export default class Controller
{

  constructor(view, geos)
  {
    this.gui = new dat.GUI();
    this.view = view;
    this.geos = geos;
    this.loadButton = document.querySelector("#loadButton");
    this.initialise();
  }

  initialise()
  {

    // this.loadButton.addEventListener('change', () =>  );
    
    var that = this;


    this.loadButton.addEventListener('change', function() {
        
        that.geos.loadGeometry(loadButton.files[0].name)
        dropdown = dropdown.options( Object.keys(that.geos.files)); //replaces old dropdown with new one
        dropdown.name('File Format');
        dropdown.onChange(function(value) {
        
          var selectedObject;
          if(selectedObject = that.view.scene.getObjectByName("ACTIVE"))
          {
            that.view.scene.remove( selectedObject );
            selectedObject.name = "INACTIVE";
          }

          console.log(that.geos.files[value]);
          that.view.scene.add(that.geos.files[value]);
          that.geos.files[value].name = "ACTIVE";
      });
    });
    

    const params = {
        loadFile: function() {document.querySelector('#loadButton').click();}
    };


    const color =  {
        modelcolor: 0.00
      };

      var obj = {add:function(){
        dropdown = dropdown.options( Object.keys(that.geos.files)); //replaces old dropdown with new one
        dropdown.name('File Format');
        dropdown.onChange(function(value) {
        
          var selectedObject;
          if(selectedObject = that.view.scene.getObjectByName("ACTIVE"))
          {
            that.view.scene.remove( selectedObject );
            selectedObject.name = "INACTIVE";
          }

          console.log(that.geos.files[value]);
          that.view.scene.add(that.geos.files[value]);
          that.geos.files[value].name = "ACTIVE";
      });
      
      }};


      this.gui.add(obj, 'add').name("refresh");
      this.gui.add(params, 'loadFile').name("Load File");
  
      var folder = this.gui.addFolder('Display Settings');

      folder.addColor(color, 'modelcolor').name('Model Color').onChange((value) => this.changeColor(value));

  
      var folder2 = folder.addFolder('Loaded Models');
      let dropdown = folder2.add({fileName : ""}, 'fileName', Object.keys(this.geos.files));
      dropdown.name('File Format');
      dropdown.onChange(function(value) {
      
        console.log(value);
    });
      
  
      folder.open();
      folder2.open();

  }

  changeColor(value)
  {

    console.log(this.view.scene.getObjectByName("ACTIVE"));
    //   var colors1 = model.children[0].geometry.attributes.color;
    if(selectedObject = this.view.scene.getObjectByName("ACTIVE")){
        console.log("GEL");
      var selectedObject = this.view.scene.getObjectByName("ACTIVE");
      var colors1 = selectedObject.geometry.attributes.color;


      for ( var i = 0; i < colors1.count; i ++ ) {
      
        var choice = Math.floor(Math.random());
        var color = new THREE.Color(value);
        colors1.setXYZ( i, color.r, color.g, color.b  * choice);
      }

      colors1.needsUpdate = true;
    }

  }

  load(value)
  {

    if(value === "OBJ")
    {
      this.geos.loadOBJ();
    //   console.log(this.geos.geos[0]);
      console.log(this.geos.geos[0]);
      var selectedObject = this.view.scene.getObjectByName("object_PLY");
      this.view.scene.add(this.geos.geos[0]);
    //   this.view.scene.remove( selectedObject );
    }
    else
    {
      this.geos.loadPLY();
      console.log(this.geos.geos[0]);
      var selectedObject = this.view.scene.getObjectByName("object_OBJ");
      this.view.scene.add(this.geos.geos[0]);
    //   this.view.scene.remove( selectedObject );
    }
  }
  }