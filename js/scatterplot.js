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

// scale real X value to plot value (with min, max and spacer)
// if (min - spacer) is small or less than zero, ignore spacer
function getXScale() {
	let min = minMaxDict[selectColX.property('value')]["min"];
	let max = minMaxDict[selectColX.property('value')]["max"];
	let spacer = (max - min) * 0.1;
	return d3.scaleLinear()
	    .domain([(min - spacer > 1) ? min - spacer : 0, max + spacer])
	    .range([0, getSvgTargetWidth() - 80]);
}
// scale real Y value to plot value (with min, max and spacer)
// if (min - spacer) is small or less than zero, ignore spacer
function getYScale() {
	let min = minMaxDict[selectColY.property('value')]["min"];
	let max = minMaxDict[selectColY.property('value')]["max"];
	let spacer = (max - min) * 0.1;
	return d3.scaleLinear()
	    .domain([(min - spacer > 1) ? min - spacer : 0, max + spacer])
	    .range([getSvgTargetHeight() - 50, 0]);
}

let plotGroup = svg.append('g')
	.attr('id', 'plot-group')
	.attr('transform', `translate(${getSvgMarginOffset()},${-1*getSvgMarginOffset()})`);
let xAxis = plotGroup.append('g')
    .attr('id', 'x-axis')
    .attr('class', 'axis');
let yAxis = plotGroup.append('g')
    .attr('id', 'y-axis')
    .attr('class', 'axis')
    .attr('transform', `translate(${0},${-1*getSvgMarginOffset() + 90})`);

let plotLabel = d3.select('#plotLabel');

let xLabelGroup = plotGroup.append('g');
let xLabel = xLabelGroup.append('text');

let yLabelGroup = plotGroup.append('g');
let yLabel = yLabelGroup.append('text').attr('transform', 'rotate(-90)');

let pointsGroup = plotGroup.append('g')
	.attr('id', 'points-group')
	.attr('transform', `translate(${0},${-1*getSvgMarginOffset() + 90})`);

let dataBlob;

let selectColX = d3.select('#select-col-x').on('change', updateColumnX);
let selectColY = d3.select('#select-col-y').on('change', updateColumnY);;

window.addEventListener("resize", resize);

let minMaxDict = [];
// parse csv to dictionary and update min max.
// we only store keys with numeric values because 
// there isn't a intuitive way to plot non-numeric
//  values in a scatterplot
function parseData(d) {
	let dict = [];
	for (var key in d) {
		if (!isNaN(+d[key])) {
			dict[key] = updateMinMaxDict(key, +d[key]);
		}
	}
	return dict;
}
// check key value pair for min and max - necessary for plot axis scaling
function updateMinMaxDict(key, value) {
	if (key in minMaxDict) {
		if (minMaxDict[key]["min"] > value) minMaxDict[key]["min"] = value;
		if (minMaxDict[key]["max"] < value) minMaxDict[key]["max"] = value;
	} else {
		minMaxDict[key] = [];
		minMaxDict[key]["min"] = value;
		minMaxDict[key]["max"] = value;
	}
	return value;
}
function loadData(error, d) {
	if (error) throw error;
	dataBlob = d;
	initializeOptions();
    redraw();
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
	d3.select('#x-opt-'+options[3])
		.attr('selected', 'selected');
	d3.select('#y-opt-'+options[4])
		.attr('selected', 'selected');
}

function redraw() {
	// update svg height (TO DO - do conditionally)
	svg.attr('height', getSvgTargetHeight() + 'px');
	// update x axis with new window (TO DO - do conditionally)
	xAxis.attr('transform', `translate(0,${getSvgTargetHeight()})`)
		.call(d3.axisBottom(getXScale()));
	// update y axis with new window (TO DO - do conditionally)
	yAxis.call(d3.axisLeft(getYScale()));
	// update plot label
	plotLabel.text(selectColX.property('value') + ' vs ' + selectColY.property('value'));




	// set text and location of x label

	// xLabelGroup.attr('transform', `translate(${xAxis},${0})`);
	// xLabel.text(selectColX.property('value'));

	    // getSvgTargetWidth() - 80

	let yLabelYPosition = getSvgTargetHeight()/2 - yLabel.node().getBBox().height/2;
	yLabelGroup.attr('x', 100)
	    .attr('y', yLabelYPosition);
	yLabel.text(selectColY.property('value'));

	drawPoints();
}
function drawPoints() {
	let updatedPoints = pointsGroup.selectAll('circle.point-thing').data(dataBlob);
	// convenience and speed
	let xScaleObj = getXScale();
	let yScaleObj = getYScale();
	// create
	updatedPoints.enter()
		.append('circle')
		.attr('class', 'point-thing')
        .attr('r', 3.0)
        .style('fill', 'rgba(14, 100, 210, 0.7)')
        .attr('cx', function (d) { return xScaleObj(d[selectColX.property('value')]); })
		.attr('cy', function (d) { return yScaleObj(d[selectColY.property('value')]); });
	// delete
    updatedPoints.exit().remove();
    // updated existing elements
    updatedPoints.attr('cx', function (d) { return xScaleObj(d[selectColX.property('value')]); })
                 .attr('cy', function (d) { return yScaleObj(d[selectColY.property('value')]); });
}

// events (TO DO maybe just bind events to redraw ) 
function resize() {
	redraw(dataBlob); 
}
// update x column option
function updateColumnX() {
	redraw(dataBlob);
}
// update y column option
function updateColumnY() {
	redraw(dataBlob);
}

};

