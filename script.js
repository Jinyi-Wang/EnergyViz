/*
    Draw a map
*/

// Define the map, layers, point collection, and edge collection
const map = L.map('map').setView([50.0, 10.0], 4);
const edgeLayer = L.layerGroup().addTo(map);
const pointLayer = L.layerGroup().addTo(map);
const haloLayer = L.layerGroup().addTo(map);
// haloLayer.bringToFront();
// edgeLayer.bringToBack();
const nodeFullOpacity = 0.8;
const nodeGrayOpacity = 0.5;
const nodeNullOpacity = 0.0;
const lineFullOpacity = 0.4;
const lineGrayOpacity = 0.25;
const lineNullOpacity = 0.0;
const nodeNullRadius = 0.0;


let selectedFuelTypes = new Set(); // Initialize an empty set to store selected fuel types
selectedFuelTypes.add("Other");
selectedFuelTypes.add("Solar");
selectedFuelTypes.add("Wind");
selectedFuelTypes.add("Hydro");
selectedFuelTypes.add("Biowaste");
selectedFuelTypes.add("Oil");
selectedFuelTypes.add("Gas");
selectedFuelTypes.add("Coal");
selectedFuelTypes.add("Nuclear");
// const allFuelTypes = selectedFuelTypes; // Later it will change when selectedFuelTypes change...
const allFuelTypes = new Set();
allFuelTypes.add("Other");
allFuelTypes.add("Solar");
allFuelTypes.add("Wind");
allFuelTypes.add("Hydro");
allFuelTypes.add("Biowaste");
allFuelTypes.add("Oil");
allFuelTypes.add("Gas");
allFuelTypes.add("Coal");
allFuelTypes.add("Nuclear");


// const points = [];
// const edges = [];
// const nearestNeighborsData = []; // Store nearest neighbors for each node
let points = [];
let edges = [];
let nearestNeighborsData = []; // Store nearest neighbors for each node
let nID = 0;
let newNeighborID = 0;
let selectedPoints = [];
let halos = [];


