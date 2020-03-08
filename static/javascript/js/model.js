//import loader helpers
import {OBJLoader2} from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/loaders/OBJLoader2.js';
import {PLYLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/loaders/PLYLoader.js';

export default class Geometries 
{

  constructor(name, type)
  {
    this.name = name;
    this.files = {};
    this.activeModel;
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
    this.eventLoaded = new Event('loaded');

  }

  //load geometry from a path
  loadGeometry(path)
  {
    let extn = path.substr(path.lastIndexOf('.') + 1);

    if(path in this.files)
    {
        //pass;
    }
    else if(extn.toUpperCase() === "PLY")
    {
      this.loadPLY(path);
    }
    else if (extn.toUpperCase() === "OBJ" )
    {
      this.loadOBJ(path);
    }
    else
    {
      console.error("Invalid Path Extension");
    }

  }

  //load PLY file from path
  loadPLY(path){

    const plyLoader = new PLYLoader();
    
    plyLoader.load('/static/models/' + path, (geometry) => {
    console.log('Loading : /static/models/' + path);
    geometry.computeVertexNormals();

    let visible = new Float32Array( geometry.attributes.position.count);
    visible.fill(2.0);
    geometry.setAttribute( 'visible', new THREE.BufferAttribute( visible, 1 ) );

    let material = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.1, vertexColors: THREE.VertexColors })


    let shaderMaterial = new THREE.ShaderMaterial({

      vertexShader : document.querySelector("#vtxShader").textContent,
      fragmentShader : document.querySelector("#frgShader").textContent
    })

    material = shaderMaterial;

    let pcd = new THREE.Points( geometry, material );
    pcd.name = path;

    let positions = geometry.getAttribute("position");
    let colors =  geometry.getAttribute("color");



    let colorsScaled = colors.array.map(x => x * 255.0);


    let state = path.substr(path.lastIndexOf('.') - 4, 4);

    console.log(state);

    //temporary way of only doing this for images that have labels
    if(state === "Post"){

      //split coords into triplets
      var coords = colorsScaled.reduce(function(result, _, index, array) {

        if(index % 3 === 0)
        {
          result.push(array.slice(index, index + 3));
        }
        return result

      }, []);

      pcd.labelledPoints = coords.map(x=> this.labelMap[objToString(x)]);

      let set = new Set(coords.map(JSON.stringify));
      let unique = Array.from(set).map(JSON.parse);

      pcd.labels = unique;

    }
    else
    {
      pcd.labels = [];
    }

    // //if from scannet need to rotate
    // if(path.slice(0,5) === "scene")
    // {
    pcd.rotation.x = -Math.PI / 2;
    // }
    
    function average(nums){return nums.reduce((a, b) => (a + b)) / nums.length}

    let xMean = average(positions.array.filter((_,i) => i % 3 === 0));
    let yMean = average(positions.array.filter((_,i) => (i+1) % 3 === 0));
    let zMin = Math.min(...positions.array.filter((_,i) => (i+2) % 3 === 0));

    //console.log(xMean,yMean,zMean);
      
    // pcd.position.x = -xMean;
    pcd.position.y = -zMin;
    // pcd.position.z = -yMean;

    pcd.scale.set(2, 2, 2);

    //add to loaded files
    this.files[path] = pcd;
    
    //dispatch event to say file loaded
    console.log(`Loaded : ${path}`);
    btnLoad.dispatchEvent(this.eventLoaded);
    });
    }

    //load OBJ file from path
    loadOBJ(path){
      {
        const objLoader = new OBJLoader2();
        console.log('Loading : /static/models/' + path);
      
        //need to update this to properly parse the file
        objLoader.load('/static/models/' + path, (geometry) => {
      
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
        
            let xMean = average(positions.array.filter((_,i) => i % 3 === 0));
            let yMean = average(positions.array.filter((_,i) => (i+1) % 3 === 0));
            let zMean = Math.min(...positions.array.filter((_,i) => (i+2) % 3 === 0));
        
            // console.log(xMean,yMean,zMean);
                
            object.position.x = -xMean * scale;
            object.position.y = -zMean * scale;
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

        object.labels = {};
      
        this.files[path] = object;
      
        //dispatch event to say file loaded
        console.log(`Loaded : ${path}`);
        btnLoad.dispatchEvent(this.eventLoaded);
        });
      }
      }

      //running the model on PLY file
      runModel()
      {
        console.error("not implemented yet")
        console.log(this.activeModel)
        //to implement here

        //check if the input is PLY file
        //convert the PLY file into a numpy array
        //pass into the model
        //save result to a new PLY file
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