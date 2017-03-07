/** Global var to store all match data for the 2014 Fifa cup */
var teamData;

/** Global var for list of all elements that will populate the table.*/
var tableElements;

/** Variables to be used when sizing the svgs in the table cells.*/
var cellWidth = 70,
    cellHeight = 20,
    cellBuffer = 15,
    barHeight = 20;

/**Set variables for commonly accessed data columns*/
var goalsMadeHeader = 'Goals Made',
    goalsConcededHeader = 'Goals Conceded';

/** Setup the scales*/
var goalScale = d3.scaleLinear()
    .range([cellBuffer, 2 * cellWidth - cellBuffer]);

/**Used for games/wins/losses*/
var gameScale = d3.scaleLinear()
    .range([0, cellWidth - cellBuffer]);

/**Color scales*/
/**For aggregate columns*/
var aggregateColorScale = d3.scaleLinear()
    .range(['#ece2f0', '#016450']);

/**For goal Column*/
var goalColorScale = d3.scaleQuantize()
    .domain([-1, 1])
    .range(['#cb181d', '#034e7b']);

/**json Object to convert between rounds/results and ranking value*/
var rank = {
    "Winner": 7,
    "Runner-Up": 6,
    'Third Place': 5,
    'Fourth Place': 4,
    'Semi Finals': 3,
    'Quarter Finals': 2,
    'Round of Sixteen': 1,
    'Group': 0
};

d3.json('data/fifa-matches.json',function(error,data){
    teamData = data;
    createTable();
    updateTable();
})

/**
 * Loads in the tree information from fifa-tree.csv and calls createTree(csvData) to render the tree.
 *
 */
d3.csv("data/fifa-tree.csv", function (error, csvData) {

    //Create a unique "id" field for each game
    csvData.forEach(function (d, i) {
        d.id = d.Team + d.Opponent + i;
    });

    createTree(csvData);
});

/**
 * Creates a table skeleton including headers that when clicked allow you to sort the table by the chosen attribute.
 * Also calculates aggregate values of goals, wins, losses and total games as a function of country.
 *
 */
function createTable() {

// ******* TODO: PART II *******
var goalsMade = teamData.map(function(d){
	return d.value["Goals Made"];
});

goalScale.domain([0,d3.max(goalsMade)]);

var games = teamData.map(function(d){
	return d.value["TotalGames"];
});

gameScale.domain([0,d3.max(games)]);	
aggregateColorScale.domain([0, d3.max(games)]);	
	
	
var xAxis = d3.axisTop(goalScale);
var xLine = d3.select("#goalHeader")
	.append("svg")
	.attr("width",2*cellWidth)
	.attr("height",cellHeight+3)
	.append("g")
	.attr("transform","translate(0," +cellHeight+ ")")
	.call(xAxis);

tableElements = teamData;

// ******* TODO: PART V (Extra Credit) *******

}

/**
 * Updates the table contents with a row for each element in the global variable tableElements.
 *
 */