// Use Leaflet's OSM layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Function to update the map
function updateMap() {

// // Get the current value of numTargets from the input element
// const numTargets = document.getElementById('numTargets').value;
// console.log("Updating the map with numTargets: " + numTargets);


// Get the user-selected number of targets
const numTargets = document.getElementById('numTargets').value;


// Clear layers and collections
pointLayer.clearLayers();
edgeLayer.clearLayers();
points.length = 0;
edges.length = 0;

function financial(x) {
    return Number.parseFloat(x).toFixed(3);
}

/*
    Read the data
*/
// Specify the JSON file path
// const jsonFilePath = 'European_neighbours_noDup_itself.json';
// const jsonFilePath = 'Sweden_neighbours_noDup_itself.json';
 const jsonFilePath = 'global_neighbors_11.json';



// Use Fetch API for asynchronous loading
fetch(jsonFilePath)
    .then(response => {
    // Check if the HTTP response is successful
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // Parse the response as JSON
    return response.json();
    })
    .then(jsonData => {

    // renew them when the numTargets change
    points = [];
    edges = [];
    nearestNeighborsData = [];
    nID = 0;
    newNeighborID = 0;

console.log("allFuelTypes");
console.log(allFuelTypes);
    // Iterate over the locations in the JSON data
    jsonData.data.forEach(location => {

        const name = location[2];
        const latitude = location[5];
        const longitude = location[6];

        let processed_type = (allFuelTypes.has(location[7])) ? location[7]: "Other";
        if(location[7] === "Waste" || location[7] === "Biomass"  )
        processed_type = "Biowaste";
        if (processed_type == "Other")
            console.log("1");

        const color = getColorFromFuel(processed_type);
        const originalPointRadius = processGeneration(location[30])+1;

        // Create a CircleMarker and add it to the point layer
        const marker = L.circleMarker([latitude, longitude], {
            radius: originalPointRadius,
            color: color,
            fill: true,  // fill the node
            fillOpacity: nodeFullOpacity,
            opacity: nodeFullOpacity,

            // weight: 3  
        })
        // .bindPopup('Plant: ' + name + '<br>Generation: ' + location[30] + " GWh"
        // +'<br><button onclick="onShowAllDetailButtonClick(\'' + nID + '\')">Details</button>'
        // // +'<button onclick="onDeleteButtonClick(\'' + nID + '\')">Disable</button>'
        // )
        .bindPopup(
            'Plant: ' + name + '<br>Generation: ' + location[30] + ' GWh' +
            '<br><div style="text-align:center;">' +
            '<button onclick="onShowAllDetailButtonClick(\'' + nID + '\')">Details</button>' +
            '</div>',
            { closeButton: false }  // <-- remove the X button
          )
         .addTo(pointLayer);

         marker.nodeId = nID;

         const halo = L.circleMarker([latitude, longitude], {
            radius: originalPointRadius+10,
            color: "yellow",
            fill: false,  // fill the node
            fillOpacity: 0,
            opacity: 0,
            weight: 4 , 
        })
         .addTo(haloLayer);
         halo.nodeId = nID;
         halo.bringToFront();

        halos.push(
            {
                halo: halo,
                node: nID,
                originalRadius: originalPointRadius,
            }
        )

        // Add the point to the point collection
        points.push(
          {
            circleMarker: marker,
            originalRadius: originalPointRadius,
             lat: latitude,
             lon: longitude,
             node: nID,
             name: name,
             color: color,
             
            //  country : row.country,
            //  country_long : row.country_long,
             country : location[1],
             gppd_idnr : location[3],
             capacity_mw : location[4],
             primary_fuel : location[7],
             primary_fuel_processed: processed_type,
            //  other_fuel1 : row.other_fuel1,
            //  other_fuel2 : row.other_fuel2,
            //  other_fuel3 : row.other_fuel3,
             commissioning_year : location[11],
             owner : location[12],
             source : location[13],
             url : location[14],
             geolocation_source : location[15],
             wepp_id : location[16],
             year_of_capacity_data : location[17],
            //  generation_gwh_2013 : row.generation_gwh_2013,
            //  generation_gwh_2014 : row.generation_gwh_2014,
            //  generation_gwh_2015 : row.generation_gwh_2015,
            //  generation_gwh_2016 : row.generation_gwh_2016,
            //  generation_gwh_2017 : row.generation_gwh_2017,
            //  generation_gwh_2018 : row.generation_gwh_2018,
            //  generation_gwh_2019 : row.generation_gwh_2019,
             generation_data_source : location[25],
             estimated_generation_gwh_2013 : location[26],
             estimated_generation_gwh_2014 : location[27],
             estimated_generation_gwh_2015 : location[28],
             estimated_generation_gwh_2016 : location[29],
             estimated_generation_gwh_2017 : location[30],
             estimated_generation_note_2013 : location[31],
             estimated_generation_note_2014 : location[32],
             estimated_generation_note_2015 : location[33],
             estimated_generation_note_2016 : location[34],
             estimated_generation_note_2017 : location[35],
        }
        );
        nID = nID +1;

    });

    nID = 0;

    // Iterate over the edge relationships in the JSON data
    Object.entries(jsonData.distances).forEach(([source, relations]) => {
        // Get the specified number of targets
        const selectedRelations = relations.slice(0, Math.floor(numTargets)+1);
        // console.log(numTargets)
        newNeighborID = 0;
        let sourcePoint;

        selectedRelations.forEach(relation => {

        if(newNeighborID === 0){
        // Find the corresponding points using the names
            const sourceName = relation.neighbor;
            const sourceLat = relation.latitude;
            const sourceLon = relation.longitude;

            sourcePoint = points.find(point => (
            point.name === sourceName && 
            Math.floor(point.lat) === Math.floor(sourceLat) && 
            Math.floor(point.lon) === Math.floor(sourceLon)
        ));
        newNeighborID = newNeighborID+1;

        // console.error('Source point:', sourcePoint);

        }
        // if (newNeighborID === 0) {
        //     // Find the corresponding points using the names
        //     const sourcePointCandidates = points.filter(point => (
        //         point.name === relation.neighbor &&
        //         Math.floor(point.lat) === Math.floor(relation.latitude) &&
        //         Math.floor(point.lon) === Math.floor(relation.longitude)
        //     ));
        //     newNeighborID = newNeighborID+1;
        //     if (sourcePointCandidates.length > 0) {
        //         // Use the first matching point as the sourcePoint
        //         sourcePoint = sourcePointCandidates[0];
        //         console.error('Source point:', sourcePoint);
        //     } else {
        //         console.error('Source point not found for relation:', relation);
        //         return;
        //     }
        // }
        else{
            const target = relation.neighbor;
            const distance = relation.distance;
            const originalEdgeWeight = 1.5 + processDistance(distance);
            const targetLat = relation.latitude;
            const targetLon = relation.longitude;

            const targetPoint = points.find(point => (
                // normalizeString(point.name.trim().toLowerCase()) === normalizeString(target.trim().toLowerCase()) && 
                point.name === target &&
                Math.floor(point.lat) === Math.floor(targetLat) && 
                Math.floor(point.lon) === Math.floor(targetLon)
            ));

            const polyline = L.polyline([
                [sourcePoint.lat, sourcePoint.lon],
                [targetPoint.lat, targetPoint.lon]
            ], { color: 'darkblue',
            weight: originalEdgeWeight,
            opacity: lineFullOpacity,
            })
            .addTo(edgeLayer);
            polyline.bringToBack();

            // Add the edge to the edge collection
            polyline.bindPopup(
                'Connect: ' + sourcePoint.name + ' and ' + target+'<br>' +
                'Distance: ' + financial(distance) + ' km' );

            edges.push({
            polyline: polyline,
            originalWeight: originalEdgeWeight,
            source: sourcePoint,
            target: targetPoint,
            // distance:distance,
            });

            // here if I want to add the source point as a neighbour to the target point, 
            // I have to make a new point and add and check whether there is duplicate
            // the .includes() do not work, with find neighbors back code, neighbors shows there has duplicates

            // Assuming nID is the node ID for which you want to add new information
            const targetNodeInfo = {
                // node: newNeighborID,
                distance: distance,
                name: target,
            };
            const nodeID = sourcePoint.node;
            // Check if nID exists in nearestNeighborsData
            if (nearestNeighborsData.hasOwnProperty(nodeID)) {
                nearestNeighborsData[nodeID].push(targetNodeInfo);

                // Check for duplicate content in the array for the specific nID
                // Add new information to the array for the specific nID
                // if (!nearestNeighborsData[nodeID].includes(targetNodeInfo)) {
                //     // Add new information to the array for the specific nID if not a duplicate
                //     nearestNeighborsData[nodeID].push(targetNodeInfo);
                // }
            } else {
                // If nID doesn't exist, create a new entry
                nearestNeighborsData[nodeID] = [targetNodeInfo];
            }

            // const sourceNodeInfo = {
            //     // node: newNeighborID,
            //     distance: distance,
            //     name: sourcePoint.name,
            // };
            // const nodeID2 = targetPoint.node;
            // // Check if nID exists in nearestNeighborsData
            // if (nearestNeighborsData.hasOwnProperty(nodeID2)) {
            //     // Check for duplicate content in the array for the specific nID
            //     // Add new information to the array for the specific nID
            //     if (!nearestNeighborsData[nodeID2].includes(sourceNodeInfo)) {
            //         // Add new information to the array for the specific nID if not a duplicate
            //         nearestNeighborsData[nodeID2].push(sourceNodeInfo);
            //     }
            // } else {
            //     // If nID doesn't exist, create a new entry
            //     nearestNeighborsData[nodeID2] = [sourceNodeInfo];
            // }

            newNeighborID = newNeighborID+1;
        }
        });

        nID = nID+1;

    });


    // add filtering
    points.forEach(point => {
        var gen = getGen(point.estimated_generation_gwh_2017);
        var markerColor = point.circleMarker.options.color;

        if (gen >= minV && gen <= maxV && selectedFuelTypes.has(point.primary_fuel_processed) && selectedCountries.indexOf(point.country) !== -1  ){
            if( markerColor !== "gray"){
            point.circleMarker.setStyle({ opacity: nodeFullOpacity, fillOpacity: nodeFullOpacity });
            var zoomLevel = map.getZoom();
            var pointRadius = point.originalRadius + Math.pow(2, zoomLevel - 4)*0.8 -0.8;
            point.circleMarker.setRadius(pointRadius); 
        }}
        else {
        if( markerColor !== "gray"){
            point.circleMarker.setStyle({ opacity: nodeNullOpacity, fillOpacity: nodeNullOpacity });
            point.circleMarker.setRadius(nodeNullRadius);
        }}
    });
    edges.forEach( edge =>{
        var opa1 = edge.source.circleMarker.options.fillOpacity;
        var opa2 = edge.target.circleMarker.options.fillOpacity;

        if( (opa1 == nodeFullOpacity) && (opa2 == nodeFullOpacity ) ){
            edge.polyline.setStyle({ opacity: lineFullOpacity ,});
        }
        else{
            edge.polyline.setStyle({ opacity: lineNullOpacity ,});
        }
    })

    
    })
    .catch(error => {
    // Handle errors when loading the JSON file
    console.error('Error loading JSON file:', error);
    });
    haloLayer.eachLayer(function (layer) {
        layer.bringToFront();
    })
    edgeLayer.eachLayer(function (layer) {
        layer.bringToBack();
    })

}


