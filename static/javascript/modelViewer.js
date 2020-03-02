import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/build/three.module.js';
import View from './js/view.js';
import Geometries from './js/model.js';
import Controller from './js/gui.js';

var view = new View();
var geos = new Geometries();

var controller = new Controller(view, geos);

//preload the default geometries
const preload = ['SpatialMappingPost.ply', 'SpatialMapping.obj']
preload.forEach((item) => geos.loadGeometry(item));

requestAnimationFrame(() => view.render());