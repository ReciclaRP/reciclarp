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

function createMap(element, latitude, longitude, zoom = 13) {
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

    return map;
}

createMap(
    document.querySelector('#map'),
    -23.5505,
    -46.6333
);

console.log(await pullMapData());