// Initial map load
updateMap();
haloLayer.eachLayer(function (layer) {
    layer.bringToFront();
})
edgeLayer.eachLayer(function (layer) {
    layer.bringToBack();
})

/*
    Compute the color, size of edges and nodes, according to data
*/
 // Function to determine color based on primary_fuel
 function getColorFromFuel(fuel) {
     switch (fuel.toLowerCase()) {
         case 'coal':
             return "#bf812d";
         case 'gas':
             return '#fbb4ae';
         case 'oil':
             return '#543005';
        case 'nuclear':
            return '#FFD700';            
        //  case 'waste':
        //      return '#decbe4';
        //  case 'biomass':
        //      return '#decbe4';
        case 'biowaste':
            return '#8dd3c7';
         case 'hydro':
             return '#3288bd';
         case 'wind':
             return '#93b6cc';
         case 'solar':
             return '#fdae61';
         default:
             return '#8073ac';
     }
 }

 function normalizeString(str) {
  return str.replace(/[^a-zA-Z0-9]/g, '');
}

 function processGeneration(input) {
    // transfer input to number
    const number = parseFloat(input);

    if (isNaN(number)) {
        // not a number
        return 0;
    } else {
        if (number > 10000) {
            return 3;
        } else if (number > 1000) {
            return 2;
        } else if (number > 100) {
            return 1;
        } else {
            return 0;
        }
    }
}

function processDistance(input) {
    // transfer input to number
    const number = parseFloat(input);

    if (isNaN(number)) {
        // not a number
        return 0;
    } else {
        if (number > 100) {
            return 0;
        } else if (number > 50) {
            return 0.5;
        } else if (number > 20) {
            return 1;
        } else {
            return 1.5;
        }
    }
}



/*
    Functions when change the input or click a button
*/
// Add an event listener to call updateMap function when the input value changes
document.getElementById('numTargets').addEventListener('input', updateMap);


// // It has the default value 3 so it will load twice with 3 and then new value..... Wait twice
// document.getElementById('numTargets').addEventListener('input', function() {
//     // Get the value of numTargets
//     const numTargets = document.getElementById('numTargets').value;

//     // Check if the current value is different from the URL's value to avoid reloading unnecessarily
//     const urlParams = new URLSearchParams(window.location.search);
//     const currentURLNumTargets = urlParams.get('numTargets');

//     if (numTargets !== currentURLNumTargets) {
//         // Reload the page and pass numTargets as a query parameter
//         window.location.href = window.location.pathname + '?numTargets=' + numTargets;
//     } else {
//         // Call updateMap if the value hasn't changed
//         updateMap();
//     }
// });

// // Page load event to initialize input
// window.addEventListener('load', function() {
//     const urlParams = new URLSearchParams(window.location.search);
//     const numTargets = urlParams.get('numTargets');

//     if (numTargets) {
//         document.getElementById('numTargets').value = numTargets;
//         updateMap(); // Update based on URL's numTargets value
//     }
// });






function onNeighborsButtonClick(nID) {
    
    var content = '<b>Plant\'s Name:</b> ' + points[nID].name + '<br>' + '<br>';
    content += '<b>Neighbors:</b><br>';

    nearestNeighborsData[nID].forEach(function (neighbor) {
        content +=  neighbor.name + ': ' + Number.parseFloat((neighbor.distance)).toFixed(3) +
        ' km<br>';
    });
    neigContainer.innerHTML = content;
}

// changeColor function to change the color of a specific point and its connected edges on the map
function onDeleteButtonClick(pointId) {
// Change opacity of the clicked marker

    var currentOpacity = points[pointId].circleMarker.options.fillOpacity;
    // var newColor = (originalColor === 1 ) ? 'gray' : 'originalColor'; // Replace 'originalColor' with the original color value
    var newColor = 'gray';

    // var newOpacity = (currentOpacity === 1) ? 0.35 : 1;
    var newOpacity;
    var edgeOpacity;

    if (currentOpacity === nodeFullOpacity) {
        edgeOpacity = newOpacity = 0.25;

    } else {
    newOpacity = nodeGrayOpacity;
    edgeOpacity = 0.4;
    }

    points[pointId].circleMarker.setStyle({ opacity: newOpacity, fillOpacity: newOpacity,color: newColor });

    // neighbor of this point 
    // edges.forEach(function (edge) {
    //     if (edge.source.node == pointId || edge.target.node == pointId){
    //         edge.polyline.setStyle({ opacity: newOpacity });
    //     }
    // });

    var processedNodes = {};  
    // store the node, if there is already a edge, when this edge will opacity to 0
    // otherwise, two edges add up, the Opacity will be 2 * newOpacity !!!

    edges.forEach(function (edge) {
        if (edge.source.node == pointId) {
            if (processedNodes[edge.target.node]) {
                edge.polyline.setStyle({ opacity: 0.0 , color: newColor });
            } else {
                edge.polyline.setStyle({ opacity: edgeOpacity , color: newColor });
                processedNodes[edge.target.node] = true;  
            }
        } else if (edge.target.node == pointId) {
            if (processedNodes[edge.source.node]) {
                edge.polyline.setStyle({ opacity: 0.0 , color: newColor });
            } else {
                edge.polyline.setStyle({ opacity: edgeOpacity , color: newColor });
                processedNodes[edge.source.node] = true;  
            }
        }
    });
}

