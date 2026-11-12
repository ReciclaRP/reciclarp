import { createPoint } from './logic/backend';
import { invalidateLogin, loggedIn } from './logic/login';
import { showErrorPopup } from './miscellaneous_elements/error_popup';
import { cbtob, isBackOng } from './logic/misc';

async function ongWarning() {
    let el = document.getElementById("ong-acc-warning");
    
    if(el) {
        let udata = await loggedIn();

        if(udata.data.ong) {
            el.style.display = "block";
        }
    }
}

function backButtonSet() {
    let el = document.getElementById("backbutton");

    if(el) {
        const urlParams = new URLSearchParams(window.location.search);
        const back = urlParams.get('back');

        if(back == "ong") {
            el.href = "/ong-menu.html";
        } else {
            el.href = "/menu.html";
        }
    }
}

async function formToPoint() {
    let pointdescription = document.getElementById("pointdescription");
    let lati = document.getElementById("lati");
    let long = document.getElementById("long");
    let time_open = document.getElementById("time_open");
    let time_close = document.getElementById("time_close");
    let accepts_paper = document.getElementById("accepts_paper");
    let accepts_metal = document.getElementById("accepts_metal");
    let accepts_organic = document.getElementById("accepts_organic");
    let accepts_biological = document.getElementById("accepts_biological");

    let userdata = await loggedIn();
    if(userdata) {
        if(pointdescription && lati && long && time_close && time_open &&
            accepts_biological && accepts_metal && accepts_organic &&
            accepts_paper
        ) {
            let rt = await createPoint(
                userdata.email,
                userdata.token,
                pointdescription.value,
                lati.value,
                long.value,
                time_open.value,
                time_close.value,
                cbtob(accepts_paper.value),
                cbtob(accepts_metal.value),
                cbtob(accepts_organic.value),
                cbtob(accepts_paper.value)
            );

            if(rt.type != "okay") {
                showErrorPopup("Erro na criação do ponto. A culpa provávelmente é nossa; entre em contato!");
            } else {
                if(isBackOng()) {
                    window.location.href = "/ong-menu.html";
                } else {
                    window.location.href = "/map.html";
                }
            }
        }
    } else {
        invalidateLogin();
    }
}

document.getElementById("createbutton").addEventListener("click", () => {
    formToPoint();
});

ongWarning();
backButtonSet();