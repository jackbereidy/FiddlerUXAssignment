// scatter plot implementation
var data_blob;

let cardBody = d3.select('#card-body-1');

let svg = cardBody.insert('svg', '.form-container')
	.attr('width', '100%')
	.attr('height', '500px');

svg.append("rect")
	.attr("width", "100%")
	.attr("height", "100%")
	.attr("fill", "rgb(72, 84, 101)");

let pointsGroup = svg.append('g')
	.attr('id', 'points-group');



function parseData(d) {
	// console.log(d);
	return {
		id: d.id,
		
	}
}
function loadData(error, d) {
	if (error) throw error;
	// console.log(d);
	var dataValues = d3.values(d)[0];
	// console.log(Object.keys(dataValues));
}
d3.csv("data/test.csv", parseData, loadData);

function drawData(d) {

}