function onShowAllDetailButtonClick(nID) {
    onDetailsButtonClick(nID);
    selectedPoints.push(+nID);
    updateChart(nID);
    onNeighborsButtonClick(nID);
}

function onDetailsButtonClick(nID) {
    
    var content = '<b>Plant\'s Name:</b> ' + points[nID].name + '<br>';

    if(points[nID].lon>180 ){
      content += '<b>location:</b> ' + points[nID].lat + ', ' + (points[nID].lon-360) + '<br>' ;
    }
    else{
    content += '<b>location:</b> ' + points[nID].lat + ', ' + points[nID].lon + '<br>' ;    
    }          
    content += 
              //   '<b>lat:</b> ' + points[nID].lat + '<br>' +
            //   '<b>lon:</b> ' + points[nID].lon + '<br>' +
              '<b>country:</b> ' + points[nID].country + '<br>' +
              '<b>gppd_idnr:</b> ' + points[nID].gppd_idnr + '<br>' +
              '<b>capacity_mw:</b> ' + points[nID].capacity_mw + ' MW <br>' +
              '<b>primary_fuel:</b> ' + points[nID].primary_fuel + '<br>' +
              '<b>commissioning_year:</b> ' + points[nID].commissioning_year + '<br>' +
              '<b>owner:</b> ' + points[nID].owner + '<br>' +
              '<b>source:</b> ' + points[nID].source + '<br>' +
            //   '<b>url:</b> ' + points[nID].url + '<br>' +
              '<b>url:</b> <a href=' + points[nID].url + ' target="_blank">'+ points[nID].url +'</a><br>' +
              '<b>geolocation_source:</b> ' + points[nID].geolocation_source + '<br>' +
              '<b>wepp_id:</b> ' + points[nID].wepp_id + '<br>' +
              '<b>year_of_capacity_data:</b> ' + points[nID].year_of_capacity_data + '<br>' +
              '<b>generation_data_source:</b> ' + points[nID].generation_data_source + '<br>' +
              '<b>estimated_generation_gwh_2013:</b> ' + points[nID].estimated_generation_gwh_2013 + ' GWh <br>' +
              '<b>estimated_generation_gwh_2014:</b> ' + points[nID].estimated_generation_gwh_2014 + ' GWh <br>' +
              '<b>estimated_generation_gwh_2015:</b> ' + points[nID].estimated_generation_gwh_2015 + ' GWh <br>' +
              '<b>estimated_generation_gwh_2016:</b> ' + points[nID].estimated_generation_gwh_2016 + ' GWh <br>' +
              '<b>estimated_generation_gwh_2017:</b> ' + points[nID].estimated_generation_gwh_2017 + ' GWh <br>' +
              '<b>estimated_generation_note_2013:</b> ' + points[nID].estimated_generation_note_2013 + ' GWh <br>' +
              '<b>estimated_generation_note_2014:</b> ' + points[nID].estimated_generation_note_2014 + ' GWh <br>' +
              '<b>estimated_generation_note_2015:</b> ' + points[nID].estimated_generation_note_2015 + ' GWh <br>' +
              '<b>estimated_generation_note_2016:</b> ' + points[nID].estimated_generation_note_2016 + ' GWh <br>' +
              '<b>estimated_generation_note_2017:</b> ' + points[nID].estimated_generation_note_2017 + ' GWh <br>';

    detaContainer.innerHTML = content;
}

map.on('zoomend', function () {
    var zoomLevel = map.getZoom();
    points.forEach(function (point) {
      if(point.circleMarker.options.fillOpacity == nodeFullOpacity || point.circleMarker.options.color == "gray" ){
      var pointRadius = point.originalRadius + Math.pow(2, zoomLevel - 4)*0.8 -0.8;
      point.circleMarker.setRadius(pointRadius);
      }
    });

    halos.forEach(function (halo) {
        var haloRadius = halo.originalRadius + Math.pow(2, zoomLevel - 4)*1 -1 + 10;
        halo.halo.setRadius(haloRadius);
      });

    edges.forEach(function (edge) {
        var edgeWeight = edge.originalWeight + Math.pow(2, zoomLevel - 4)*0.07 -0.07;
      edge.polyline.setStyle({ weight: edgeWeight });
    });

    haloLayer.eachLayer(function (layer) {
        layer.bringToFront();
    })
    edgeLayer.eachLayer(function (layer) {
        layer.bringToBack();
    })

  });


// searching function
function performSearch() {
    // get input
    var searchInput = document.getElementById('searchInput').value;

    var searchResults = searchPoints(searchInput);

    displaySearchResults(searchResults);
}

// search in array "points"
function searchPoints(query) {
    query = query.toLowerCase(); // search without considering case
    return points.filter(function(point) {
        return point.name.toLowerCase().includes(query) && point.circleMarker.options.fillOpacity === nodeFullOpacity;
    }).toSorted(function(point1, point2) {
        return point1.name.localeCompare(point2.name);
    });
}

