// Global var for FIFA world cup data
var allWorldCupData;

/**
 * Render and update the bar chart based on the selection of the data type in the drop-down box
 *
 * @param selectedDimension a string specifying which dimension to render in the bar chart
 */
function updateBarChart(selectedDimension) {
	
	var vertCol = [];
	var horCol = [];
	var vertMargin = 50;
	var horMargin = 60;
	
	
	allWorldCupData.forEach(function(d){
		vertCol.unshift(d[selectedDimension]);
		horCol.unshift(d.year);
	});
	
	var svgBounds = d3.select("#barChart").node().getBoundingClientRect(),
        xAxisWidth = 100,
        yAxisHeight = 70;

    
	// ******* TODO: PART I *******

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
			var y = vertMargin*-1
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
	
    
	
    // ******* TODO: PART II *******

    // Implement how the bars respond to click events
	// Color the selected bar to indicate is has been selected.
    // Make sure only the selected bar has this new color.
    bars.on("click", function(d,i){
			d3.selectAll("rect").classed("pick",false);
			d3.select(this).attr("class", "pick")

			console.log("You selected year: " + horCol[i])
		})

    // Output the selected bar to the console using console.log()
}

/**
 *  Check the drop-down box for the currently selected data type and update the bar chart accordingly.
 *
 *  There are 4 attributes that can be selected:
 *  goals, matches, attendance and teams.
 */

function chooseData() {

    // ******* TODO: PART I *******
    //Changed the selected data when a user selects a different
    // menu item from the drop down.
	var select = document.getElementById("dataset");
	updateBarChart(select.options[select.selectedIndex].value);
	
}

/* DATA LOADING */

// This is where execution begins; everything
// above this is just function definitions
// (nothing actually happens)


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
