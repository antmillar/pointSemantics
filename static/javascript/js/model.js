//import loader helpers
import {OBJLoader2} from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/loaders/OBJLoader2.js';
import {PLYLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/loaders/PLYLoader.js';
import Shaders from './shaders.js'
import Scene from './scene.js'

export default class Model 
{

  constructor(name)
  {
    this.name = name;
    this.filesInputs = {};
    this.filesOutputs = {};
    this.filesMeshes = {};
    this.activeModelInput;
    this.activeModelOutput;
    this.activeModelMesh;
    this.activeScene;
    this.scenes = {};

    this.eventLoaded = new Event('loaded');    
    this.pathInput = "/static/models/inputs/";
    this.pathLabelled = "/static/models/outputs/";
    this.pathMesh = "/static/models/meshes/";
    this.defaultPointSize = 3.0;
    this.defaultOpacity = 1.0;

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
    


  }

  loadScenes(inputFiles, labelFiles, meshFiles)
  {
    //item is a fn
    var that = this;
    inputFiles.forEach(function(item, index){

    var scene = new Scene(item);
    that.scenes[item] = scene;
    })

    for (const [name, scene] of Object.entries(that.scenes)) {

      //add files in input directory to scene objet
      that.loadGeometry(name, scene, that.pathInput, "input");

      //add files in labelled directory to scene object
      let label_name = name.slice(0, -4) + "_labels.ply"
      if(labelFiles.includes(label_name))
        {
          that.loadGeometry(label_name, scene, that.pathLabelled, "output");
        }

      //add files in mesh directory to scene object
      let mesh_name = name.slice(0, -4) + "_labels.obj"
      if(meshFiles.includes(mesh_name))
        {
          that.loadGeometry(mesh_name, scene, that.pathMesh, "mesh");
        }
    }

    console.log(that.scenes)
  }
  
  //load geometry from a fn
  loadGeometry(fn, scene, root, type)
  {
    let extn = fn.substr(fn.lastIndexOf('.') + 1);

    if(false)//fn in dest)
    {
        //pass;
    }
    else if(extn.toUpperCase() === "PLY")
    {
      this.loadPLY(fn, scene, root, type);
    }
    else if (extn.toUpperCase() === "OBJ" )
    {
      this.loadOBJ(fn, scene, root);
    }
    else if (extn.toUpperCase() === "MTL" )
    {
      console.log(`Skipped MTL File : ${fn}`);
    }
    else
    {
      console.error("Invalid Path Extension");
    }


  }

  //load PLY file from fn
  loadPLY(fn, scene, root, type){

    const plyLoader = new PLYLoader();

    plyLoader.load(root + fn, (geometry) => {

    console.log('Loading : ' + root + fn);

    geometry.computeVertexNormals();
    //assign point sizes
    let pointSize = new Float32Array( geometry.attributes.position.count);
    pointSize.fill(this.defaultPointSize);
    geometry.setAttribute( 'pointSize', new THREE.BufferAttribute( pointSize, 1 ) );

    //assign opacity
    let opacity = new Float32Array( geometry.attributes.position.count);
    opacity.fill(this.defaultOpacity);
    geometry.setAttribute( 'opacity', new THREE.BufferAttribute( opacity, 1.0 ) );

    //assign materials
    let material = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.1, vertexColors: THREE.VertexColors })

    let shaderMaterial = new THREE.ShaderMaterial({

      vertexShader : Shaders.vertexShader(),
      fragmentShader : Shaders.fragmentShader(),
      // blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,

    })


    //create point cloud
    let pcd = new THREE.Points( geometry, shaderMaterial );
    pcd.name = fn;
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
    if(type == "output"){


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
    // dest[fn] = pcd;
    

    if(type == "input")
    {      
      scene.inputPLY = pcd;
    }
    else if(type == "output")
    {
      scene.labelledPLY = pcd;
    }
 

    // this.scenes[fn] = scene;

    //dispatch event to say file loaded
    btnLoad.dispatchEvent(this.eventLoaded);
    console.log(`Loaded : ${fn}`);
    });
  }


    //load OBJ file from fn
    loadOBJ(fn, scene, root){
      {
        const objLoader = new OBJLoader2();
        console.log('Loading : ' + root + fn);
      
        //need to update this to properly parse the file
        objLoader.load(root + fn, (geometry) => {
      
          //hacky check for whether geometry in children

          let object;

          if(!(object = geometry.children[0]))
          {

            object = geometry;
          }
          object.name = fn;
          var count = object.geometry.attributes.position.count;
          
            let scale = 2;
            if(fn.slice(0,5) == "chair"){
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
    
        const mat = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors, side: THREE.DoubleSide } ); //color: 0xf1f1f1, 

        function initColor(parent, mtl) {
        parent.traverse((o) => {
            if (o.isMesh) {
                    o.material = mtl;
            }
          });
          }

        //assign vertex colors material to model
        initColor(object, mat);
      
        scene.mesh = object;
        //dispatch event to say file loaded
        console.log(`Loaded : ${fn}`);
        btnLoad.dispatchEvent(this.eventLoaded);
        });
      }
      }

      //running the model on input PLY file
      runModel()
      {
        //if there is an active scene
        if(this.activeScene)
        {

        document.querySelector("#fileNameInput").value = this.activeScene.name;
        document.querySelector('#btnModel').submit();
        alert("Running Model...");

        } 
        else 
        {
          alert("Warning : No Scene Selected")
        }
      }


      createMesh()
      {
        // console.error("not implemented yet")
        if(this.activeScene){
          if(this.activeScene.labelledPLY){

            let filters = this.collateFilters();
            document.querySelector("#filters").value = filters;
            document.querySelector("#fileNameOutput").value = this.activeScene.labelledPLY.name;
            document.querySelector('#btnMesh').submit();
            alert("Generating Mesh...");

          } 
          else 
          {
            alert("Warning : Must Generate a Labelled PLY File first by running the model")
          }
        }
        else
        {
          alert("Warning : No Scene Selected")
        }
        
      }

      //generate list of labels to be filtered server side
      collateFilters()
      {
        var that = this;
        let labelsToFilter = [];

        Object.keys(that.activeScene.labelledPLY.display).forEach(function(item, index)
        {
          if(that.activeScene.labelledPLY.display[item] === false)
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