// show search results
function displaySearchResults(results) {
    var searchResultsDiv = document.getElementById('searchResults');
    
    // clear it
    searchResultsDiv.innerHTML = '';

    // show the number of the results
    var resultCountDiv = document.createElement('div');
    resultCountDiv.textContent = 'We found ' + results.length + ' plants for you.';
    searchResultsDiv.appendChild(resultCountDiv);

    // show result
    if (results.length === 0) {
        var noResultsItem = document.createElement('div');
        noResultsItem.textContent = 'No plants found';
        searchResultsDiv.appendChild(noResultsItem);
    } 
    // else {
    //     results.forEach(function(result) {
    //         var resultItem = document.createElement('div');
    //         resultItem.textContent = result.name;
    //         // resultItem.textContent = result.name + '<button onclick="onSearchDetailsButtonClick(\'' + result.node + '\')">See it</button>';
    //         searchResultsDiv.appendChild(resultItem);

    //         // add a button after search result
    //         var detailsButton = document.createElement('button');
    //         detailsButton.textContent = 'See it!';
    //         detailsButton.addEventListener('click', function() {
    //             // click and get the details
    //             alert('Details' + JSON.stringify(result));
    //         });

    //         //put it after the results
    //         resultItem.appendChild(detailsButton);
    //         searchResultsDiv.appendChild(resultItem);
    //     });
    // }
    else {
        results.forEach(function(result) {
            var resultItem = document.createElement('div');
            resultItem.textContent = result.name;

            // click and see the details
            var detailsButton = document.createElement('button');
            detailsButton.textContent = 'See it!';
            detailsButton.addEventListener('click', function() {
                map.setView([result.lat,result.lon], 9)
                // onNeighborsButtonClick(result.node);
                // onDetailsButtonClick(result.node);
                onShowAllDetailButtonClick(result.node);

                // use circles to highlight
                var circle1 = L.circleMarker([result.lat,result.lon], {
                    radius: 50,
                    color: 'yellow',
                    weight: 7,  
                    fill: false, 
                    // className: 'blinking-circle'
                    
                }).addTo(pointLayer);

                var circle2 = L.circleMarker([result.lat,result.lon], {
                    radius: 100,
                    color: 'yellow',
                    weight: 7,  
                    fill: false, 
                    // className: 'blinking-circle'
                }).addTo(pointLayer);

                var blinkInterval = setInterval(function () {
                    circle1.setStyle({ opacity: circle1.options.opacity === 0.5 ? 0.8 : 0.5 });
                    circle2.setStyle({ opacity: circle2.options.opacity === 0.5 ? 0.8 : 0.5 });
                }, 800); // 800ms blinking once


                // blinking and disappear
                setTimeout(function () {
                    clearInterval(blinkInterval);

                    circle1.setStyle({ opacity: 0.0 });
                    circle2.setStyle({ opacity: 0.0 });
                }, 2500);
            });

            // put the button after the plant's name
            resultItem.appendChild(detailsButton);

            // show the search result
            searchResultsDiv.appendChild(resultItem);
        });
}
}

/*
    Chart
*/
// // select in menu
// function showSelection() {
//     var dropdown = document.getElementById('myDropdown');
//     var selectedValue = dropdown.value;
//     alert('You selete' + selectedValue);
// }


// Build the chart 
// a line chart
function displayPowerPlantTable() {
    var tableBody = document.getElementById('powerPlantTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    points.forEach(function (powerPlantData, index) {
      var row = tableBody.insertRow(index);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);

      cell1.innerHTML = powerPlantData.name;
      cell2.innerHTML = `<button onclick="updateChart(${index})">Generate Chart</button>`;
    });
  }

  // Get Canvas element
  var ctx = document.getElementById('myChart').getContext('2d');

//   Chart.defaults.backgroundColor = '#9BD0F5';
//   Chart.defaults.borderColor = '#36A2EB';
//   Chart.defaults.color = '#000';

  // Create a line chart
  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: []
    },
    options: {
      plugins: {
            title: {
                display: true,
                text: 'View generation (unit of x, y-axis: year, GWh)'
            },
        },
      scales: {
        fontSize: 14, // Adjust the font size of the legend
        x: {
          min: 2013,
          max: 2017,
          type: 'linear',
          position: 'bottom',
          ticks: {
            stepSize: 1,
            callback: function (value) {
              return value.toFixed(0);
            }
          },
          scaleLabel: {
            display: true,
            labelString: 'Year',
          },
        //   title: {
        //     display: true,
        //     Text: 'Year'
        //   },
        },
        y: {
          min: 0,
          max: 1000,
          scaleLabel: {
            display: true,
            labelString: 'GWh',
          },
        //   title: {
        //     display: true,
        //     Text: 'GWh'
        //   },
        }
      },
      legend: {
        position: 'bottom', // Set legend position to 'bottom'
        display: true,
        fullWidth: false,
        labels: {
          fontSize: 14 // Adjust the font size of the legend
        }
      }
    }
  });

var dashLineSettings = [
    [5, 5],
    [10, 2, 5],
    [20, 5],
    [10, 5, 2],
    [15, 3, 8, 3],
    [5, 10, 15, 20],
    [10, 15, 5, 20],
    [8, 8]
];

// Function to update chart data
function updateChart(index) {
    var newPoints = points[index];
  
    // Check if the dataset for the selected power plant already exists
    var existingDataset = myChart.data.datasets.find(dataset => dataset.label === newPoints.name);
  
    var lineColor = getColorFromFuel(newPoints.primary_fuel_processed);

    if (existingDataset) {
      // If the dataset already exists, do nothing
      console.log(`Dataset for Power Plant ${index + 1} already exists.`);
      return;
    }
  
    // Calculate the maximum value among all existing datasets
    var maxExistingDataValue = getMaxExistingDataValue();
  
    // Find the maximum value among the new data points
    var maxNewDataValue = Math.max(
      newPoints.estimated_generation_gwh_2013,
      newPoints.estimated_generation_gwh_2014,
      newPoints.estimated_generation_gwh_2015,
      newPoints.estimated_generation_gwh_2016,
      newPoints.estimated_generation_gwh_2017
    );
  
    // Adjust y-axis max value based on the maximum of existing and new data values
    myChart.options.scales.y.max = Math.ceil(Math.max(maxExistingDataValue, maxNewDataValue) / 100) * 100;
  
    // If the dataset doesn't exist, add the new data to the chart
    var newData = {
      labels: ['2013', '2014', '2015', '2016', '2017'],
      datasets: [{
        label: newPoints.name,
        data: [
          newPoints.estimated_generation_gwh_2013,
          newPoints.estimated_generation_gwh_2014,
          newPoints.estimated_generation_gwh_2015,
          newPoints.estimated_generation_gwh_2016,
          newPoints.estimated_generation_gwh_2017,
        ],
        // backgroundColor: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.2)`,
        backgroundColor: `#f7f7f7`,
        
        // borderColor: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 1)`,
        borderColor: lineColor,
        borderWidth: 2.5,
        borderDash: dashLineSettings[Math.floor(Math.random() * dashLineSettings.length)]

      }]
    };
    console.log(lineColor);

    myChart.data.labels = newData.labels;
    myChart.data.datasets.push(newData.datasets[0]);
    myChart.update();

    updateHalos();
  }


  
  // Function to get the maximum value among all existing datasets
  function getMaxExistingDataValue() {
    var maxExistingValue = 0;
  
    myChart.data.datasets.forEach(function (dataset) {
      var maxDatasetValue = Math.max.apply(null, dataset.data);
      if (maxDatasetValue > maxExistingValue) {
        maxExistingValue = maxDatasetValue;
      }
    });
  
    return maxExistingValue;
  }

  // Clear the chart
  function clearChart() {
    selectedPoints = [];
    myChart.data.labels = [];
    myChart.data.datasets = [];
    myChart.update();
    updateHalos();
  }


