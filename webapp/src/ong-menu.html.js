import { invalidateLogin, loggedIn } from './logic/login';
import { pullMapData } from './logic/backend';

async function populateTable() {
    let table = document.getElementById("points-table");

    if(table) {
        let data = await pullMapData();

        for(let entry of data) {

        }
    }
}

populateTable();