import { pullMapData } from './logic/backend';
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

function reportPoint() {
    const report_textbox = document.getElementById("report-textbox")
    const textbox_data = report_textbox.value;

    const select_problemas = document.getElementById("select-problemas");
    const select_value = select_problemas.value;

    if(textbox_data && select_value) {
        
    }
}

await setPointVisualDetails();

document.getElementById("report-button").addEventListener("click", () => {
    //TODO
});