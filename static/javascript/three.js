import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/controls/OrbitControls.js';
import {OBJLoader2} from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/loaders/OBJLoader2.js';



//  var width = window.innerWidth;
// var height = window.innerHeight;
// var viewAngle = 75;
// var nearClipping = 0.1;
// var farClipping = 9999;
// var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera( viewAngle, width / height, nearClipping, farClipping );
// var renderer = new THREE.WebGLRenderer();
// renderer.setSize( width, height );
// document.body.appendChild( renderer.domElement );


// // var geometry = new THREE.BoxGeometry();
// // var material = new THREE.MeshLambertMaterial({color: "aqua"});
// // var cube = new THREE.Mesh(geometry, material);



// var points = [];

// var numpts = 100;
// var colors = new Float32Array( numpts * 3 );
// for(var i = 0; i < numpts; i++)
// {
//     var x = Math.random() * 5 - 2.5;
//     var y = Math.random() * 5 - 2.5;
//     var z = Math.random() * 5 - 5;

//     var pt = new THREE.Vector3(x, y, z);
//     points.push(pt);

//     colors[3*i] =  x / 5;
//     colors[3*i + 1] =  y  / 5;
//     colors[3*i + 2] = y / 5;
// }

// var geometry = new THREE.BufferGeometry().setFromPoints(points);

// geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );


// var material = new THREE.PointsMaterial({size: 0.05, vertexColors: THREE.VertexColors});
// var pointCloud = new THREE.Points(geometry, material);

// scene.add(pointCloud);

// camera.position.z = 5;



// var light = new THREE.PointLight(0xFFFFFF);
// light.position.x = 0;
// light.position.y = 2;
// light.position.z = -2;
// scene.add(light);



// function animate() 
// {

// requestAnimationFrame( animate );

// // cube.rotation.x += 0.01;
// // cube.rotation.y += 0.01;
// renderer.render( scene, camera ); 
// }

// animate();


function main() {
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
  scene.background = new THREE.Color('black');

  var model;

  const INITIAL_MTL = new THREE.MeshPhongMaterial( { color: 0xf1f1f1, shininess: 10 } );

  function initColor(parent, mtl) {
    parent.traverse((o) => {
     if (o.isMesh) {
            o.material = mtl;
     }
   });
  }



  {
    const planeSize = 40;

    // const loader = new THREE.TextureLoader();
    // const texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/checker.png');
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;
    // texture.magFilter = THREE.NearestFilter;
    // const repeats = planeSize / 2;
    // texture.repeat.set(repeats, repeats);

    // const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
    // const planeMat = new THREE.MeshPhongMaterial({
    //   map: texture,
    //   side: THREE.DoubleSide,
    // });
    // const mesh = new THREE.Mesh(planeGeo, planeMat);
    // mesh.rotation.x = Math.PI * -.5;
    // scene.add(mesh);

    let helper = new THREE.GridHelper( 1200, 640, 0xFFFFFF, 0x404040 );
	scene.add( helper );
  }

  {
    
  // Add lights
  var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.61 );
  hemiLight.position.set( 0, 50, 0 );
  // Add hemisphere light to scene   
  scene.add( hemiLight );
  }

  {

  var dirLight = new THREE.DirectionalLight( 0xffffff, 0.54 );
  dirLight.position.set( -8, 12, 8 );
  dirLight.castShadow = true;
  dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
  // Add directional Light to scene

  scene.add(dirLight);
  }


  var params = {
    modelcolor: 0.5
  };

var gui = new dat.GUI();
var folder = gui.addFolder('Model Colour');
folder.addColor(params, 'modelcolor')
  .name('Model Color')
  .onChange(function() {
    //console.log(params.modelcolor);
    var new_mtl = new THREE.MeshPhongMaterial( { color: params.modelcolor, shininess: 10 } );

    initColor(model, new_mtl);

    console.log(model);
    
  });
folder.open();


  {
    const objLoader = new OBJLoader2();
 
    objLoader.load('static/models/SpatialMapping.obj', (root) => {
    // root.children[0].geometry.attributes.color.needsUpdate = true;
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

    model.scale.set(2, 2, 2);

    initColor(model, INITIAL_MTL);

    console.log(model);
    

    scene.add(model);


    });
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

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
