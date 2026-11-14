import { invalidateLogin, loggedIn } from './logic/login';
import { descriptionFromPointTypes } from './logic/misc';
import { pullMapData, deletePoint, approvePoint, getPointAccesses } from './logic/backend';
import { Chart, registerables } from "chart.js";
async function queryActions() {
    const urlParams = new URLSearchParams(window.location.search);
    const deleteaction = urlParams.get('deletepid');
    const approveaction =  urlParams.get('approvepid');
    const stataction =  urlParams.get('statpid');

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

    if(approveaction) {
        let udata = await loggedIn();

        if(udata) {
            let okay = window.confirm("Tem certeza? Após a aprovação, este ponto ficará visível para todos os usuários!");

            if(okay) {
                await approvePoint(udata.email, udata.token, approveaction);
                window.location.href = "/ong-menu.html";
            }
        } else {
            invalidateLogin();
        }
    }

    if(stataction) {
        let udata = await loggedIn();

        if(udata) {
            let accesses = await getPointAccesses(udata.email, udata.token, stataction, 100);
            console.log(accesses);
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
            `
            let options_available = document.createElement("td");
            
            let delete_link = document.createElement("a");
            delete_link.textContent = "Deletar";
            delete_link.href = `/ong-menu.html?deletepid=${entry.pid}`;

            options_available.append(delete_link);

            if(!entry.approved) {
                row.style.backgroundColor = "yellow";

                let approve_link = document.createElement("a");
                approve_link.textContent = "Aprovar";
                approve_link.href = `/ong-menu.html?approvepid=${entry.pid}`;
            
                options_available.append(approve_link);
            }

            if(entry.approved) {
                let stats_link = document.createElement("a");
                stats_link.textContent = "Estatísticas";
                stats_link.href = `/ong-menu.html?statpid=${entry.pid}`;

                options_available.append(stats_link);
            }

            row.append(options_available);

            table.append(row);
        }
    }
}

await populateTable();
await queryActions();

const ctx = document.getElementById('statsChart');

Chart.register(...registerables);
new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1
        }]
    },
    options: {
        scales: {
        y: {
            beginAtZero: true
        }
        }
    }
});