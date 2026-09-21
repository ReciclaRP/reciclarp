import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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