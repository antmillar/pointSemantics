var n = 16;
var genomes = [];
var mapping = { "00" : "aquamarine", "01" : "MediumTurquoise", "10" : "Salmon", "11" : "PeachPuff"};
var squares = [];
var points = [];
var bloops = [];

function Hero(name, level) {
    this.name = name;
    this.level = level;
}

function Bloop(pos, radius, color) {

    this.radius = radius;
    this.color = color;
    this.pos = pos;
    // // Method
    // calcArea() {
    //   return this.radius * this.radius;
    // }
  }

for(var i = 0; i < n; i++)
{
    bloops.push(new Bloop(new Point(50,50), 50, "blue"))
}


var bloopDims = {
	paths: 3,
	points: 5,
    radius :50,

    sizeEye : 10,    
    sizeNose : 5
};



function createPaths(point) {

	for (var i = 0; i < bloopDims.paths; i++) {
		var radius = bloopDims.radius + bloopDims.radius ; //random radius
		var points = bloopDims.points + Math.floor(Math.random() * bloopDims.points) * (4-i)/2 ; //random change no. of points
		var path = createBlob(point, radius, points);
		var lightness = Math.random() * 0.2 + 0.7;
		var hue = Math.random() * 360;
        //path.fillColor = { hue: hue, saturation: 1.0, lightness: lightness };
        path.fillColor = mapping[genomes[i]];
        console.log(genomes);
    };

    var eyePos = 20;

    var eye = new Shape.Circle(point - [eyePos,0], bloopDims.sizeEye);
    eye.fillColor = 'white';
    var eye2 = new Shape.Circle(point + [eyePos,0], bloopDims.sizeEye);
    eye2.fillColor = 'white';
    
    var eye = new Shape.Circle(point - [eyePos,0], bloopDims.sizeEye * 0.75);
    eye.fillColor = 'black';
    var eye2 = new Shape.Circle(point + [eyePos,0], bloopDims.sizeEye * 0.75);
    eye2.fillColor = 'black';

    var eye3 = new Shape.Circle(point - [eyePos,0], bloopDims.sizeEye * 0.25);
    eye3.fillColor = 'white';
    var eye4 = new Shape.Circle(point + [eyePos,0] - 2, bloopDims.sizeEye * 0.25);
    eye4.fillColor = 'white';


    var nose = new Shape.Circle(point + [0,15], bloopDims.sizeNose);
    nose.fillColor = 'black';
}


function createBlob(center, radius, points) {
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



//clearData();

function addButton(){
    var rectangle = new Rectangle(view.center - new Point(60, 20), new Size(120, 40));
    var cornerSize = new Size(10, 10);
    var shape = new Shape.Rectangle(rectangle, cornerSize);
    shape.fillColor = 'LightSeaGreen';


    shape.onMouseDown = function(event){
        nextGeneration();
        clearData();
        generateGenomes();
        generatePointGrid(4);
        //addBloops();
        addButton();
    }
    
}

addButton();

var parents = [];

function Cell(point, cellSize) {
    

    var size = new Size(cellSize * 0.9, cellSize * 0.9);
    var rect = new Shape.Rectangle(point - [cellSize * 0.9/2 , cellSize * 0.9/2], size);
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


    //var bloop = new Shape.Circle(point + new Point(cellSize/2, cellSize/2), 50);
    //bloop.fillColor ='aqua';
    //createPaths();
    //this.level = level;
}

function generatePointGrid(cellCount) {
    var cellWidth = view.size.width / cellCount;
    var cellHeight = view.size.height / cellCount;
	for(var i = 0; i < cellCount; i++) {
		for(var j = 0; j < cellCount; j++) {
			var point = new Point(i * cellWidth + cellWidth/2, j * cellHeight + cellHeight / 2);
            points.push(point);
            
            cell = new Cell(point, cellHeight);
            createPaths(point);
            // var size = new Size(cellHeight - 20, cellHeight - 20);
            // var shape = new Shape.Rectangle(point, size);
            // shape.strokeColor = 'MediumAquaMarine';
            // shape.fillColor = 'white',
            // shape.strokeWidth = 0;

            // shape.onMouseDown = function(event) {
            //     this.strokeWidth = 2;
            // }


            // shape.onMouseUp = function(event) {
            //     this.strokeWidth = 0;
            // }


            //squares.push(cell);

		}
	}

}


function generateGenomes(){

    var choices = ["00", "01", "10", "11"];
    for(var i = 0; i < n; i++){
        var randIndex = Math.floor(Math.random() * choices.length);
        var genome = choices[randIndex];
        genomes.push(genome);
    }
}

function addBloops(){

    for(i = 0; i < points.length; i++){

        var bloop = new Shape.Circle(points[i] + new Point(100, 100), 50);

        bloop.fillColor = mapping[genomes[i]];
        bloop.name = i;

        bloop.onMouseDown = function(event) {
            mutate(this);
            console.log(this.id);
         }

        bloops.push(bloop);

    }
}


generateGenomes();
generatePointGrid(4);

// addBloops();

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


//on open randomly populate bloop parameters
//start with size