function updateTable() {

// ******* TODO: PART III *******
	d3.select("tbody")
		.selectAll("*")	
		.remove();

	var tr = d3.select("tbody")
		.selectAll("tr")
		.data(tableElements)
		.enter()        
		.append('tr')
		.on("click", function(d, i) {
              updateList(i);
          })
		.on("mouseover", function(d, i){
              updateTree(i);
         });
/*console.log(tableElements);*/

	var td = tr.selectAll("td").data(function(d){
					/*console.log(d);*/
				var data = [{"type": d.value.type, "vis": "text", "value":d.key},
						  {"type": d.value.type, "vis": "goals", "value":[d.value["Goals Made"], d.value["Goals Conceded"], d.value["Delta Goals"]]},
						  {"type": d.value.type, "vis": "text", "value":d.value.Result.label},
						  {"type": d.value.type, "vis": "bar", "value":d.value.Wins},
						  {"type": d.value.type, "vis": "bar", "value":d.value.Losses},
						  {"type": d.value.type, "vis": "bar", "value":d.value.TotalGames}];
				return data;
			})
			.enter()
			.append("td");

	var bars = td.filter(function (d) {
		return d.vis == 'bar' && d.type == "aggregate";
		})
			.append("svg")
			.attr("height",cellHeight)
			.attr("width",cellWidth);
	bars.append("rect")
			.attr("x", "0")
			.attr("y", "0")
			.attr("width", function(d){
				return gameScale(d.value);
			})
			.attr("height", barHeight)
			.style("fill", function (d) {
				return aggregateColorScale(d.value);
			});
	bars.append("text")
			.attr("x", function(d) { 
				return gameScale(d.value) - 12; 
			})
			.attr("y", barHeight)
			.attr("dy", "-.40em")
			.style("fill", "white")
			.text(function(d) {
				if(d.value > 1)
				return d.value;
		  });

	td.filter(function (d) {
		return d.vis == 'text';
		})
		.text(function(d,i){
			var value = d.value;

			if( d.type == "game" && i == 0){
			value = "x" + value;
			}
			return value;
		})
		.attr("class", function (d,i){
			if (i == 0){
			  return d.type;
			}
		});

	var goals = td.filter(function (d) {
		return d.vis == 'goals';
		})
			.append("svg")
			.attr("width", 2*cellWidth)
			.attr("height", cellHeight);

	goals.append("rect")
			.attr("class", "goalBar")
			.attr("x", function (d){
			  return goalScale(Math.min(d.value[0], d.value[1]));
			})
			.attr("y", function(d){
			  var position = 3;
			  if (d.type == "game"){
				position *= 0.05;
			  }
			  return barHeight/2 - position;
			})
			.attr("height", function(d){
			  if (d.type == "game"){ 
				  return cellHeight/4 
			  }else{
				  return cellHeight
			  }
			})
			.attr("width", function(d){
			  return goalScale(Math.max(d.value[0], d.value[1])) - goalScale(Math.min(d.value[0], d.value[1]));
			})
			.style("fill",function(d){
			  if(d.value[1] == d.value[0]){
				return "gray";
			  }else if(d.value[2] > 0){
				return goalColorScale(1);
			  }else{
				return goalColorScale(-1);
			  }
	});


	 goals.append("circle")
			.attr("class", "goalCircle")
			.attr("cx", function (d) {
				return goalScale(d.value[0]);
			})
			.attr("cy", function (d) {
				return barHeight/2 + 3.5;
			})
			.attr("r", "5")
			.style("fill",function(d){
			  if(d.type == "game"){
				return "white";
			  }
			  if(d.value[2] == 0){
				return "gray";
			  }
			  return goalColorScale(1);
			})
			.style("stroke", function(d){
			  if(d.value[1] == d.value[0]){
				return "gray";
			  }
			  return goalColorScale(1);
	 });

	goals.append("circle")
			.attr("class", "goalCircle")
			.attr("cx", function (d) {
				return goalScale(d.value[1]);
			})
			.attr("cy", function (d) {
				return barHeight/2 + 3.5;
			})
			.attr("r", "5")
			.style("fill",function(d){
			  if(d.type == "game"){
				return "white";
			  }
			  if(d.value[2] == 0){
				return "gray";
			  }
			  return goalColorScale(-1);
			})
			.style("stroke", function(d){
			  if(d.value[1] == d.value[0]){
				return "gray";
			  }
			  return goalColorScale(-1);
	});       
	
	
	
};




/**
 * Collapses all expanded countries, leaving only rows for aggregate values per country.
 *
 */
function collapseList() {

    // ******* TODO: PART IV *******
	
	
	//Part 4 is down below in the updateList, teams are spliced out of the table if a team is clicked on a second time
}

/**
 * Updates the global tableElements variable, with a row for each row to be rendered in the table.
 *
 */
