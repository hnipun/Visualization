let setup = function () {
    //Set size of svg element and chart
    let margin = {top: 0, right: 0, bottom: 0, left: 0};
    let barWidth = 600 - margin.left - margin.right;
    let barHeight = 400 - margin.top - margin.bottom;
    let categoryIndent = 4 * 15 + 5;
    let scaleFactor = 20;
    let csv = "fakeData.json";
    let defaultBarWidth = 2000;

    //Set up scales
    let x = d3.scale.linear().domain([0, defaultBarWidth]).range([0, barWidth]);
    let y = d3.scale.ordinal().rangeRoundBands([0, barHeight], 0.1, 0);


    //Create SVG element
    d3.select("svg").remove();
    let graph = d3.select("body").append("svg")
        .attr("width", barWidth + margin.left + margin.right)
        .attr("height", barHeight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    //Package and export settings
    return {
        margin: margin,
        width: barWidth,
        barHeight: barHeight,
        categoryIndent: categoryIndent,
        scaleFactor: scaleFactor,
        csv: csv,
        graph: graph,
        x: x,
        y: y,
    }
};

let reDrawBarChart = function (data, settings) {
    let categoryIndent = settings.categoryIndent;
    let height = settings.barHeight;
    let graph = settings.graph;
    let margin = settings.margin;
    let x = settings.x;
    let y = settings.y;

    //Reset domains
    y.domain(data.sort(function (a, b) {
        return b.value - a.value;
    }).map(function (d) {
        return d.key;
    }));
    let barmax = d3.max(data, function (e) {
        return e.value;
    });
    x.domain([0, barmax]);

    //Create chart row and move to below the bottom of the chart
    let chartRow = graph.selectAll("g.chartRow")
        .data(data, function (d) {
            return d.key
        });

    let newRow = chartRow
        .enter()
        .append("g")
        .attr("class", "chartRow")
        .attr("transform", "translate(0," + height + margin.top + margin.bottom + ")");

    //Add rectangles
    newRow.append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("opacity", 0)
        .attr("height", y.rangeBand())
        .attr("width", function (d) {
            return x(d.value);
        });

    //Add value labels
    newRow.append("text")
        .attr("class", "label")
        .attr("y", y.rangeBand() / 2)
        .attr("x", 0)
        .attr("opacity", 0)
        .attr("dy", ".35em")
        .attr("dx", "0.5em")
        .text(function (d) {
            return d.value;
        });

    //Add Headlines
    newRow.append("text")
        .attr("class", "category")
        .attr("text-overflow", "ellipsis")
        .attr("y", y.rangeBand() / 2)
        .attr("x", categoryIndent)
        .attr("opacity", 0)
        .attr("dy", ".35em")
        .attr("dx", "0.5em")
        .text(function (d) {
            return d.key
        });

    //////////
    //UPDATE//
    //////////

    //Update bar widths
    chartRow.select(".bar").transition()
        .duration(300)
        .attr("width", function (d) {
            return x(d.value);
        })
        .attr("opacity", 1);

    //Update data labels
    chartRow.select(".label").transition()
        .duration(300)
        .attr("opacity", 1)
        .tween("text", function (d) {
            var i = d3.interpolate(+this.textContent.replace(/\,/g, ''), +d.value);
            return function (t) {
                this.textContent = Math.round(i(t));
            };
        });

    //Fade in categories
    chartRow.select(".category").transition()
        .duration(300)
        .attr("opacity", 1);


    ////////
    //EXIT//
    ////////

    //Fade out and remove exit elements
    chartRow.exit().transition()
        .style("opacity", "0")
        .attr("transform", "translate(0," + (height + margin.top + margin.bottom) + ")")
        .remove();


    ////////////////
    //REORDER ROWS//
    ////////////////

    var delay = function (d, i) {
        return 200 + i * 30;
    };

    chartRow.transition()
        .delay(delay)
        .duration(900)
        .attr("transform", function (d) {
            return "translate(0," + y(d.key) + ")";
        });
};

let settings_dict = setup();
// redBarChart(data, settings_dict);

let pullData = function (settings_dict, callback) {
    let csv = settings_dict.csv;

    d3.json(csv, function (err, data) {
        let newData = data;

        if (err) return console.warn(err);

        data.forEach(function (d, i) {
            let newValue = d.value + Math.floor((Math.random() * 10) - 5);
            newData[i].value = newValue <= 0 ? 10 : newValue
        });
        newData = formatData(newData);

        callback(newData, settings_dict);
    })
};


//Sort data in descending order and take the top 10 values
let formatData = function (data) {
    return data.sort(function (a, b) {
        return b.value - a.value;
    }).slice(0, 10);
};

let redraw = function (settings_dict) {
    pullData(settings_dict, reDrawBarChart)
};

// //setup (includes first draw)
// let settings = setup('#chart');
redraw(settings_dict);
//Repeat every 3 seconds
setInterval(function () {
    redraw(settings_dict)
}, 3000);

//let data = [10, 5, 12, 15];
