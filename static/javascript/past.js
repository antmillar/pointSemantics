import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/controls/OrbitControls.js';
import {OBJLoader2} from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/loaders/OBJLoader2.js';
import {PLYLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/loaders/PLYLoader.js';


  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});

  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('white');

  var model;

  const INITIAL_MTL = new THREE.MeshPhongMaterial( { shininess: 10 , vertexColors: THREE.VertexColors } ); //color: 0xf1f1f1, 

  function initColor(parent, mtl) {
    parent.traverse((o) => {
     if (o.isMesh) {
            o.material = mtl;
     }
   });
  }

  //grid set up
  {

  const size = 100;
  const divisions = 100;
  let helper = new THREE.GridHelper( size, divisions, 0xAAAAAA, 0xEEEEEE );
  scene.add( helper );
  
  }

  //lighting set up
  {
  var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.5 );
  hemiLight.position.set( 0, 50, 0 );
  scene.add( hemiLight );

  var dirLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  dirLight.position.set( -5, 10, 5 );
  dirLight.castShadow = true;
  dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
  scene.add(dirLight);
  }


//dat GUI



function loadPLY(){
  const plyLoader = new PLYLoader();
  
  plyLoader.load('static/models/norm.ply', (geometry) => {
  
  
    geometry.computeVertexNormals();
    console.log(geometry);
  
    let material = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.1, vertexColors: THREE.VertexColors })
    let mesh = new THREE.Points( geometry, material );
  
    mesh.position.x = - 0.2;
    mesh.position.y = - 0.02;
    mesh.position.z = - 0.2;
    mesh.name = "object_PLY";
    scene.add( mesh );
  
  
    });
  }


function loadOBJ(){
  //OBJ Loader
  {
    const objLoader = new OBJLoader2();
  
    objLoader.load('static/models/SpatialMapping.obj', (root) => {
  
  
      var count = root.children[0].geometry.attributes.position.count;
      
      root.children[0].geometry.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array( count * 3 ), 3 ) );


      var color = new THREE.Color();
      var colors1 = root.children[0].geometry.attributes.color;
      console.log(count);
  
      var cols = [0.0, 0.25, 0.5, 0.75];
  
        for ( var i = 0; i < count; i ++ ) {
          var choice = Math.floor(Math.random() * 4);
          // color.setRGB(  ( root.children[0].geometry.attributes.position.getX( i ) / 10 + 1 ) / 2, 0.2 ,1.0 - ( root.children[0].geometry.attributes.position.getZ( i ) / 10 + 1 ) / 2 );
          color.setRGB(cols[choice], cols[choice], cols[choice]);
          colors1.setXYZ( i, color.r, color.g, color.b );
        }
        root.children[0].geometry.attributes.color.needsUpdate = true;
    // var colors = new Float32Array( root.children[0].geometry.attributes.color.count * 3); // 3 vertices per point
    // root.children[0].geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
  
    // var x, y, z, index;
    // x = y = z = index = 0;
  
    // for ( var i = 0, l =  root.children[0].geometry.attributes.color.count; i < l; i ++ ) {
  
    //     colors[ index ++ ] = x;
    //     colors[ index ++ ] = y;
    //     colors[ index ++ ] = z;
    
    // }
    
    model = root;
    model.name = "object_OBJ";
    model.scale.set(2, 2, 2);
  
    //assign vertex colors material to model
    initColor(model, INITIAL_MTL);
  
    console.log(model);
    
  
    scene.add(model);
  
  
    });
  }
  }


  
  {
    const params = {
      modelcolor: 0.00
    };
  
    const text = {
      speed: "PLY",
      load: ""
    };

  var gui = new dat.GUI();

  var folder = gui.addFolder('Display Settings');
  folder.addColor(params, 'modelcolor')
    .name('Model Color')
    .onChange(function() {

      //const mtl = new THREE.MeshPhongMaterial( { shininess: 10 , vertexColors: THREE.VertexColors } ); //color: 0xf1f1f1, 

      // model.children[0].geometry.colorsNeedUpdate = true; 

  
      var colors1 = model.children[0].geometry.attributes.color;

      // model.children[0].geometry.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array( colors1.count * 3 ), 3 ) );
      for ( var i = 0; i < colors1.count; i ++ ) {
        // color.setRGB(  ( root.children[0].geometry.attributes.position.getX( i ) / 10 + 1 ) / 2, 0.2 ,1.0 - ( root.children[0].geometry.attributes.position.getZ( i ) / 10 + 1 ) / 2 );
           
        var choice = Math.floor(Math.random());
        var color = new THREE.Color(params.modelcolor);
        colors1.setXYZ( i, color.r, color.g, color.b  * choice);
      }

      colors1.needsUpdate = true;
      //initColor(model, mtl);
      // var colors = new Float32Array( model.children[0].geometry.attributes.position.count * 3); // 3 vertices per point
      // model.children[0].geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
  
      // model.children[0].geometry.attributes.color.needsUpdate = true;
      // var x, y, z, index;
      // x = y = z = index = 0.5;
  
      // for ( var i = 0, l =  model.children[0].geometry.attributes.position.count; i < l; i ++ ) {
  
      //     colors[ index ++ ] = x;
      //     colors[ index ++ ] = y;
      //     colors[ index ++ ] = z;
      
      // }
  
      console.log(model);
      
    });
  var folder2 = folder.addFolder('Model Settings');
  folder2.add(text, 'speed', { OBJ : "OBJ", PLY : "PLY"} )
    .name('File Format')
    .onChange(function(value) {
      
      if(value === "OBJ")
      {
        loadOBJ()
        var selectedObject = scene.getObjectByName("object_PLY");
        scene.remove( selectedObject );
      }
      else
      {
        loadPLY();
        var selectedObject = scene.getObjectByName("object_OBJ");
        scene.remove( selectedObject );
      }
    });


  folder.open();
  folder2.open();
  
  }



  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render() {

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    
    renderer.render(scene, camera);

    // model.attributes.color.needsUpdate = true;
    requestAnimationFrame(render);
  }
 
  requestAnimationFrame(render);

