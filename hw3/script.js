// Global var for FIFA world cup data
var allWorldCupData;


/**
 * Render and update the bar chart based on the selection of the data type in the drop-down box
 *
 * @param selectedDimension a string specifying which dimension to render in the bar chart
 */
function updateBarChart(selectedDimension) {
	
    var svgBounds = d3.select("#barChart").node().getBoundingClientRect(),
        xAxisWidth = 100,
        yAxisHeight = 70;

	var vertCol = [];
	var horCol = [];
	var vertMargin = 50;
	var horMargin = 60;
	
	
	allWorldCupData.forEach(function(d){
		vertCol.unshift(d[selectedDimension]);
		horCol.unshift(d.year);
	});

    // Create the x and y scales; make
    // sure to leave room for the axes
    var xScale = d3.scaleBand()
			.domain(horCol)
            .range([horMargin, svgBounds.width]);
	
	// here we use an ordinal scale with scaleBand
    // to position and size the bars in y direction
	var yScale = d3.scaleLinear()
			.domain([0, d3.max(vertCol)])
            .range([svgBounds.height,vertMargin]);
	
    // Create colorScale
	var colorScale = d3.scaleLinear()
            .domain([d3.min(vertCol), d3.max(vertCol)])
            .range(["#47FFB6","#00F"]);
	
    // Create the axes (hint: use #xAxis and #yAxis)
	var xAxis = d3.axisBottom(xScale);
    var xLine = d3.select("#xAxis")
		.call(xAxis)
		.attr("transform", function(d){
			var y = svgBounds.height - vertMargin; 
			return "translate(" + 0 + "," + y + ")";
		})
		.selectAll("text")	
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-80)"; 
        });
	
	
	var yAxis = d3.axisLeft(yScale);
	var yLine = d3.select("#yAxis")
		.attr("transform", function(d){
			var y = vertMargin*-1;
			return "translate(" + horMargin + "," + y + ")";
		})
		.transition().duration(1000)
		.call(yAxis);
	
    // Create the bars (hint: use #bars)
	// Select all rect's in #bars and bind the world cup data to them    
	var bars = d3.select("#bars")
				.selectAll("rect")
				.data(allWorldCupData); 
	
	// handle the enter() condition and merge with existing rects 
	bars = bars.enter()        
		.append('rect')
		.merge(bars); 
	
	// handle the exit() case to remove any bars that no longer have data assigned to them    
	bars.exit().remove(); 
	
	// finally, assign the necessary attributes to the bars      
	bars.attr('x', function (d,i) {            
			return xScale(horCol[i]);         
		})        
		.attr('width', 20)        
		.attr('y', vertMargin - svgBounds.height)
		.transition().duration(1000).ease(d3.easeQuad)
		.attr('height', function (d, i) {            
			return svgBounds.height - yScale(vertCol[i]);      
		})        
		.attr('fill', function (d, i) {            
			return colorScale(vertCol[i]);         
		});
	
    
    bars.on("click", function(d,i){
			d3.selectAll("rect").classed("selected",false);
			d3.select(this).attr("class", "selected")
			updateInfo(allWorldCupData[allWorldCupData.length - (i +1)])
			updateMap(allWorldCupData[allWorldCupData.length - (i +1)]);
		})
}


function chooseData() {

  
	var select = document.getElementById("dataset");
	updateBarChart(select.options[select.selectedIndex].value);
}

/**
 * Update the info panel to show info about the currently selected world cup
 *
 * @param oneWorldCup the currently selected world cup
 */
function updateInfo(oneWorldCup) {
	
	document.getElementById("edition").innerHTML = oneWorldCup.EDITION;
	document.getElementById("host").innerHTML = oneWorldCup.host;
	document.getElementById("winner").innerHTML = oneWorldCup.winner;
	document.getElementById("silver").innerHTML = oneWorldCup.runner_up;
	
	var list = d3.select("#teams")
				.selectAll("li")
				.data(oneWorldCup.teams_names);
	
	
	
	// handle the enter() condition and merge with existing rects 
	list = list.enter()        
			.append('li')
			.merge(list);
	
	// handle the exit() case to remove any bars that no longer have data assigned to them    
	list.exit().remove();
	
	list.text(function(d, i){
				return d;	
			});
}

/**
 * Renders and updated the map and the highlights on top of it
 *
 * @param the json data with the shape of all countries
 */

