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

async function putMapMarkers(map) {
    let data = await pullMapData();

    for(let point of data) {
        L.marker([point.lati, point.long]).addTo(map);
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

    await putMapMarkers(map);

    return map;
}

await createMap(
    document.querySelector('#map'),
    -21.1684, 
    -47.8109
);

console.log(await pullMapData());