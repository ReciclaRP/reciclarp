import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

async function pullMapData() {
    let res = await fetch(
        `http://localhost:3000/point/list`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            
            body: JSON.stringify({
                data: "test"
            })
        }
    )

    return await res.json();
}

function openPointPopup(point, x, y) {
    let popup = document.getElementById("location-popup");
    let acceptedkinds = "";

    if(point.accepts_biological == 1) {
        acceptedkinds += "biológicos"
    }

    if(point.accepts_metal == 1) {
        if(acceptedkinds != "") {
            acceptedkinds += ", ";
        }
        acceptedkinds += "metal";
    }

    if(point.accepts_organic == 1) {
        if(acceptedkinds != "") {
            acceptedkinds += ", ";
        }
        acceptedkinds += "orgânicos";
    }

    if(point.accepts_paper == 1) {
        if(acceptedkinds != "") {
            acceptedkinds += ", ";
        }
        acceptedkinds += "papel";
    }

    acceptedkinds += ".";

    popup.innerHTML = `
    <div class="popup-content">
        <div class="popup-nametime">
            <div>
                <h3>Ponto nº ${point.pid}</h3>
            </div>

            <div>
                ●
            </div>

            <div>
                <p>${point.time_open} - ${point.time_close}</p>
            </div>

            <div>
                <p>Aberto</p>
            </div>
        </div>

        <div class="popup-address">
            <p>${point.pointdescription}</p>
        </div>

        <div class="popup-kinds">
            <p>Ponto de reciclagem de: <span id="popup-kid-list">${acceptedkinds}</span></p>
        </div>

        <div class="button-options">
            <div>
                <a href="https://maps.google.com/?q=${point.lati},${point.long}" class="maps-open-button">Abrir no Maps</a>
            </div>

            <div>
                <a href="#">Reportar Problema</a>
            </div>

            <div>
                <a href="#">Sugerir edição</a>
            </div>
        </div>
    </div>`;

    popup.style.display = "block";
    popup.style.left = x+'px';
    popup.style.top = y+'px';
}

async function markerClicked(e) {
    let data = await pullMapData();

    for(let point of data) {
        if(point.lati == e.latlng.lat && point.long == e.latlng.lng) {
            console.log(point)
            openPointPopup(point, e.containerPoint.x, e.containerPoint.y);
        }
    }
}

async function putMapMarkers(map, clickedfunction) {
    let data = await pullMapData();

    for(let point of data) {
        L.marker([point.lati, point.long])
            .addTo(map)
            .on(
                'click', 
                clickedfunction
            );
    }
}

async function createMap(element, latitude, longitude, zoom = 13) {
    const map = L.map(element).setView(
        [latitude, longitude],
        zoom
    );

    L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }
    ).addTo(map);

    await putMapMarkers(map, markerClicked);

    return map;
}

await createMap(
    document.querySelector('#map'),
    -21.1684, 
    -47.8109
);

console.log(await pullMapData());