function drawMap(world) {

    //(note that projection is global!
    // updateMap() will need it to add the winner/runner_up markers.)

    projection = d3.geoConicConformal().scale(150).translate([400, 350]);
	
	var path = d3.geoPath()
            .projection(projection);
    // ******* TODO: PART III *******

    // Draw the background (country outlines; hint: use #map)
    var map = d3.select("#map")
		.classed("countries", true);
	
	
		map.selectAll("path") 
		.data(topojson.feature(world,world.objects.countries).features)
		.enter()
		.append("path")
		// here we use the familiar d attribute again to define the path
		.attr("d", path)
		.attr("id", function(d){
			return d.id;	
		});

	
	// Make sure and add gridlines to the map
    //Bind data and create one path per GeoJSON feature
	var graticule = d3.geoGraticule();
	
		map.append("path")
      	.datum(graticule)
      	.attr("class", "grat")
      	.attr("d", path);
	
    // Hint: assign an id to each country path to make it easier to select afterwards
    // we suggest you use the variable in the data element's .id field to set the id

    // Make sure and give your paths the appropriate class (see the .css selectors at
    // the top of the provided html file)


}

/**
 * Clears the map
 */
function clearMap() {

    // ******* TODO: PART IV*******
    //Clear the map of any colors/markers; You can do this with inline styling or by
    //defining a class style in styles.css

    //Hint: If you followed our suggestion of using classes to style
    //the colors and markers for hosts/teams/winners, you can use
    //d3 selection and .classed to set these classes on and off here.
	var map = d3.select("#map");
	var points = d3.select("#points");
	
	map.selectAll(".host")
		.classed("host", false);
	
	map.selectAll(".team")
		.classed("team", false);
	
	points.selectAll(".gold")
		.remove();
	
	points.selectAll(".silver")
		.remove();
}


/**
 * Update Map with info for a specific FIFA World Cup
 * @param the data for one specific world cup
 */
function updateMap(worldcupData) {

    //Clear any previous selections;
    clearMap();

    // ******* TODO: PART IV *******

    // Add a marker for the winner and runner up to the map.
	var points	= d3.select("#points")
					.selectAll("circle")
	
		points.data([worldcupData.win_pos])
			.enter()
			.append("circle")
			.attr("cx", function (d) {
				return projection(d)[0];
			})
			.attr("cy", function (d) {
				return projection(d)[1];
			})
			.attr("r", function (d) {
				return 8;
			})
			.classed("gold",true);

			points
			.data([worldcupData.ru_pos])
			.enter()
			.append("circle")
			.attr("cx", function (d) {
				return projection(d)[0];
			})
			.attr("cy", function (d) {
				return projection(d)[1];
			})
			.attr("r", function (d) {
				return 8;
			})
			.classed("silver",true);
	
    //Hint: remember we have a conveniently labeled class called .gold
    // as well as a .silver. These have styling attributes for the two
    //markers.

	
    //Select the host country and change it's color accordingly.
	d3.select('#' + worldcupData.host_country_code)
		.classed("host",true);
	
    //Iterate through all participating teams and change their color as well.
	for (i=0; i<worldcupData.teams_iso.length; i++){
		d3.select("#" + worldcupData.teams_iso[i])
			.classed("team",true);
	}
	console.log(worldcupData.teams_iso);
    //We strongly suggest using classes to style the selected countries.



}

/* DATA LOADING */

// This is where execution begins; everything
// above this is just function definitions
// (nothing actually happens)

//Load in json data to make map
d3.json("data/world.json", function (error, world) {
    if (error) throw error;
    drawMap(world);
});

// Load CSV file
d3.csv("data/fifa-world-cup.csv", function (error, csv) {

    csv.forEach(function (d) {

        // Convert numeric values to 'numbers'
        d.year = +d.YEAR;
        d.teams = +d.TEAMS;
        d.matches = +d.MATCHES;
        d.goals = +d.GOALS;
        d.avg_goals = +d.AVERAGE_GOALS;
        d.attendance = +d.AVERAGE_ATTENDANCE;
        //Lat and Lons of gold and silver medals teams
        d.win_pos = [+d.WIN_LON, +d.WIN_LAT];
        d.ru_pos = [+d.RUP_LON, +d.RUP_LAT];

        //Break up lists into javascript arrays
        d.teams_iso = d3.csvParse(d.TEAM_LIST).columns;
        d.teams_names = d3.csvParse(d.TEAM_NAMES).columns;

    });

    // Store csv data in a global variable
    allWorldCupData = csv;
    // Draw the Bar chart for the first time
    updateBarChart('attendance');
});
