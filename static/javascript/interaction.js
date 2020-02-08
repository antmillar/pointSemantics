
Raster.prototype.rescale = function(width, height) {
    this.scale(width / this.width, height / this.height);
};


var url = 'static/img/output/' + 'overlay.png';
var raster = new Raster({
    source: url,
    position: new Point(480, 360),
});

raster.rescale(raster.width * 2, raster.height * 2);

// var labels = {{labels}}

var label_names = ['Animal', 'Archway', 'Bicyclist', 'Bridge', 'Building', 'Car', 'CartLuggagePram', 'Child', 'Column_Pole',
'Fence', 'LaneMkgsDriv', 'LaneMkgsNonDriv', 'Misc_Text', 'MotorcycleScooter', 'OtherMoving', 'ParkingBlock',
'Pedestrian', 'Road', 'RoadShoulder', 'Sidewalk', 'SignSymbol', 'Sky', 'SUVPickupTruck', 'TrafficCone',
'TrafficLight', 'Train', 'Tree', 'Truck_Bus', 'Tunnel', 'VegetationMisc', 'Void', 'Wall']

var text = new PointText(view.center + new Point(0, 350));
text.fillColor = 'DarkSlateGray';
text.fontSize = 24;
text.justification = 'center';

function onMouseUp(event) {
    var label_index = labels[Math.floor(event.point.y / 2)][Math.floor(event.point.x / 2)]
    text.content = label_names[label_index];
    fillSelected(label_index);
}

//return all pixels containing a specific value and colour them
var group = new Group();


function fillSelected(label_index)
{
    group.removeChildren();

    var all = [];

    for(var n = 0; n < labels.length; n++)
    {
        var temp = labels[n].reduce(function(a, e, i) {
            if (e === label_index)
                a.push([n, i]);
            return a;
        }, []);  
        
        all =  all.concat(temp)
    }
    
    for(var i = 0; i < all.length; i++)
    {
        var c = new Shape.Circle(new Point(all[i][1] * 2.0, all[i][0] * 2.0), 1);
        c.strokeColor = "LightSalmon";
        group.addChild(c);
    }
    
}

var numbers = [1, 4, 9]
var doubles = numbers.map(function(num, index, arr) {
  arr.push([index, num])
  return arr
})

console.log(doubles);