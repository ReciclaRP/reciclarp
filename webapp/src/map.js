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

function openPointPopup(point) {
    let popup = document.getElementById("location-popup");
    popup.innerHTML = `
    <div class="popup-content">
        <div class="popup-nametime">
            <div>
                <h3>Ponto nº XX</h3>
            </div>

            <div>
                ●
            </div>

            <div>
                <p>9:00 - 17:00</p>
            </div>

            <div>
                <p>Aberto</p>
            </div>
            </div>

            <div class="popup-address">
            <p>R. Alberto de Oliveira, 1988</p>
            </div>

            <div class="popup-kinds">
            <p>Ponto de reciclagem de: <span id="popup-kid-list">papel</span>.</p>
            </div>

            <div class="button-options">
            <div>
                <a href="#" class="maps-open-button">Abrir no Maps</a>
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
}

async function markerClicked(e) {
    let data = await pullMapData();

    for(let point of data) {
        if(point.lati == e.latlng.lat && point.long == e.latlng.lng) {
            openPointPopup(point);
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