/*
    range slider
*/

function getGen(estimated_generation_gwh_2017){
    var gen = parseFloat(estimated_generation_gwh_2017);
    // if the data is null or something, set default value: 0
    if (isNaN(gen)) {
        gen = 0;
    }
    return gen;
}

let minV = 0.0;
let maxV = 38889.0;

 // Function to update marker styles based on a value range
 const updateMarkers = (minValue, maxValue) => {
    minV = minValue;
    maxV = maxValue;
    // points.forEach(function (point) {
    points.forEach(point => {
        console.log(minV, maxV);
        console.log(selectedFuelTypes);

        logSelectedCountries();

    //     var currentOpacity = point.circleMarker.options.fillOpacity;
    //     var gen = getGen(point.estimated_generation_gwh_2017);
    //     var markerColor = point.circleMarker.options.color;

    //   // Set marker styles based on whether the value is within the specified range
    //   if (gen >= minValue && gen <= maxValue && currentOpacity !== 0.0 ) {
        var gen = getGen(point.estimated_generation_gwh_2017);
        var markerColor = point.circleMarker.options.color;

      if (gen >= minV && gen <= maxV && selectedFuelTypes.has(point.primary_fuel_processed) && selectedCountries.indexOf(point.country) !== -1  ){
        if(markerColor !== "gray"){
            point.circleMarker.setStyle({ opacity: nodeFullOpacity, fillOpacity: nodeFullOpacity });
            // point.circleMarker.setRadius();
            var zoomLevel = map.getZoom();
            var pointRadius = point.originalRadius + Math.pow(2, zoomLevel - 4)*0.8 -0.8;
            point.circleMarker.setRadius(pointRadius); 
        }

      } else {
        if(markerColor !== "gray"){
            point.circleMarker.setStyle({ opacity: nodeNullOpacity, fillOpacity: nodeNullOpacity });
            point.circleMarker.setRadius(nodeNullRadius);
        }
        }
    });
    edges.forEach( edge =>{
        // var gen1 = getGen(edge.source.estimated_generation_gwh_2017);
        // var gen2 = getGen(edge.target.estimated_generation_gwh_2017);
        var opa1 = edge.source.circleMarker.options.fillOpacity;
        var opa2 = edge.target.circleMarker.options.fillOpacity;

        // if( (gen1 >= minValue && gen1 <= maxValue) && (gen2 >= minValue && gen2 <= maxValue) ){
        if( (opa1 == nodeFullOpacity) && (opa2 == nodeFullOpacity ) ){
            edge.polyline.setStyle({ opacity: lineFullOpacity ,});
        }
        else{
            edge.polyline.setStyle({ opacity: lineNullOpacity ,});
        }
    })
  };




/*
  filtering according to the fuel type
 */
document.addEventListener('DOMContentLoaded', function() {

    console.log(minV, maxV);
    console.log(selectedFuelTypes);
    logSelectedCountries();

    const legendItems = document.querySelectorAll('.legend-item');
    
    legendItems.forEach(function(item) {
        const fuelType = item.dataset.fuel; // Get the fuel type from data-fuel attribute
        selectedFuelTypes.add(fuelType); // Initially, all types are selected
        
        item.addEventListener('click', function() {
            this.classList.toggle('selected');

            if (selectedFuelTypes.has(fuelType)) {
                selectedFuelTypes.delete(fuelType); // If already selected, deselect it
            } else {
                selectedFuelTypes.add(fuelType); // If not selected, select it
            }
            console.log(Array.from(selectedFuelTypes).join(', ') + " are selected."); // Log selected fuel types
            
            // for each node and edge, fliter
            points.forEach(point => {
                var gen = getGen(point.estimated_generation_gwh_2017);
                var markerColor = point.circleMarker.options.color;
        
              if (gen >= minV && gen <= maxV && selectedFuelTypes.has(point.primary_fuel_processed) && selectedCountries.indexOf(point.country) !== -1  ){
                // var currentOpacity = point.circleMarker.options.fillOpacity;
                // var markerColor = point.circleMarker.options.color;

                // if (selectedFuelTypes.has(point.primary_fuel_processed) && currentOpacity !== 0.0 ){
                    if( markerColor !== "gray"){
                    point.circleMarker.setStyle({ opacity: nodeFullOpacity, fillOpacity: nodeFullOpacity });
                    var zoomLevel = map.getZoom();
                    var pointRadius = point.originalRadius + Math.pow(2, zoomLevel - 4)*0.8 -0.8;
                    point.circleMarker.setRadius(pointRadius); 
                }}
               else {
                if( markerColor !== "gray"){
                    point.circleMarker.setStyle({ opacity: nodeNullOpacity, fillOpacity: nodeNullOpacity });
                    point.circleMarker.setRadius(nodeNullRadius);
                }}
            });
            edges.forEach( edge =>{
                // if( selectedFuelTypes.has(edge.source.primary_fuel) && selectedFuelTypes.has(edge.target.primary_fuel) ){
                //     edge.polyline.setStyle({ opacity: lineFullOpacity ,});
                // }
                // else{
                //     edge.polyline.setStyle({ opacity: lineNullOpacity ,});
                // }
                var opa1 = edge.source.circleMarker.options.fillOpacity;
                var opa2 = edge.target.circleMarker.options.fillOpacity;
        
                if( (opa1 == nodeFullOpacity) && (opa2 == nodeFullOpacity ) ){
                    edge.polyline.setStyle({ opacity: lineFullOpacity ,});
                }
                else{
                    edge.polyline.setStyle({ opacity: lineNullOpacity ,});
                }
            })

        });
    });
});



