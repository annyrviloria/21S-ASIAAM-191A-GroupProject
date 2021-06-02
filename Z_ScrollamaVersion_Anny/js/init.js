const map = L.map('map').setView([34.0709, -118.444], 5);

const url = "https://spreadsheets.google.com/feeds/list/1RlYgkgQCWUYNnwwPTRN4qrrIzkZ_fv6zJYtOFoK-9f4/ocya9of/public/values?alt=json"

// create a new global scoped variable called 'scroller'
// you can think of this like the "map" with leaflet (i.e. const map = L.map('map'))
let scroller = scrollama();

let OSMBaseMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

OSMBaseMap.addTo(map)

fetch(url)
	.then(response => {
		return response.json();
		})
    .then(data =>{
                // console.log(data)
                formatData(data)
        }
)

let selfReport = L.featureGroup();
let advocateReport = L.featureGroup();

let exampleOptions = {
    radius: 4,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
}

function addMarker(data){
    if(data.reporter == "I am reporting an incident that happened to me."){
        exampleOptions.fillColor = "green"
        selfReport.addLayer(L.circleMarker([data.lat,data.lng],exampleOptions).bindPopup(`<h2>${"Location: " + data.cityortown}</h2>${data.timestamp}<br>${"Gender: " + data.gender}<br> ${"Age: " + data.age}`))
        createButtons(data.lat,data.lng,data.cityortown)
        }
    else{
        exampleOptions.fillColor = "red"
        advocateReport.addLayer(L.circleMarker([data.lat,data.lng],exampleOptions).bindPopup(`<h2>${"Location: " + data.cityortown}</h2>${data.timestamp}<br>${"Gender: " + data.gender}<br> ${"Age: " + data.age}`))
        createButtons(data.lat,data.lng,data.cityortown)
    }
    return data.timestamp
}

function createButtons(lat,lng,title){
    const newButton = document.createElement("button");
    newButton.id = "button"+title;
    newButton.innerHTML = title;
    newButton.setAttribute("class","step") // add the class called "step" to the button or div
    newButton.setAttribute("data-step",newButton.id) // add a data-step for the button id to know which step we are on
    newButton.setAttribute("lat",lat); 
    newButton.setAttribute("lng",lng);
    newButton.addEventListener('click', function(){
        map.flyTo([lat,lng]);
    })
    const spaceForButtons = document.getElementById('contents')
    spaceForButtons.appendChild(newButton);
}

function formatData(theData){
        const formattedData = []
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
        formattedData.forEach(addMarker)
        selfReport.addTo(map)
        advocateReport.addTo(map)
        let allLayers = L.featureGroup([selfReport,advocateReport]);
        map.fitBounds(allLayers.getBounds());
        // setup the instance, pass callback functions
        // use the scrollama scroller variable to set it up
        scroller
        .setup({
            step: ".step", // this is the name of the class that we are using to step into, it is called "step", not very original
        })
        // do something when you enter a "step":
        .onStepEnter((response) => {
            // you can access these objects: { element, index, direction }
            // use the function to use element attributes of the button 
            // it contains the lat/lng: 
            scrollStepper(response.element.attributes)
        })
        .onStepExit((response) => {
            // { element, index, direction }
            // left this in case you want something to happen when someone
            // steps out of a div to know what story they are on.
        });
        
}
function scrollStepper(thisStep){
    // optional: console log the step data attributes:
    // console.log("you are in thisStep: "+thisStep)
    let thisLat = thisStep.lat.value
    let thisLng = thisStep.lng.value
    // tell the map to fly to this step's lat/lng pair:
    map.flyTo([thisLat,thisLng])
}

let layers = {
	"Reported by self": selfReport,
	"Reported by a legal advocate": advocateReport
}

L.control.layers(null,layers).addTo(map)

// setup resize event for scrollama incase someone wants to resize the page...
window.addEventListener("resize", scroller.resize);
