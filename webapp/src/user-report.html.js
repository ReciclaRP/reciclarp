import { pullMapData, createReport } from './logic/backend';
import { invalidateLogin, loggedIn } from './logic/login';
import { descriptionFromPointTypes } from './logic/misc';

async function setPointVisualDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const target_pid = urlParams.get('pid');
    const data = await pullMapData();

    if(target_pid && data) {
        let target_point = null;

        for(let point of data) {
            if(point.pid == target_pid) {
                target_point = point;
            }
        }

        if(target_point) {
            const id = document.getElementById("pnum");
            const description = document.getElementById("raddr");
            const time_open = document.getElementById("tfrom");
            const time_close = document.getElementById("tto");
            const item_names = document.getElementById("itemnames");
        
            id.innerHTML = target_point.pid;
            description.innerHTML = target_point.pointdescription;
            time_open.innerHTML = target_point.time_open;
            time_close.innerHTML = target_point.time_close;

            item_names.innerHTML = descriptionFromPointTypes(target_point);
        
            return true;
        }
    }

    return false;
}

async function reportPoint() {
    const report_textbox = document.getElementById("report-textbox")
    const textbox_data = report_textbox.value;

    const select_problemas = document.getElementById("select-problemas");
    const select_value = select_problemas.value;

    const target_pid = urlParams.get('pid');

    const udata = await loggedIn();

    if(udata) {
        if(textbox_data && select_value) {
            createReport(
                udata.email, 
                udata.token, 
                target_pid, 
                {
                    description: textbox_data,
                    problem_kind: select_value
                }
            );

            console.log("report created!") // TODO
        }
    } else {
        invalidateLogin();
    }
}

await setPointVisualDetails();

document.getElementById("report-button").addEventListener("click", () => {
    reportPoint();
});