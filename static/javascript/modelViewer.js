import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/build/three.module.js';
import View from './js/view.js';
import Model from './js/model.js';
import Controller from './js/gui.js';

var view = new View();
var model = new Model();

var controller = new Controller(view, model);

//preload the default geometries
// const preload = ['scene3Pre.ply', 'scene3Post.ply', 'scene3colPost.obj', 'officePre.ply', 'officePost.ply', 'chair.obj' ]
//these are passed from python in the html template
// const inputFiles = inputFiles;
// const outputFiles = outputFiles;

model.loadInputs(inputFiles);
model.loadOutputs(outputFiles);

console.log(model.inputFiles)
console.log(model.outputFiles)


requestAnimationFrame(() => view.render());