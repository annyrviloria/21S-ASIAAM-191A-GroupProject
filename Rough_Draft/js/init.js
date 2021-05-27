const map = L.map('map').setView([32.63188332081661, -115.4562838930214], 6
        );
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

function addMarker(data){
        // console.log(data)
        L.marker([data.lat,data.lng]).addTo(map).bindPopup(`<h2>${"Location: " + data.cityortown}</h2>${data.timestamp}<br>${"Gender: " + data.gender}<br> ${"Age: " + data.age}`)
        createButtons(data.lat,data.lng,data.event)
        createButtons2(data.lat,data.lng,data.authoritiesresponse)
        createButtons3(data.lat,data.lng,data.resources)
        return data.timestamp
}

let url = "https://spreadsheets.google.com/feeds/list/1RlYgkgQCWUYNnwwPTRN4qrrIzkZ_fv6zJYtOFoK-9f4/ocya9of/public/values?alt=json"
fetch(url)
	.then(response => {
		return response.json();
		})
    .then(data =>{
                // console.log(data)
                formatData(data)
        }
)

function createButtons(lat,lng,title){
        const newButton = document.createElement("button"); // adds a new button
        newButton.id = "button"+title; // gives the button a unique id
        newButton.innerHTML = title; // gives the button a title
        newButton.setAttribute("lat",lat); // sets the latitude 
        newButton.setAttribute("lng",lng); // sets the longitude 
        newButton.addEventListener('click', function(){
            map.flyTo([lat,lng],10); //this is the flyTo from Leaflet
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
        formattedData.forEach(addMarker)        
}