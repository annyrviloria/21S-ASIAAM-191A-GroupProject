const map = L.map('map').setView([30.63188332081661, -107.4562838930214], 4);

const url = "https://spreadsheets.google.com/feeds/list/1RlYgkgQCWUYNnwwPTRN4qrrIzkZ_fv6zJYtOFoK-9f4/ocya9of/public/values?alt=json"

let Esri_WorldGrayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
});

Esri_WorldGrayCanvas.addTo(map)

fetch(url)
	.then(response => {
		return response.json();
		})
    .then(data =>{
                formatData(data)
        }
)

// map shows reports divided between events reported to any authorites and events not reported at all
let newReport = L.featureGroup();
let otherReport = L.featureGroup();

const boundaryLayer ="./data/map.geojson"
let boundary;
let ptsWithin;
let collected;
let boundaryGeo;
let allPoints = [];
function onEachFeature(feature, layer) {
    if (feature.properties.values) {
        let count = feature.properties.values.length
        console.log(count)
        console.log(feature.properties)
        let reportSum = count.toString() // I THINK THIS IS WHERE I NEED TO COUNT REPORTED EVENT VS NON-REPORTED EVENTS
        let clickName = feature.properties.NAME
        layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: layer.bindPopup(`<strong>State: </strong>`+clickName+`<br>`+`<strong>Number of incidents reported: </strong>`+reportSum)
            });
            ;
    }
}

function getStyles(data){
        let myStyle = {
            "color": "#ffd369",
            "weight": 1,
            "opacity": 50,
            "stroke": .5
        };
        if (data.properties.values.length > 0){
            myStyle.opacity = 0
        }
        return myStyle
    }
    
    function getBoundary(layer){
        fetch(layer)
        .then(response => {
            return response.json();
            })
        .then(data =>{
                    //set the boundary to data
                    boundary = data
                    // run the turf collect geoprocessing
                    collected = turf.collect(boundary, thePoints, 'reportType', 'values');
                    // just for fun, you can make buffers instead of the collect too:
                    // collected = turf.buffer(thePoints, 50,{units:'miles'});
                    console.log(collected.features)
    
                    // here is the geoJson of the `collected` result:
                    boundaryGeo = L.geoJson(collected,{onEachFeature: onEachFeature,style:function(feature)
                    {
                        // console.log(feature)
                        if (feature.properties.values.length > 4) {
                            return {color: "#800026",stroke: false};
                        }
                        if (feature.properties.values.length > 0) {
                                return {color: "#FEB24C",stroke: false};
                        }
                        else{
                            // make the polygon gray and blend in with basemap if it doesn't have any values
                            return{opacity:0,color: "#FFEDA0" };
                        }
                    }
                    // add the geojson to the map
                        }).addTo(map)
            }
        )   
    }
    
    console.log(boundary)

// this is for display
let countNewReports = 0
let countOtherReports = 0

// for all records in data, get unique states 
// then each state has count of all events, reported events, not reported events
// color each state based on the count of the data

function addMarker(data){
        console.log(data.whowasthisincidentreportedto)
        let reportType
        // this logic is for interactivity and the actual data
        if(data.whowasthisincidentreportedto == "I did not report this incident to any authorities"){
                //
                countNewReports += 1
                reportType = "new"
                //newReport.addLayer(L.circleMarker([data.lat,data.lng]))

        }
        else{
                //
                countOtherReports += 1
                reportType = "other"
                //otherReport.addLayer(L.circleMarker([data.lat,data.lng]))

        }
        let thisMarker = {
                "lat":data.lat,
                "lng":data.lng,
                "report":reportType,
                "timestamp":data.timestamp,
        }
        let theTime = data.timestamp
        let dirtyState = data.inwhatstatedidtheincidentyouarereportingoccur 
        let stateArray = dirtyState.split(",")
        let state = stateArray[0]
        console.log(state)
        let support = data.whatresourcesorsupportwouldhavebeenhelpfultoaddresstheincidentyouarereporting
                // data = {
                //['state']: data.inwhatstatedidtheincidentyouarereportingoccur,
                //['city']: data.inwhatcityortowndidtheincidenthappen,
                //['age']: data.howoldareyou,
                //['gender']: data.whatgenderdoyouidentifywith,
                //['story']: data.pleasedescribetheeventyoudliketoreport,
                //['lat']: data.lat,
                //['lng']: data.lng,
                //['report']: data.whowasthisincidentreportedto,
                //['authresponse']: data.ifyoureportedthisincidenthowdidtheauthoritiesrespondtothereport,
                //['support']: data.whatresourcesorsupportwouldhavebeenhelpfultoaddresstheincidentyouarereporting
        //}
        // create the turfJS point
        let thisPoint = turf.point([Number(data.lng),Number(data.lat)],{reportType,theTime, state, support})
        console.log(thisPoint)
        // put all the turfJS points into `allPoints`
        allPoints.push(thisPoint)
}

