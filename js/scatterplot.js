window.onload = function(){

function getSvgTargetHeight() { 
	// conditionally limit height of svg if we're on a small screen
	if (window.innerWidth <= 650 ) return 300;
	return window.innerHeight * 0.7;
}
function getSvgTargetWidth()  { return svg.node().getBoundingClientRect().width; }
function getSvgMarginOffset() { return 40; }

// create svg
let cardBody = d3.select('#svg-container');
let svg = cardBody.append('svg')
	.attr('id', 'svg')
	.attr('class', 'svg')
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
// container for all other elements in svg
let plotGroup = svg.append('g')
	.attr('id', 'plot-group')
	.attr('transform', `translate(${getSvgMarginOffset()},${-1*getSvgMarginOffset()})`);
// x and y axes from d3
let xAxis = plotGroup.append('g')
    .attr('id', 'x-axis')
    .attr('class', 'axis')
    .attr('class', 'noselect');
let yAxis = plotGroup.append('g')
    .attr('id', 'y-axis')
    .attr('class', 'axis')
    .attr('class', 'noselect')
    .attr('transform', `translate(${0},${-1*getSvgMarginOffset() + 90})`);
// label updates with changes to x and y axes
let plotLabel = d3.select('#plotLabel');
// x and y axis labels
let xLabelGroup = svg.append('g');
let xLabel = xLabelGroup.append('text');
let yLabelGroup = svg.append('g');
let yLabel = yLabelGroup.append('text').attr('transform', 'rotate(-90)');
// label updates with changes to limit slider
let limitLabel = d3.select('#limitLabel');
// limit slider from 0 to number of rows (ser on load)
let domainSlider = d3.select('#limit-slider')
    .attr('min', 0)
    .on('input', function () {
        let currentLimit = +this.value;
        limitLabel.text(currentLimit);
        // filter out rows with index greater than current limit, this is a naive approach
        let filterDataBlob = dataBlobFixed.filter(function(d, i) {
        	return i < currentLimit;
        });
        dataBlob = filterDataBlob;
        redraw();
    });
// group of all points in svg
let pointsGroup = plotGroup.append('g')
	.attr('id', 'points-group')
	.attr('transform', `translate(${0},${-1*getSvgMarginOffset() + 90})`);
// datablob changes with filter, datablobfixed is set once on load
let dataBlob;
let dataBlobFixed;
// drop-down select x and y axis
let selectColX = d3.select('#select-col-x').on('change', function() { redraw(dataBlob); });
let selectColY = d3.select('#select-col-y').on('change', function() { redraw(dataBlob); });
// resize window
window.addEventListener("resize", function() { redraw(dataBlob); });

// parse csv to dictionary and update min max.
// we only store keys with numeric values because 
// there isn't a intuitive way to plot non-numeric
// values in a scatterplot
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
let minMaxDict = [];
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
	dataBlobFixed = d;
	domainSlider.attr('max', dataBlobFixed.length)
	    .attr('value', dataBlobFixed.length);
	limitLabel.text(dataBlobFixed.length);
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
			.attr('id', 'x-opt-' + opt)
			.html(opt);
		d3.select('#select-col-y').append('option')
			.attr('value', opt)
			.attr('label', opt)
			.attr('id', 'y-opt-' + opt)
			.html(opt);
	}
	// default to something interesting
	d3.select('#x-opt-open_acc')
		.attr('selected', 'selected');
	d3.select('#y-opt-total_acc')
		.attr('selected', 'selected');
}
// draw data with current x and y axes and filter
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
	xLabel.text(selectColX.property('value'));
	let plotGroupBB = plotGroup.node().getBBox();
	let xLabelX = plotGroupBB.width/2 - xLabel.node().getBBox().width/2;
	let xLabelY = plotGroupBB.height + 30;
	xLabelGroup.attr('transform', `translate(${xLabelX},${xLabelY})`);
	// set text and location of y label
	yLabel.text(selectColY.property('value'));
	let yLabelX = 10;
	let yLabelY = plotGroupBB.height/2 + yLabel.node().getBBox().width/2;
	yLabelGroup.attr('transform', `translate(${yLabelX},${yLabelY})`);
	// final step, draw points
	drawPoints(dataBlob);
}
// draw points in plot
function drawPoints(dataBlob) {
	let updatedPoints = pointsGroup.selectAll('circle.point-thing').data(dataBlob);
	// convenience and speed
	let xScaleObj = getXScale();
	let yScaleObj = getYScale();
	// create
	updatedPoints.enter()
		.append('circle')
		.attr('class', 'point-thing')
        .attr('r', 3.0)
        .style('fill', 'rgba(14, 100, 210, 0.5)')
        .attr('cx', function (d) { return xScaleObj(d[selectColX.property('value')]); })
		.attr('cy', function (d) { return yScaleObj(d[selectColY.property('value')]); });
	// delete
    updatedPoints.exit().remove();
    updatedPoints.attr('cx', function (d) { return xScaleObj(d[selectColX.property('value')]); })
                 .attr('cy', function (d) { return yScaleObj(d[selectColY.property('value')]); });
}
};