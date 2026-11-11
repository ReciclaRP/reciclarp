import { invalidateLogin, loggedIn } from './logic/login';
import { descriptionFromPointTypes } from './logic/misc';
import { pullMapData, deletePoint } from './logic/backend';

async function queryActions() {
    const urlParams = new URLSearchParams(window.location.search);
    const deleteaction = urlParams.get('deletepid');

    if(deleteaction) {
        let udata = await loggedIn();
        if(udata) {
            let okay = window.confirm("Tem certeza? Estes dados não poderão ser recuperados!");

            if(okay) {
                await deletePoint(udata.email, udata.token, deleteaction);
                window.location.href = "/ong-menu.html";
            }
        } else {
            invalidateLogin();
        }
    }
}

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
                <td>${String(entry.lati).substring(0,8)}...</td>
                <td>${String(entry.long).substring(0,8)}...</td>
                <td>USERNAME_HERE</td>
                <td>${entry.approved}</td>
                <td><a href="/ong-menu.html?deletepid=${entry.pid}">Deletar</a></td>
            `

            table.append(row);
        }
    }
}

await populateTable();
await queryActions();