import { invalidateLogin, loggedIn } from './logic/login';

async function determineShowOngMenu() {
    let data = loggedIn();

    if(data) {
        if(data.data.ong == 1) {
            const eong = document.getElementById("#ongmenu");

            if(eong) {
                eong.style.display = "block";
            }
        }
    }
}

await determineShowOngMenu();