function formatData(theData){
        const formattedData = [] /* this array will eventually be populated with the contents of the spreadsheet's rows */
        const rows = theData.feed.entry
        for(const row of rows) {
          const formattedRow = {}
          for(const key in row) {
            if(key.startsWith("gsx$")) {
                  formattedRow[key.replace("gsx$", "")] = row[key].$t
            }
          }
          formattedData.push(formattedRow)
        }
        console.log(formattedData)
        console.log('boundary')
        console.log(boundary)
        formattedData.forEach(addMarker)
        console.log('countNewReports')
        console.log(countNewReports)
        console.log('countOtherReports')
        console.log(countOtherReports)
        // let firstReports = totalResults[0] //find out what this is
        // console.log('firstReports')
        // console.log(firstReports)
        // let otherReports = totalResults[1]
        newReport.addTo(map)
        otherReport.addTo(map)
        let allLayers = L.featureGroup([newReport,otherReport]);

        // step 1: turn allPoints into a turf.js featureCollection
        thePoints = turf.featureCollection(allPoints)
        console.log(thePoints)

        // step 2: run the spatial analysis
        getBoundary(boundaryLayer)
        console.log('boundary')
        console.log(boundary)
        map.fitBounds(allLayers.getBounds()); 
    }

//let layers = {
	//"Events <strong>not reported</strong> to the authorities": newReport,
	//"Events reported to an authority": otherReport
//}

//L.control.layers(null,layers,{collapsed:false}).addTo(map)

//collected.features.properties.values

///////////////////////////// UI STUFF ////////////////////////////////

// function to process the data and check if it matches the stateName passed in
function stateCheck(data,stateName) {
    //console.log("checking state name")
    //console.log(data)

    // only return data if it matches the state name
    if (stateName==data.properties.state){

        // this is how the function returns the data
        return data
    }
    
}

function highlightFeature(e) {
    var layer = e.target;
    console.log('layer')
    console.log(layer.feature.properties.values)
    let boundaryProperties = layer.feature.properties
    let divToUpdate = document.getElementById("box1")
    console.log('divToUpdate')
    console.log(divToUpdate)
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    updateContentsPanel(divToUpdate,boundaryProperties)
}
    
function resetHighlight(e) {
    boundaryGeo.resetStyle(e.target);
}

function updateContentsPanel(target,boundaryValues){
    // use console.log to see what properties can be accessed
    //console.log(boundaryValues)

    // this is the variable for holding the resulting data from the stateCheck
    let results=[]
    let stateName = boundaryValues.NAME//

    // this is the variable that temporary stores the data from stateCheck that
    // we push into the results
    let thisData;

    // loop through all the points and run the stateCheck function
    // we pass in the parameters of data and the current stateName
    allPoints.forEach(data=>results.push(thisData = stateCheck(data,stateName)))
    
    // filter out data the exist
    let filtered = results.filter(function (data) {
        return data != null;
      });

    // check to see if data is filtered
    console.log(filtered)      
    
    let count = boundaryValues.values.length
    console.log('count')
    
    // this the title HTML for the right side
    target.innerHTML = `<div id="state"><h2>State: ${boundaryValues.NAME}</h2><h3>${count}</h3></div>`
    
    // sort by descending
    let sorted = filtered.sort().reverse()

    // used the sorted data to make the map
    sorted.forEach(story=>addStory(story.properties,target))
}

// function to add the story with the target div
function addStory(story,target){
    target.innerHTML += `<div class="card"><h2>State: ${story.theTime}</h2><h3>${story.support}</h3></div>`
}


//(`<h2>${data.whatstheirbestdish}</h2>`+`<h3>Open during daytime</h3>`+`<p><b>Location:</b>${data.whereisitat}</p>`+`<p><b>Name or Description:</b>${data.doesthisspothaveanameifnothowcouldifindit}</p>`+`<p><b>How did you find it:</b>${data.howdidyoufindthisspot}</p>`)