// In the old version, there will left some edges without two ends
// const updateMarkers = (minValue, maxValue) => {
//     // points.forEach(function (point) {
//     points.forEach(point => {
//         var gen = parseFloat(point.estimated_generation_gwh_2017);
//         // var currentOpacity = point.circleMarker.options.fillOpacity;
//         var markerColor = point.circleMarker.options.color;
//         var pointId = point.node;

//         // if the data is null or something, set default value: 0
//         if (isNaN(gen)) {
//             gen = 0;
//         }

//       // Set marker styles based on whether the value is within the specified range
//       if (gen >= minValue && gen <= maxValue) {
//         if(markerColor !== "gray"){
//             point.circleMarker.setStyle({ opacity: 1, fillOpacity: 1 });
//             changeEdgeOpacity(pointId, lineFullOpacity);
//         }

//       } else {
//         if(markerColor !== "gray"){
//             point.circleMarker.setStyle({ opacity: 0.0, fillOpacity: 0.0 });
//             changeEdgeOpacity(pointId, 0.0);
//         }
//         }
//     });
//   };

// function changeEdgeOpacity(pointId, toOpacity){
//   var processedNodes = {};  
//   edges.forEach(function (edge) {
//     if (edge.source.node == pointId) {
//         if (processedNodes[edge.target.node]) {
//             edge.polyline.setStyle({ opacity: 0.0 });
//         } else {
//             edge.polyline.setStyle({ opacity: toOpacity });
//             processedNodes[edge.target.node] = true;  
//         }
//     } else if (edge.target.node == pointId) {
//         if (processedNodes[edge.source.node]) {
//             edge.polyline.setStyle({ opacity: 0.0 ,});
//         } else {
//             edge.polyline.setStyle({ opacity: toOpacity });
//             processedNodes[edge.source.node] = true;  
//         }
//     }
//   });
// }
  

var formatSlider = document.getElementById('formatting-slider');

noUiSlider.create(formatSlider, {
    // Values are parsed as numbers using the "from" function in "format"
    start: ['20.0', '80.0'],
    connect: true,

    range: {
        'min': 0,
        'max': 38889
    },
    format: formatForSlider,
    tooltips: {
        // tooltips are output only, so only a "to" is needed
        to: function(numericValue) {
            return numericValue.toFixed(1);
        }
    }
});

// Values are parsed as numbers using the "from" function in "format"
formatSlider.noUiSlider.set(['0', '38889']);

var forValues = document.getElementById("forValues");
// forValues.innerHTML = "Shows power plants in range: (GWh) ";
forValues.innerHTML = "Generation in range: (GWh)";

// var marginMin = document.getElementById('slider-margin-value-min'),
//     marginMax = document.getElementById('slider-margin-value-max');

// formatSlider.noUiSlider.on('update', function (values, handle) {
//     if (handle) {
//         marginMax.innerHTML = values[handle];
//     } else {
//         marginMin.innerHTML = values[handle];
//     }

//     updateMarkers(parseInt(marginMin.innerHTML), parseInt(marginMax.innerHTML));
// });

var marginMin = 0.00,
    marginMax = 38889.00;

formatSlider.noUiSlider.on('update', function (values, handle) {
    if (handle) {
        marginMax = values[handle];
    } else {
        marginMin = values[handle];
    }

    updateMarkers(parseInt(marginMin), parseInt(marginMax));
});

var formatForSlider = {
    from: function (formattedValue) {
        return Number(formattedValue);
    },
    to: function(numericValue) {
        return Math.round(numericValue);
    }
};
  
/*
    show details information
*/
  //    // show infoContainer initally
//    document.addEventListener("DOMContentLoaded", function() {
//     document.getElementById('infoContainer').style.display = 'block';
// });

// show infoContainer bydefault
document.getElementById('search-container').style.display = 'none';
document.getElementById('chartContainer').style.display = 'none';

function showDiv(divId) {
    // hide all div
    document.getElementById('infoContainer').style.display = 'none';
    document.getElementById('search-container').style.display = 'none';
    document.getElementById('chartContainer').style.display = 'none';

    // show the div
    document.getElementById(divId).style.display = 'block';
}


 // I want the node in the front, but failed, this ,or bringToBack, or setZIndex(10), all of them do not work 
//  pointLayer.bringToFront();
//  edgeLayer.bringToBack();

// var selectedCountries = ["Albania", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria", 
// "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", 
// "Iceland", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Moldova", "Montenegro", "Netherlands", 
// "Norway", "Poland", "Portugal", "Romania", "Russia", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", 
// "Switzerland", "Ukraine", "United Kingdom"
// ];

var selectedCountries = [];

function logSelectedCountries() {
    console.log("Selected countries: " + selectedCountries.join(", "));
}

