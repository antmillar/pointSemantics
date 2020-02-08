
 var width = window.innerWidth;
var height = window.innerHeight;
var viewAngle = 75;
var nearClipping = 0.1;
var farClipping = 9999;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( viewAngle, width / height, nearClipping, farClipping );
var renderer = new THREE.WebGLRenderer();
renderer.setSize( width, height );
document.body.appendChild( renderer.domElement );


// var geometry = new THREE.BoxGeometry();
// var material = new THREE.MeshLambertMaterial({color: "aqua"});
// var cube = new THREE.Mesh(geometry, material);



var points = [];

var numpts = 100;
var colors = new Float32Array( numpts * 3 );
for(var i = 0; i < numpts; i++)
{
    var x = Math.random() * 5 - 2.5;
    var y = Math.random() * 5 - 2.5;
    var z = Math.random() * 5 - 5;

    var pt = new THREE.Vector3(x, y, z);
    points.push(pt);

    colors[3*i] =  x / 5;
    colors[3*i + 1] =  y  / 5;
    colors[3*i + 2] = y / 5;


}


var geometry = new THREE.BufferGeometry().setFromPoints(points);

geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );


var material = new THREE.PointsMaterial({size: 0.05, vertexColors: THREE.VertexColors});
var pointCloud = new THREE.Points(geometry, material);

scene.add(pointCloud);

camera.position.z = 5;



var light = new THREE.PointLight(0xFFFFFF);
light.position.x = 0;
light.position.y = 2;
light.position.z = -2;
scene.add(light);



function animate() 
{

requestAnimationFrame( animate );

// cube.rotation.x += 0.01;
// cube.rotation.y += 0.01;
renderer.render( scene, camera ); 
}

animate();