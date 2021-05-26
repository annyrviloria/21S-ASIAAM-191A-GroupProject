const map = L.map('map').setView([32.63188332081661, -115.4562838930214], 6
        );
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

function addMarker(data){
        // console.log(data)
        L.marker([data.lat,data.lng]).addTo(map).bindPopup(`<h2>${"Location: " + data.inwhatcityortowndidtheincidenthappen}</h2>${data.timestamp}<br>${"Gender: " + data.whatgenderdoyouidentifywith}<br> ${"Age: " + data.howoldareyou}`)
        return data.timestamp
}

let url = "https://spreadsheets.google.com/feeds/list/1gB_pIq1Y0WGMzJjC8qPA5oGT6sDAfkhZLL_ag1GL3j8/oiz5byp/public/values?alt=json"
fetch(url)
	.then(response => {
		return response.json();
		})
    .then(data =>{
                // console.log(data)
                formatData(data)
        }
)


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