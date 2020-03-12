import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/build/three.module.js';
import View from './js/view.js';
import Model from './js/model.js';
import Controller from './js/gui.js';
import Scene from './js/scene.js';

document.querySelector(".navbar").className = "navbar navbar-expand-lg navbar-light fixed-top"

var view = new View();
var model = new Model();

var controller = new Controller(view, model);

// function worker() {
//     $.get('progress/' + 1, function(data) {
//         if (data < 100) {
//             console.log(data)
//             setTimeout(worker, 1000)
//         }
//     })
// }

// worker()

//preload files present
// model.loadInputs(inputFiles);



//these arrays are loaded in the HTML template

model.loadScenes(inputFiles, outputFiles, meshFiles);
// model.loadOutputs(outputFiles);
// model.loadMeshes(meshFiles);
// console.log(model.filesInputs)
// console.log(model.filesOutputs)
// console.log(model.filesMeshes)
console.log(model.scenes)

requestAnimationFrame(() => view.render());