function updateList(i) {

    // ******* TODO: PART IV *******
	
	if (tableElements[i].value.type == "aggregate"){

        if(i == tableElements.length -1){
          var teams = tableElements[i].value.games;

          for (var j = teams.length -1; j >= 0; j--){
            tableElements.splice(i+1, 0, teams[j]);
          }
        }else if((tableElements[i+1].value.type == "aggregate")){
          var teams = tableElements[i].value.games;

          for (var j = teams.length -1; j >= 0; j--){
            tableElements.splice(i+1, 0, teams[j]);
          }
        }else{
          var teams = tableElements[i].value.games;
          tableElements.splice(i+1, teams.length);
        }
		
        updateTable();
		
	}
}

/**
 * Creates a node/edge structure and renders a tree layout based on the input data
 *
 * @param treeData an array of objects that contain parent/child information.
 */
function createTree(treeData) {

    // ******* TODO: PART VI *******
	var root = d3.stratify()
        .id(function(d) {
          return d.id; })
        .parentId(function(d) {
          if(treeData[d.ParentGame] != undefined){
            return treeData[d.ParentGame].id;
          }else{
            return null;
          } })
        (treeData);

  var tree = d3.tree().size([800, 300]);

  var nodes = d3.hierarchy(root, function(d) {
      return d.children;
  });

    tree(root);
    nodes = tree(nodes);

    var treeDiag = d3.select("#tree").attr("transform", "translate(100,0)");

    var link = treeDiag.selectAll(".link")
        .data(nodes.descendants().slice(1))
        .enter().append("path")
        .attr("class", "link")
        .attr("d", function(d) {
           return "M" + d.y + "," + d.x
             + "C" + (d.y + d.parent.y) / 2 + "," + d.x
             + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
             + " " + d.parent.y + "," + d.parent.x;
           });

    var node = treeDiag.selectAll(".node")
              .data(nodes.descendants())
              .enter().append("g")
              .attr("class", function(d) {
                if (d.data.data.Wins == "1"){
					return "winner";
				}else{
					return "node";
				}})
              .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")"; });
	
    node.append("circle")
      .attr("r", 6);

    node.append("text")
      .attr("dy", ".2em")
      .attr("x", function(d) { 
		if(d.children){
			return -13;
		}else{
			return 13;
		}})
      .style("text-anchor", function(d) {
         if(d.children) {
			 return"end"; 
		 }else{ 
			 return"start"; 
		 }})
      .text(function(d) {
        return d.data.data.Team; });

};

/**
 * Updates the highlighting in the tree based on the selected team.
 * Highlights the appropriate team nodes and labels.
 *
 * @param team a string specifying which team was selected in the table.
 */
function updateTree(row) {

    // ******* TODO: PART VII *******
	clearTree();
    var rowElement = tableElements[row];
    if(rowElement.value.Result.label != "Group"){
      var treeDiag = d3.select("#tree");
      if(rowElement.value.type == "aggregate"){
		  
          treeDiag.selectAll(".link").filter(function(d){
            return d.data.data.Team == rowElement.key && d.parent.data.data.Team == rowElement.key;
          })
			  .classed("selected",true);
		  
          treeDiag.selectAll("text").filter(function(d){
            return d.data.data.Team == rowElement.key;
          })
			  .classed("selectedLabel",true);
      }else{
		  
        treeDiag.selectAll(".link").filter(function(d){
          return (d.data.data.Team == rowElement.key && d.data.data.Opponent == rowElement.value.Opponent) || (d.data.data.Opponent == rowElement.key && d.data.data.Team == rowElement.value.Opponent);
        })
			.classed("selected",true);
		  
        treeDiag.selectAll("text").filter(function(d){
          return (d.data.data.Team == rowElement.key && d.data.data.Opponent == rowElement.value.Opponent) || (d.data.data.Opponent == rowElement.key && d.data.data.Team == rowElement.value.Opponent);
        })
			.classed("selectedLabel",true);
      }
    }
}

/**
 * Removes all highlighting from the tree.
 */
function clearTree() {

    // ******* TODO: PART VII *******
	d3.selectAll(".selected").classed("selected",false);
    d3.selectAll(".selectedLabel").classed("selectedLabel",false);

}
