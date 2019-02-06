// plot data values
var plot = {
	'minX': 0,
	'maxX': 10000000,
	'minY': 0,
	'maxY': 10000000,
	'width': 300,
	'height': 300,
	'margin': 100
}

// scale to plot
let xScale = d3.scaleLinear()
    .domain([plot.minX, plot.maxX])
    .range([0, plot.width]);
let yScale = d3.scaleLinear()
    .domain([plot.minY, plot.maxY])
    .range([plot.height, 0]);

// create svg
let cardBody = d3.select('#svg-container');
let svg = cardBody.append('svg')
	.attr('width', '100%')
	.attr('height', '500px');
cardBody.onresize = function(){ console.log("hi") }; // not working..

// svg.append("rect")
// 	.attr("width", "100%")
// 	.attr("height", "100%")
// 	.attr("fill", "rgb(72, 84, 101)");

let plotGroup = svg.append('g')
	.attr('id', 'plot-group');
let pointsGroup = plotGroup.append('g')
	.attr('id', 'points-group');

let pointsData;
let plotBackground;

function parseData(d) {
	return {
		id: d.id,
		loanAmnt: +d.loan_amnt
	}
}
function loadData(error, d) {
	if (error) throw error;
	pointsData = d;
	plotBackground = plotGroup.append('rect')
        .attr('id', 'plot-background')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', plot.width)
        .attr('height', plot.height)
        .attr('fill', '#fff')
        .attr('border', '1px')
        .on('mousedown', plotBackgroundMouseDown);

    drawData(d);
}
d3.csv("data/test.csv", parseData, loadData);

function drawData(d) {
	drawScatterPlot(d);
}
function drawScatterPlot(data) {
	let pointData = data;
	let points = pointsGroup.selectAll('circle.pp');
	let updatedPoints = points.data(pointData, d => d.id);

	updatedPoints.enter()
		.append('circle')
		.attr('class', 'pp')
        .attr('r', 2.5)
        .attr('cx', function (d) { return xScale(d.id); })
        .attr('cy', function (d) { return yScale(d.loanAmnt); })
        .style('fill', '#9de0a3')
        .style('stroke', '#17471b')
        .style('stroke-opacity', 1.0)
        .style('stroke-width', 0.3);

    updatedPoints.exit().remove();

}

// events
function plotBackgroundMouseDown() {
	console.log("plot background mouse down");
}

function svgResize() {
	console.log("resize me");
	// need to update relevant plot struct values
}