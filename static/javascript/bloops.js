var n = 16;
var genomes = [];
var mapping = { "00" : "aquamarine", "01" : "MediumTurquoise", "10" : "Salmon", "11" : "PeachPuff"};
var squares = [];
var cell_centers = [];
var bloops = [];
var parents = [];
var gridWidth = 4;


function Bloop(index, pos, radius, color) {

    this.radius = radius;
    this.color = color;
    this.pos = pos;
    this.points = 5;
    this.torsos = 3;
    this.sizeEye = 10;
    this.sizeNose = 5;
    this.name = index;
  }

Bloop.prototype.draw = function(cell_center)
{
	for (var i = 0; i < this.torsos; i++) {
		var newpoints = this.points + Math.floor(Math.random() * this.points) * (4-i)/2 ; //random change no. of points
		var path = this.createBody(cell_center, this.radius, newpoints);
		var lightness = Math.random() * 0.2 + 0.7;
		var hue = Math.random() * 360;
        //path.fillColor = { hue: hue, saturation: 1.0, lightness: lightness };
        path.fillColor = mapping[genomes[this.name]];
    };

    var eyePos = 20;

    var eye = new Shape.Circle(cell_center - [eyePos,0], this.sizeEye);
    eye.fillColor = 'white';
    var eye2 = new Shape.Circle(cell_center + [eyePos,0], this.sizeEye);
    eye2.fillColor = 'white';
    
    var eye = new Shape.Circle(cell_center - [eyePos,0], this.sizeEye * 0.75);
    eye.fillColor = 'black';
    var eye2 = new Shape.Circle(cell_center + [eyePos,0], this.sizeEye * 0.75);
    eye2.fillColor = 'black';

    var eye3 = new Shape.Circle(cell_center - [eyePos,0], this.sizeEye * 0.25);
    eye3.fillColor = 'white';
    var eye4 = new Shape.Circle(cell_center + [eyePos,0] - 2, this.sizeEye * 0.25);
    eye4.fillColor = 'white';

    var nose = new Shape.Circle(cell_center + [0,15], this.sizeNose);
    nose.fillColor = 'black';

}

Bloop.prototype.createBody = function (center, radius, points) {
	var path = new Path();
	path.closed = true;
	for (var i = 0; i < points; i++) {
		var delta = new Point({
			length: (radius * 0.5) + (Math.random() * radius * 0.5),
			angle: (360 / points) * i
		});
		path.add(center + delta);
	}
	path.smooth();
	return path;
}


function clearData(){
    
    project.activeLayer.removeChildren();
}

function setup(){

    generateGenomes();
    generatePointGrid(gridWidth);
    addButton();
}

//create button to generate next generation
function addButton(){
    var rectangle = new Rectangle(view.center - new Point(60, 20), new Size(120, 40));
    var cornerSize = new Size(10, 10);
    var shape = new Shape.Rectangle(rectangle, cornerSize);
    shape.fillColor = 'LightSeaGreen';

    shape.onMouseDown = function(event){
        nextGeneration();
        clearData();
        setup();
    }    
}

function Cell(cell_center, cellSize) {
    
    var size = new Size(cellSize * 0.9, cellSize * 0.9);
    var rect = new Shape.Rectangle(cell_center - [cellSize * 0.9/2 , cellSize * 0.9/2], size);
    rect.fillColor = 'white';
    rect.strokeColor = "Turquoise";
    rect.strokeWidth = 0;

    rect.onMouseDown = function(event) {
        if(this.chosen == false || this.chosen == null){
            this.strokeWidth = 6;
            this.chosen = true;
        }
        else
        {
            this.strokeWidth = 0;
            this.chosen = false;
        }
    }
}

function generatePointGrid(cellCount) {
    var cellWidth = view.size.width / cellCount;
    var cellHeight = view.size.height / cellCount;
	for(var i = 0; i < cellCount; i++) {
		for(var j = 0; j < cellCount; j++) {
			var cell_center = new Point(i * cellWidth + cellWidth/2, j * cellHeight + cellHeight / 2);
            cell_centers.push(cell_center);
            
            cell = new Cell(cell_center, cellHeight);

            var index = i * cellCount + j;
            bloop = new Bloop(index, 20, 75, 1);
            bloop.draw(cell_center);
		}
	}
}


function generateGenomes(){

    n = gridWidth * gridWidth;

    var choices = ["00", "01", "10", "11"];
    for(var i = 0; i < n; i++){
        var randIndex = Math.floor(Math.random() * choices.length);
        var genome = choices[randIndex];
        genomes.push(genome);
    }
}

setup();
console.log(genomes);
console.log(Object.keys(mapping));

function mutate(shape){
    parents.push(shape.name);
    // if(Math.random() > 0.25)
    // {
    //     genomes[i] = Object.keys(mapping)[Math.floor(Math.random() * 4)];
    //     shape.fillColor = mapping[genomes[i]];
    //     console.log(shape.fillColor);
    // }
}

function nextGeneration(){

    console.log(parents);
}

