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

function getXScale() {
	return d3.scaleLinear()
	    .domain([minMaxDict[selectColX.property('value')]["min"], minMaxDict[selectColX.property('value')]["max"]])
	    .range([0, getSvgTargetWidth() - 80]);
}
function getYScale() {
	return d3.scaleLinear()
	    .domain([minMaxDict[selectColY.property('value')]["min"], minMaxDict[selectColY.property('value')]["max"]])
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
let pointsGroup = plotGroup.append('g')
	.attr('id', 'points-group')
	.attr('transform', `translate(${0},${-1*getSvgMarginOffset() + 90})`);

let dataBlob;

let selectColX = d3.select('#select-col-x').on('change', updateColumnX);
let selectColY = d3.select('#select-col-y').on('change', updateColumnY);;

window.addEventListener("resize", resize);

let minMaxDict = [];
// parse csv to dictionary and create min max dictionary
function parseData(d) {
	return {
		id: updateMinMaxDict('id',+d.id),
		loan_amnt: updateMinMaxDict('loan_amnt',+d.loan_amnt),
		int_rate: updateMinMaxDict('int_rate',+d.int_rate),
		dti: updateMinMaxDict("dti",+d.dti),
		total_acc: updateMinMaxDict('total_acc',+d.total_acc)
	}
}
// check key value pair for min and max
// this is necessary for plot axis scaling
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
	console.log(minMaxDict);
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
	d3.select('#x-opt-'+options[3])
		.attr('selected', 'selected');
	d3.select('#y-opt-'+options[4])
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

// events (TO DO maybe just bind events to drawData ) 
function resize() {
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