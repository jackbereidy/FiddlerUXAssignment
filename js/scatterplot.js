window.onload = function(){

function getSvgTargetHeight() { return window.innerHeight * 0.7;}
function getSvgTargetWidth()  { return svg.node().getBoundingClientRect().width; }
function getSvgMarginOffset() { return 40; }
// create svg
let cardBody = d3.select('#svg-container');
let svg = cardBody.append('svg')
	.attr('id', 'svg')
	.attr('width', '100%')
	.attr('height', getSvgTargetHeight() + 'px');

// plot data values (TO DO: remove plot var entirely)
var plot = {
	'minX': 6,
	'maxX': 10,
	'minY': 0,
	'maxY': 10000,
	'margin': 100
}

function getXScale() {
	return d3.scaleLinear()
	    .domain([plot.minX, plot.maxX])
	    .range([0, getSvgTargetWidth()]);
}
function getYScale() {
	return d3.scaleLinear()
	    .domain([plot.minY, plot.maxY])
	    .range([getSvgTargetHeight(), 0]);
}

let plotGroup = svg.append('g')
	.attr('id', 'plot-group')
	.attr('transform', `translate(${getSvgMarginOffset()},${-1*getSvgMarginOffset()})`);

let xAxis = plotGroup.append('g')
    .attr('id', 'x-axis')
    .attr('class', 'axis');
let yAxis = plotGroup.append('g')
    .attr('id', 'y-axis')
    .attr('class', 'axis');
let pointsGroup = plotGroup.append('g')
	.attr('id', 'points-group');

let dataBlob;

let selectColX = d3.select('#select-col-x').on('change', updateColumnX);
let selectColY = d3.select('#select-col-y').on('change', updateColumnY);;

window.addEventListener("resize", resize);

function parseData(d) {
	return {
		id: +d.id,
		loanAmnt: +d.loan_amnt,
		intRate: +d.int_rate,
		dti: +d.dti
	}
}
function loadData(error, d) {
	if (error) throw error;
	dataBlob = d;
	initializeOptions();
    drawData();
}
d3.csv("data/test.csv", parseData, loadData);

// initialize options from columns in csv
function initializeOptions() {
	let options = Object.keys(dataBlob[0]);
	for(var i = 0; i < options.length; i++) {
		var opt = options[i];
		selectColX.append('option')
			.attr('value', opt)
			.attr('label', opt)
			.attr('id', 'x-opt-' + opt);
		d3.select('#select-col-y').append('option')
			.attr('value', opt)
			.attr('label', opt)
			.attr('id', 'y-opt-' + opt);
	}
	// arbitrary default columns 1 and 2
	d3.select('#x-opt-'+options[2])
		.attr('selected', 'selected');
	d3.select('#y-opt-'+options[1])
		.attr('selected', 'selected');
}

function drawData() {
	// update svg height (TO DO - do conditionally)
	svg.attr('height', getSvgTargetHeight() + 'px');
	// update x axis with new window (TO DO - do conditionally)
	xAxis.attr('transform', `translate(0,${getSvgTargetHeight()})`)
		.call(d3.axisBottom(getXScale()));
	// update y axis with new window (TO DO - do conditionally)
	yAxis.call(d3.axisLeft(getYScale()));

	drawPoints();
}
function drawPoints() {
	let xScaleObj = getXScale();
	let yScaleObj = getYScale();

	let updatedPoints = pointsGroup.selectAll('circle.point-thing').data(dataBlob, d => d.id);

	console.log(selectColX.property('value') + ' ' + selectColY.property('value'));

	updatedPoints.enter()
		.append('circle')
		.attr('class', 'point-thing')
        .attr('r', 3.0)
        .attr('cx', function (d) { return xScaleObj(d[selectColX.property('value')]); })
        .attr('cy', function (d) { return yScaleObj(d[selectColY.property('value')]); })
        .style('fill', 'rgba(14, 100, 210, 0.7)');

    updatedPoints.exit().remove();
}

// events (TO DO maybe just bind events to drawData ) 
function resize() {
	drawData(dataBlob); 
}
// update X with new column
function updateX() {
	drawData(dataBlob);
}
// update Y with new column
function updateY() {
	drawData(dataBlob);
}
// update x column option
function updateColumnX() {
	drawData(dataBlob);
}
// update y column option
function updateColumnY() {
	drawData(dataBlob);
}

};