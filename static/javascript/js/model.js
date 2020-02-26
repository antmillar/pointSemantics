import {OBJLoader2} from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/loaders/OBJLoader2.js';
import {PLYLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/loaders/PLYLoader.js';

export default class Geometries 
{

  constructor(name, type)
  {
    this.name = name;
    this.files = [];
  }


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
      console.log(`Loaded : ${path}`)
    }
    else if (extn.toUpperCase() === "OBJ")
    {
      this.loadOBJ(path);
      console.log(`Loaded : ${path}`)
    }
    else
    {
      console.error("Invalid Path Extension");
    }

   console.log(this.files);
  }


  loadPLY(path){
    const plyLoader = new PLYLoader();
    console.log('/static/models/' + path);
    
    plyLoader.load('/static/models/' + path, (geometry) => {
    
    
      geometry.computeVertexNormals();
    
      let material = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.1, vertexColors: THREE.VertexColors })
      let mesh = new THREE.Points( geometry, material );


    var positions = geometry.getAttribute("position");
    var count = Math.floor(positions.count / 3);
    console.log(count);

    var xsum = 0;
    var ysum = 0;
    var zsum = 0;

    for (let i = 0; i < count - 1; i++ ) {

        xsum += positions.array[i];
        ysum += positions.array[i + 1];
        zsum += positions.array[i + 2];
    }

console.log(ysum);
    var xmean = xsum / count;
    var ymean = ysum / count;    
    var zmean = zsum / count;

    console.log(xmean, ymean, zmean);

        
      mesh.position.x = xmean;
      mesh.position.y = ymean;
      mesh.position.z = zmean;

      console.log(mesh);
      mesh.name = "INACTIVE";

      //if from scannet
      if(path.slice(0,5) === "scene")
      {
        mesh.rotation.x = -Math.PI / 2;
      }
      mesh.scale.set(1.5, 1.5, 1.5);
      this.files[path] = mesh;
      
      // scene.add( mesh );
      
    
      });
    }

    loadOBJ(path){
      //OBJ Loader
      {
        const objLoader = new OBJLoader2();
        console.log('/static/models/' + path);
      
        //need to update this to properly parse the file
        objLoader.load('/static/models/' + path, (geometry) => {
      
          
          let object = geometry.children[0];
          var count = object.geometry.attributes.position.count;
          
          object.geometry.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array( count * 3 ), 3 ) );
    
    
          var color = new THREE.Color();
          var colors1 = object.geometry.attributes.color;
        //   console.log(count);
      
          var cols = [0.0, 0.25, 0.5, 0.75];
      
            for ( var i = 0; i < count; i ++ ) {
              var choice = Math.floor(Math.random() * 4);
              // color.setRGB(  ( geometry.children[0].geometry.attributes.position.getX( i ) / 10 + 1 ) / 2, 0.2 ,1.0 - ( geometry.children[0].geometry.attributes.position.getZ( i ) / 10 + 1 ) / 2 );
              color.setRGB(cols[choice], cols[choice], cols[choice]);
              colors1.setXYZ( i, color.r, color.g, color.b );
            }
            object.geometry.attributes.color.needsUpdate = true;

            object.name = "INACTIVE";
        // model.scale.set(2, 2, 2);
      
        const INITIAL_MTL = new THREE.MeshPhongMaterial( { shininess: 10 , vertexColors: THREE.VertexColors } ); //color: 0xf1f1f1, 


        function initColor(parent, mtl) {
            parent.traverse((o) => {
            if (o.isMesh) {
                    o.material = mtl;
            }
          });
          }

        //assign vertex colors material to model
        initColor(object, INITIAL_MTL);
      
        console.log(object);
        
      
        // scene.add(model);
        this.files[path] = object;
        
        });
      }
      }
}

 