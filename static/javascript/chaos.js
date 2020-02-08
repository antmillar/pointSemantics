// Create a Paper.js Path to draw a line into it:
var path = new Path()

var yAx = new Path();
var xAx = new Path();
var cobwebPath = new Path();
var identityPath = new Path();
var chaosPath = new Path();

path.strokeColor = '#F08080';
yAx.strokeColor = 'black';
xAx.strokeColor = 'black';
cobwebPath.strokeColor = '#008080';
cobwebPath.strokeWidth = 2;
identityPath.strokeColor = '#20B2AA';
identityPath.strokeWidth = 2;
chaosPath.strokeColor = '#CD5C5C';
chaosPath.strokeWidth = 0.25;

var yOffset = 300;
var yOffset2 = 700;
var xOffset = 50;
var xOffset2 = 300;

var graphAHeight = 200;
var n = 200;
var scl = 300;
var xScl = 4;


// Give the stroke a color
var R = 3.56995;
var X = 0.5;

var text = new PointText({
    point: view.center,
    content: 'R = ' + R.toPrecision(3),
    justification: 'center',
    fontSize: 15
});



//add axis labels

var labelx0 = new PointText(new Point(xOffset - 10, yOffset));
labelx0.content = '0';

var labelx1 = new PointText(new Point(xOffset - 10, yOffset - graphAHeight));
labelx1.content = '1';


GraphLogisticMap(R);


function GraphLogisticMap(r){

    //generate some points
    var points = [];
    points[0] = new Point(0,0.5);
    chaosPath.add(new Point(xOffset2 + scl * 0.5, yOffset2));
    
    //logistic map

    //calculate the logistic map
    for(i = 1; i < n; i++)
    {
        var nextVal = r * points[i - 1].y * (1 - points[i -1].y);
        points.push(new Point(i, nextVal) );

        chaosPath.add(xOffset2 + scl * points[i - 1].y , yOffset2  - scl * nextVal);
        chaosPath.add( xOffset2 + scl * nextVal,  yOffset2  - scl * nextVal);
    }

    //scale the map to webpage
    for(i = 0; i < n; i++)
    {

        points[i].x = xScl * points[i].x + xOffset ;
        points[i].y *= graphAHeight;
        points[i].y = yOffset - points[i].y;
        path.add(points[i]);
        //yAx.add(new Point(xScl * i + xOffset, yOffset));

    }

    //xAx.add(new Point(xOffset, yOffset), new Point(xOffset, yOffset - graphAHeight))

    CobwebDiagram(R, points);

}

function CobwebDiagram(r, points)
{

    for(x = 0; x < 1.05; x += 0.05)
    {
        cobwebPath.add(new Point(xOffset2 + scl * x, yOffset2 - scl *  r * x * (1 - x)));
        identityPath.add(new Point(xOffset2 + scl * x, yOffset2 - scl * x));
    }


}


function onKeyDown(event) {
    if(event.key == 'up')
    {
        R += 0.01;
        text.content = 'R = ' + R.toPrecision(3);
        path.removeSegments();
        cobwebPath.removeSegments();
        identityPath.removeSegments();
        chaosPath.removeSegments();

        GraphLogisticMap(R);
    }
    if(event.key == 'down')
    {
        R -= 0.01;
        text.content = 'R = ' + R.toPrecision(3);
        path.removeSegments();
        cobwebPath.removeSegments();
        identityPath.removeSegments();

        chaosPath.removeSegments();
        GraphLogisticMap(R);
    }
}