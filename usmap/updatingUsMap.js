//Width and height of map
var width = 960;
var height = 500;

// D3 Projection
var projection = d3.geo.albersUsa()
    .translate([width / 2, height / 2]) // translate to center of screen
    .scale([1000]);          // scale things down so see entire US

// Define path generator
var path = d3.geo.path()  // path generator that will convert GeoJSON to SVG paths
    .projection(projection); // tell path generator to use albersUsa projection

// Define linear scale for output
var color = d3.scale.linear()
    .range(["rgb(127,255,0)", "rgb(255,255,0)", "rgb(255,140,0)", "rgb(255,0,0)", "rgb(128,0,128)", "rgb(128,0,128)", "rgb(128,0,0)"]);
color.domain([0, 1, 2, 3, 4, 5]); // setting the range of the input data

var legendText = ["Good", "Moderate", "Unhealthy for Sensitive Groups", "Unhealthy", "Very Unhealthy", "Hazardous"];


// Append Div for tooltip to SVG
var div = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let reDrawChart = function (targetID) {


    //Create SVG element and append map to the SVG
    d3.select(targetID).selectAll("svg").remove();
    var svg = d3.select(targetID)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Load in my states data!
    d3.csv("stateslived.csv", function (data) {

// Load GeoJSON data and merge with states data
        d3.json("us-states.json", function (json) {

// Loop through each state data value in the .csv file
            for (var i = 0; i < data.length; i++) {

                // Grab State Name
                var dataState = data[i].state;

                // Grab data value
                var dataValue = data[i].visited;

                // Find the corresponding state inside the GeoJSON
                for (var j = 0; j < json.features.length; j++) {
                    var jsonState = json.features[j].properties.name;

                    if (dataState == jsonState) {

                        // Copy the data value into the JSON
                        json.features[j].properties.visited =getRandomInt(0, 5);

                        // Stop looking through the JSON
                        break;
                    }
                }
            }

// Bind the data to the SVG and create one path per GeoJSON feature
            svg.selectAll("path")

                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("stroke", "#fff")
                .style("stroke-width", "1")
                .style("fill", function (d) {

                    // Get data value
                    var value = d.properties.visited;
                    //console.log(value)

                    if (value != null) {
                        //If value exists…
                        return color(value);
                    } else {
                        //If value is undefined…
                        console.log(color(value));
                        return "rgb(213,222,217)";
                    }
                });


// // Map the cities I have lived in!
//         d3.csv("cities-lived.csv", function (data) {
//
//             svg.selectAll("circle")
//                 .data(data)
//                 .enter()
//                 .append("circle")
//                 .attr("cx", function (d) {
//                     return projection([d.lon, d.lat])[0];
//                 })
//                 .attr("cy", function (d) {
//                     return projection([d.lon, d.lat])[1];
//                 })
//                 .attr("r", function (d) {
//                     return Math.sqrt(d.years) * 4;
//                 })
//                 .style("fill", "rgb(217,91,67)")
//                 .style("opacity", 0.85)
//
//                 // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks"
//                 // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
//                 .on("mouseover", function (d) {
//                     div.transition()
//                         .duration(200)
//                         .style("opacity", .9);
//                     div.text(d.place)
//                         .style("left", (d3.event.pageX) + "px")
//                         .style("top", (d3.event.pageY - 28) + "px");
//                 })
//
//                 // fade out tooltip on mouse out
//                 .on("mouseout", function (d) {
//                     div.transition()
//                         .duration(500)
//                         .style("opacity", 0);
//                 });
//         });

// Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852

        });

    });

};

let drawLegends = function (targetID){
    console.log(color.domain().slice());
    d3.select(targetID).selectAll("svg").remove();
    var legend = d3.select(targetID).append("svg")
        .attr("class", "legend")
        .attr("width", 140)
        .attr("height", 200)
        .selectAll("g")
        .data(color.domain().slice())
        .enter()
        .append("g")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 20 + ")";
        });

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .data(legendText)
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function (d) {
            return d;
        });
};

reDrawChart('#chart');
drawLegends('#legend');
setInterval(function () {
    reDrawChart('#chart')
}, 3000);

