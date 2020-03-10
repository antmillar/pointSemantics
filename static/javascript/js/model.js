//import loader helpers
import {OBJLoader2} from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/loaders/OBJLoader2.js';
import {PLYLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/loaders/PLYLoader.js';
import Shaders from './shaders.js'

export default class Model 
{

  constructor(name, type)
  {
    this.name = name;
    this.filesInputs = {};
    this.filesOutputs = {};
    this.filesMeshes = {};
    this.activeModelInput;
    this.activeModelOutput;
    this.activeModelMesh;

    this.labelMap =   {

    "[152, 223, 138]":		 "floor",
    "[174, 199, 232]":		 "wall",
    "[31, 119, 180]" :		 "cabinet",
    "[255, 187, 120]":		 "bed",
    "[188, 189, 34]": 		 "chair",
    "[140, 86, 75]":  		 "sofa",
    "[255, 152, 150]":		 "table",
    "[214, 39, 40]":  		 "door",
    "[197, 176, 213]":		 "window",
    "[148, 103, 189]":		 "bookshelf",
    "[196, 156, 148]":		 "picture",
    "[23, 190, 207]":		 "counter",
    "[247, 182, 210]"	:	 "desk",
    "[219, 219, 141]":		 "curtain",
    "[255, 127, 14]":		 "refrigerator",
    "[227, 119, 194]":		 "bathtub",
    "[158, 218, 229]":		 "shower curtain",
    "[44, 160, 44]":  		 "toilet",
    "[112, 128, 144]":		 "sink",
    "[82, 84, 163]":      "otherfurn"

    }

    // this.mapping = {

    //  "floor"          :  {"color" : "[152, 223, 138]"	, "index" :  1},
    //  "wall"           :  {"color" : "[174, 199, 232]" , "index" :  2},
    //  "cabinet"        :  {"color" : "[31, 119, 180]" , "index" :  3},
    //  "bed"            :  {"color" : "[255, 187, 120]", "index" :  4},
    //  "chair"          :  {"color" : "[188, 189, 34]"	, "index" :  5},
    //  "sofa"           :  {"color" : "[140, 86, 75]"	 , "index" :  6},
    //  "table"          :  {"color" : "[255, 152, 150]", "index" :  7},
    //  "door"           :  {"color" : "[214, 39, 40]", "index" :  8},
    //  "window"         :  {"color" : "[197, 176, 213]", "index" : 9},
    //  "bookshelf"      :  {"color" : "[148, 103, 189]", "index" :  10},
    //  "picture"        :  {"color" : "[196, 156, 148]"	, "index" :  11},
    //  "counter"        :  {"color" : "[23, 190, 207]"	, "index" :  12},
    //  "desk"           :  {"color" : "[247, 182, 210]", "index" :  13},
    //  "curtain"        :  {"color" : "[219, 219, 141]"	, "index" :  14},
    //  "refrigerator"   :  {"color" : "[255, 127, 14]", "index" :  15},
    //  "bathtub"        :  {"color" : "[227, 119, 194]"	, "index" :  16},
    //  "shower curtain" :  {"color" : "[158, 218, 229]"	, "index" :  17},
    //  "toilet"         :  {"color" : "[44, 160, 44]" 	, "index" :  18},
    //  "sink"           :  {"color" : "[112, 128, 144]"	, "index" :  19},
    //  "otherfurn"      :  {"color" : "[82, 84, 163]", "index" :  20}
    // };
    
    this.eventLoaded = new Event('loaded');
    this.pathInput = "/static/models/inputs/";
    this.pathOutput = "/static/models/outputs/";
    this.pathMesh = "/static/models/meshes/";
    this.defaultPointSize = 3.0;

  }

  loadInputs(files)
  {
    files.forEach((item) => this.loadGeometry(item, this.filesInputs, this.pathInput));
  }

  loadOutputs(files)
  {
    files.forEach((item) => this.loadGeometry(item, this.filesOutputs, this.pathOutput, true));
  }

  loadMeshes(files)
  {
    files.forEach((item) => this.loadGeometry(item, this.filesMeshes, this.pathMesh, true));
  }
  
  //load geometry from a path
  loadGeometry(fn, dest, root, labelled = false)
  {
    let extn = fn.substr(fn.lastIndexOf('.') + 1);

    if(false)//fn in dest)
    {
        //pass;
    }
    else if(extn.toUpperCase() === "PLY")
    {
      this.loadPLY(fn, dest, root, labelled);
    }
    else if (extn.toUpperCase() === "OBJ" )
    {
      this.loadOBJ(fn, dest, root);
    }
    else
    {
      console.error("Invalid Path Extension");
    }

  }

  //load PLY file from path
  loadPLY(path, dest, root, labelled){

    const plyLoader = new PLYLoader();
    
    plyLoader.load(root + path, (geometry) => {

    console.log('Loading : ' + root + path);

    geometry.computeVertexNormals();

    //assign point sizes
    let pointSize = new Float32Array( geometry.attributes.position.count);
    pointSize.fill(this.defaultPointSize);
    geometry.setAttribute( 'pointSize', new THREE.BufferAttribute( pointSize, 1 ) );

    //assign materials
    let material = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.1, vertexColors: THREE.VertexColors })

    let shaderMaterial = new THREE.ShaderMaterial({

      vertexShader : Shaders.vertexShader(),
      fragmentShader : Shaders.fragmentShader()
    })

    //create point cloud
    let pcd = new THREE.Points( geometry, shaderMaterial );
    pcd.name = path;
    pcd.labels = [];
    pcd.rotation.x = -Math.PI / 2;

    let positions = geometry.getAttribute("position");
    let count = positions.count

    //rescaling and translating for the canvas
    function average(nums){return nums.reduce((a, b) => (a + b)) / nums.length}

    let xMean = average(positions.array.filter((_,i) => i % 3 === 0));
    let yMean = average(positions.array.filter((_,i) => (i+1) % 3 === 0));
    let zMin = Math.min(...positions.array.filter((_,i) => (i+2) % 3 === 0));

    //console.log(xMean,yMean,zMean);
      
    // pcd.position.x = -xMean;
    pcd.position.y = -zMin;
    // pcd.position.z = -yMean;

    pcd.scale.set(2, 2, 2);


    //if no color present create new buffer attribute
    if(!geometry.getAttribute("color")){
      geometry.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array( count * 3 ), 3 ) );
    }

    let colors =  geometry.getAttribute("color");
    let colorsScaled = colors.array.map(x => x * 255.0);

    //if file has labels process these
    if(labelled){


      //extract color r g b into triplets as strings e.g [""]
      var coords = colorsScaled.reduce(function(result, _, index, array) {

        if(index % 3 === 0)
        {
          result.push(array.slice(index, index + 3));
        }
        return result

      }, []);

      pcd.labelledPoints = coords.map(x=> this.labelMap[objToString(x)]);

      //extract the set of colors present
      let set = new Set(coords.map(JSON.stringify));
      let unique = Array.from(set).map(JSON.parse);

      pcd.labels = unique.map(x => this.labelMap[objToString(x)]);
      pcd.display = {};
      pcd.labels.forEach(label => {pcd.display[label] = true;});
      pcd.toggles = [];
    }
      
    //add to loaded filesInputs
    dest[path] = pcd;
    
    //dispatch event to say file loaded
    btnLoad.dispatchEvent(this.eventLoaded);
    console.log(`Loaded : ${path}`);
    });
  }


    //load OBJ file from path
    loadOBJ(path, dest, root){
      {
        const objLoader = new OBJLoader2();
        console.log('Loading : ' + root + path);
      
        //need to update this to properly parse the file
        objLoader.load(root + path, (geometry) => {
      
          //hacky check for whether geometry in children

          let object;

          if(!(object = geometry.children[0]))
          {

            object = geometry;
          }
          object.name = path;
          var count = object.geometry.attributes.position.count;
          
          if(path != "scene3colPost.obj"){
          object.geometry.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array( count * 3 ), 3 ) );
    
          var color = new THREE.Color();
          var colors1 = object.geometry.attributes.color;

      
            for ( var i = 0; i < count; i ++ ) {
              var choice = Math.floor(Math.random() * 4);
              color.setRGB(0.75, 0.75, 0.75);
              colors1.setXYZ( i, color.r, color.g, color.b );
            }
          }
            let scale = 2;
            if(path.slice(0,5) == "chair"){
            scale = 0.005
            // object.rotation.x = -Math.PI / 2;
            }
            object.rotation.x = -Math.PI / 2;
            object.scale.set(scale, scale, scale);

            var positions = object.geometry.getAttribute("position");

            function average(nums){return nums.reduce((a, b) => (a + b)) / nums.length}
            console.log(positions.count);
        
            let xMean = average(positions.array.filter((_,i) => i % 3 === 0));
            let yMean = average(positions.array.filter((_,i) => (i+1) % 3 === 0));
            // let zMean = Math.min(...positions.array.filter((_,i) => (i+2) % 3 === 0));
        
            // console.log(xMean,yMean,zMean);
                
            object.position.x = -xMean * scale;
            // object.position.y = -zMean * scale;
            object.position.z = -yMean * scale;
    
        const mat = new THREE.MeshPhongMaterial( { shininess: 10 , vertexColors: THREE.VertexColors } ); //color: 0xf1f1f1, 

        function initColor(parent, mtl) {
            parent.traverse((o) => {
            if (o.isMesh) {
                    o.material = mtl;
            }
          });
          }

        //assign vertex colors material to model
        initColor(object, mat);
      
        dest[path] = object;
      
        //dispatch event to say file loaded
        console.log(`Loaded : ${path}`);
        btnLoad.dispatchEvent(this.eventLoaded);
        });
      }
      }

      //running the model on input PLY file
      runModel()
      {

        if(this.activeModelInput){

        document.querySelector("#fileNameInput").value = this.activeModelInput.name;
        document.querySelector('#btnModel').submit();
        alert("Running Model...");

        } else {
          alert("Warning : Please select an input PLY file to segment")
        }
        //to implement here

        //check if the input is PLY file
        //convert the PLY file into a numpy array
        //pass into the model
        //save result to a new PLY file
      }


      createMesh()
      {
        // console.error("not implemented yet")
        if(this.activeModelOutput){

          let filters = this.collateFilters();
          document.querySelector("#filters").value = filters;
          document.querySelector("#fileNameOutput").value = this.activeModelOutput.name;
          document.querySelector('#btnMesh').submit();
          alert("Generating Mesh...");

        } else {
          alert("Warning : Please select an output PLY file to be meshed")
        }
      }

      //generate list of labels to be filtered server side
      collateFilters()
      {
        var that = this;
        let labelsToFilter = [];

        Object.keys(that.activeModelOutput.display).forEach(function(item, index)
        {
          if(that.activeModelOutput.display[item] === false)
          {
            labelsToFilter.push(item)
          }
        })
        
        return labelsToFilter;
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