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
                // console.log(data)
                formatData(data)
        }
)

// map shows reports divded between events reported to any authorites and events not reported at all
let newReport = L.featureGroup();
let otherReport = L.featureGroup();

const boundaryLayer ="./data/map.geojson"
let boundary;
let ptsWithin;
let collected;
let boundaryGeo;
let allPoints = [];
function onEachFeature(feature, layer) {
    // console.log(feature.properties)

    if (feature.properties.values) {
        let count = feature.properties.values.length
        console.log(count)
        let text = count.toString()
        
        layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight
                // click: layer.bindPopup(text)
            });
            ;
    }
}

function getStyles(data){
        // console.log(data)
        let myStyle = {
            "color": "#ff7800",
            "weight": 1,
            "opacity": .0,
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
                        if (feature.properties.values.length > 0) {
                            return {color: "#ff0000",stroke: false};
                        }
                        else{
                            // make the polygon gray and blend in with basemap if it doesn't have any values
                            return{opacity:0,color: "#efefef" };
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
                newReport.addLayer(L.circleMarker([data.lat,data.lng]))

        }
        else{
                //
                countOtherReports += 1
                reportType = "other"
                otherReport.addLayer(L.circleMarker([data.lat,data.lng]))

        }
        let thisMarker = {
                "lat":data.lat,
                "lng":data.lng,
                "report":reportType,
                "timestamp":data.timestamp,
                
        }
        let theTime = data.timestamp
        // create the turfJS point
        let thisPoint = turf.point([Number(data.lng),Number(data.lat)],{reportType,theTime})
        // put all the turfJS points into `allPoints`
        allPoints.push(thisPoint)
}

// refer to this: https://github.com/rachan2023/21S-191A-Against-Asian-Hate/blob/main/Final%20project/js/init.js

function createButtons(data){
        const newButton = document.createElement("button"); // adds a new button
        newButton.id = "button"+title; // gives the button a unique id
        newButton.innerHTML = `<h2>${data.reportedtowho}</h2>`; // gives the button a title
        newButton.setAttribute("typeOfReport",data.reportedtowho); // sets the latitude 
        newButton.setAttribute("lat",data.lat); // sets the latitude 
        newButton.setAttribute("lng",data.lng); // sets the longitude 
        newButton.addEventListener('click', function(){
            map.flyTo([data.lat,data.lng],10); //this is the flyTo from Leaflet
        })
        const SpaceForButtons = document.getElementById('box1')
        SpaceForButtons.appendChild(newButton); //this adds the button to our page.
      }

function createButtons2(lat,lng,title){
        const newButton2 = document.createElement("button"); // adds a new button
        newButton2.id = "button"+title; // gives the button a unique id
        newButton2.innerHTML = title; // gives the button a title
        newButton2.setAttribute("lat",lat); // sets the latitude 
        newButton2.setAttribute("lng",lng); // sets the longitude 
        newButton2.addEventListener('click', function(){
                map.flyTo([lat,lng],10); //this is the flyTo from Leaflet
        })
        const SpaceForButtons = document.getElementById('box2')
        SpaceForButtons.appendChild(newButton2); //this adds the button to our page.
        }

function createButtons3(lat,lng,title){
const newButton3 = document.createElement("button"); // adds a new button
newButton3.id = "button"+title; // gives the button a unique id
newButton3.innerHTML = title; // gives the button a title
newButton3.setAttribute("lat",lat); // sets the latitude 
newButton3.setAttribute("lng",lng); // sets the longitude 
newButton3.addEventListener('click', function(){
        map.flyTo([lat,lng],10); //this is the flyTo from Leaflet
})
const SpaceForButtons = document.getElementById('box3')
SpaceForButtons.appendChild(newButton3); //this adds the button to our page.
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

let layers = {
	"Events <strong>not reported</strong> to the authorities": newReport,
	"Events reported to an authority": otherReport
}

//L.control.layers(null,layers,{collapsed:false}).addTo(map)

collected.features.properties.values

/////////////////// UI STUFF

var info = L.control();
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};
info.addTo(map);
// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>US Population Density</h4>' +  (props ?
        '<b></b><br /> people / mi<sup>2</sup>'
        : 'Hover over a state');
};



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
    console.log(boundaryValues)
    let stateName = boundaryValues.NAME//

    
    let count = boundaryValues.values.length
    console.log('count')
    
    target.innerHTML = `<h2>State: ${boundaryValues.NAME}</h2><h3>${count}</h3>`
}