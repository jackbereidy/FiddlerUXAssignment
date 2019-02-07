// plot data values
var plot = {
	'minX': 6,
	'maxX': 10,
	'minY': 0,
	'maxY': 10000,
	'width': 600,
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
	.attr('id', 'svg')
	.attr('width', '100%')
	.attr('height', '500px');

let plotGroup = svg.append('g')
	.attr('id', 'plot-group');

let xAxis = plotGroup.append('g')
    .attr('transform', `translate(0,${plot.height})`)
    .attr('id', 'x-axis')
    .attr('class', 'axis')
    .call(d3.axisBottom(xScale));
let yAxis = plotGroup.append('g')
    .attr('id', 'y-axis')
    .attr('class', 'axis')
    .call(d3.axisLeft(yScale));
let pointsGroup = plotGroup.append('g')
	.attr('id', 'points-group');

let plotBackground;

// ^ variables initialized, elements added to DOM

window.addEventListener("resize", resize);

function parseData(d) {
	return {
		id: d.id,
		loanAmnt: +d.loan_amnt,
		intRate: +d.int_rate
	}
}
function loadData(error, d) {
	if (error) throw error;
	plotBackground = plotGroup.append('rect')
        .attr('id', 'plot-background')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', plot.width)
        .attr('height', plot.height)
        .attr('fill', '#fff')
        .on('mousedown', plotBackgroundMouseDown);

    plotBackground.lower();

    drawData(d);
}
d3.csv("data/test.csv", parseData, loadData);

function drawData(d) {
	drawScatterPlot(d);
}
function drawScatterPlot(d) {

	let points = pointsGroup.selectAll('circle.pp');
	let updatedPoints = points.data(d, d => d.id);

	updatedPoints.enter()
		.append('circle')
		.attr('class', 'pp')
        .attr('r', 2.5)
        .attr('cx', function (d) { return xScale(d.intRate); })
        .attr('cy', function (d) { return yScale(d.loanAmnt); })
        .style('fill', 'rgba(14, 100, 210, 0.7)');

    updatedPoints.exit().remove();

}

// events
function resize() {
	svg.node().getBoundingClientRect()
	console.log(svg.node().getBoundingClientRect());
	redraw();
}
// update X with new column
function updateX(d) {
	redraw(d);
}
// update Y with new column
function updateY(d) {
	redraw(d);
}
function redraw(d) {
	drawData(d);
}