var countryFuelData = {}; // Store each country's fuel breakdown
// A chart shows the summary of countries
$(document).ready(function() {

    selectedCountries = [];
    function updateSelectedCountries(country, checked) {
        // selectedCountries = [];
        if (checked) {
            selectedCountries.push(country);
        } else {
            var index = selectedCountries.indexOf(country);
            if (index !== -1) {
                selectedCountries.splice(index, 1);
            }
        }

        console.log(minV, maxV);
        console.log(selectedFuelTypes);
        logSelectedCountries();


        // when have  alist of selected countries, flitering nodes and edges
        points.forEach(point => {
            var gen = getGen(point.estimated_generation_gwh_2017);
    
          if (gen >= minV && gen <= maxV && selectedFuelTypes.has(point.primary_fuel_processed) && selectedCountries.indexOf(point.country) !== -1  ){
        //   if (selectedCountries.indexOf(point.country) !== -1 ) {
                point.circleMarker.setStyle({ opacity: nodeFullOpacity, fillOpacity: nodeFullOpacity });
          } else {
                point.circleMarker.setStyle({ opacity: 0.0, fillOpacity: 0.0 });
                point.circleMarker.setRadius(nodeNullRadius);
            }
        });
        edges.forEach( edge =>{
            // if( selectedCountries.indexOf(edge.source.country) !== -1 && selectedCountries.indexOf(edge.target.country) !== -1){
            //     edge.polyline.setStyle({ opacity: lineFullOpacity ,});
            // }
            // else{
            //     edge.polyline.setStyle({ opacity: lineNullOpacity ,});
            // }
            var opa1 = edge.source.circleMarker.options.fillOpacity;
            var opa2 = edge.target.circleMarker.options.fillOpacity;
    
            if( (opa1 == nodeFullOpacity) && (opa2 == nodeFullOpacity ) ){
                edge.polyline.setStyle({ opacity: lineFullOpacity ,});
            }
            else{
                edge.polyline.setStyle({ opacity: lineNullOpacity ,});
            }
        })
      };




    // Load CSV data
    $.ajax({
        url: 'global_country_fuel_summary.csv',
        dataType: 'text',
        success: function(data) {
            var countries = [];
            var lines = data.split('\n');
            $.each(lines, function(index, line) {
                var values = line.split(',');
                var country = values[0];
                var fuelType = values[1];
                var generation = parseFloat(values[2]).toFixed(2); // Format to two decimal places
                if (!countries.find(c => c.country === country)) {
                    countries.push({
                        'country': country,
                        'generation': generation
                    });
                } else {
                    var existingCountry = countries.find(c => c.country === country);
                    existingCountry.generation = (parseFloat(existingCountry.generation) + parseFloat(generation)).toFixed(2);
                }
            });

            // Populate table
            // Populate table
            var tbody = $('#countryTable tbody');
            $.each(countries, function(index, data) {
                // 1️⃣ Create checkbox
                var checkbox = $('<input type="checkbox" checked>');
                checkbox.on('change', function() {
                    updateSelectedCountries(data.country, this.checked);
                });

                // 2️⃣ Create table row
                var row = $('<tr>');
                row.append($('<td>').text(data.country));
                row.append($('<td>').append(checkbox));
                row.append($('<td>').text(data.generation));

                // 3️⃣ Add Show Summary button for this row
                var summaryButton = $('<button>Show Summary</button>');
                summaryButton.on('click', function() {
                    showCountrySummary(data.country); // open overlay
                    console.log(data.country);
                });
                row.append($('<td>').append(summaryButton));

                // 4️⃣ Append row to table
                tbody.append(row);
            });

            // Sort by country
            $('#sortCountry').on('click', function() {
                var rows = tbody.find('tr').get();
                rows.sort(function(a, b) {
                    var aValue = $(a).find('td').eq(0).text();
                    var bValue = $(b).find('td').eq(0).text();
                    return aValue.localeCompare(bValue);
                });
                $.each(rows, function(index, row) {
                    tbody.append(row);
                });
                updateSortArrow($('#sortCountry'));
            });

            // Sort by generation
            $('#sortGeneration').on('click', function() {
                var rows = tbody.find('tr').get();
                rows.sort(function(a, b) {
                    var aValue = parseFloat($(a).find('td').eq(2).text());
                    var bValue = parseFloat($(b).find('td').eq(2).text());
                    return bValue - aValue;
                });
                $.each(rows, function(index, row) {
                    tbody.append(row);
                });
                updateSortArrow($('#sortGeneration'));
            });
            
            // Select all checkboxes
            $('#selectAll').on('click', function() {
                $('#countryTable input[type="checkbox"]:not(:checked)').prop('checked', true).trigger('change');
            });
            
            // Deselect all checkboxes
            $('#deselectAll').on('click', function() {
                selectedCountries = []; // Clear the selectedCountries array
                $('#countryTable input[type="checkbox"]').prop('checked', false).trigger('change');
            });
            
            // Initial log of selected countries
            $('#countryTable input[type="checkbox"]').each(function() {
                selectedCountries.push($(this).closest('tr').find('td:first-child').text());
            });
            logSelectedCountries();
        }
    });
});

function updateSortArrow(header) {
    // Remove arrow from all headers
    $('#countryTable th').find('.sort-arrow').html('');
    
    // Add arrow to the clicked header
    var arrow = $('<span>').addClass('arrow');
    if (header.hasClass('asc')) {
        arrow.html('&#9650;'); // Upward arrow
    } else {
        arrow.html('&#9660;'); // Downward arrow
    }
    header.find('.sort-arrow').html(arrow);
}


document.addEventListener("DOMContentLoaded", function() {
    var buttons = document.querySelectorAll(".button");
    
    buttons.forEach(function(button) {
        button.addEventListener("click", function() {
            buttons.forEach(function(btn) {
                btn.classList.remove("blue");
            });
            button.classList.add("blue");
        });
    });
});


function updateHalos(){
    console.log("halo");
    haloLayer.eachLayer(function (layer) {
        // console.log(layer.nodeId,layer);
        if(selectedPoints.includes(layer.nodeId)){
            layer.setStyle({ opacity: 1 });
            console.log(layer.nodeId);

        }
        else
            layer.setStyle({ opacity: 0 });

    });
}



// it does not work... need to update it

function showCountrySummary(country) {
    if (!countryFuelData[country]) return;

    // Create overlay
    var overlay = $('<div class="country-summary-overlay"></div>');

    // Create inner panel
    var panel = $('<div class="country-summary-panel"></div>');

    // Close button
    var closeBtn = $('<span class="close-btn">×</span>');
    closeBtn.on('click', function() { overlay.remove(); });
    panel.append(closeBtn);

    // Add title
    panel.append('<h2>' + country + '</h2>');

    // Create canvas for chart
    var canvas = $('<canvas></canvas>').css({ width: '100%', height: '300px' });
    panel.append(canvas);

    overlay.append(panel);
    $('body').append(overlay);

    // Prepare chart data
    var fuels = Object.keys(countryFuelData[country]);
    var values = fuels.map(f => countryFuelData[country][f]);

    new Chart(canvas[0].getContext('2d'), {
        type: 'bar',
        data: {
            labels: fuels,
            datasets: [{
                label: 'Generation (GWh)',
                data: values,
                backgroundColor: fuels.map(f => getColor(f))
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { title: { display: true, text: 'GWh' } } }
        }
    });
}