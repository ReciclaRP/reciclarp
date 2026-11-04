import { invalidateLogin, loggedIn } from './logic/login';
import { descriptionFromPointTypes } from './logic/misc';
import { pullMapData } from './logic/backend';

async function populateTable() {
    let table = document.getElementById("points-table");

    if(table) {
        let data = await pullMapData();

        for(let entry of data) {
            let row = document.createElement("tr");

            row.innerHTML = `
                <td>${entry.pid}</td>
                <td>${entry.pointdescription}</td>
                <td>${entry.time_open}</td>
                <td>${entry.time_close}</td>
                <td>${descriptionFromPointTypes(entry)}</td>
                <td>${entry.lati}</td>
                <td>${entry.long}</td>
                <td>USERNAME_HERE</td>
                <td>${entry.approved}</td>
            `

            table.append(row);
        }
    }
}

populateTable();