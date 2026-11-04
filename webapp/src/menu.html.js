import { invalidateLogin, loggedIn } from './logic/login';

async function determineShowOngMenu() {
    let data = await loggedIn();
    
    if(data) {
        if(data.data.ong) {
            const eong = document.getElementById("ongmenu");

            if(eong) {
                eong.style.display = "block";
            }
        }
    }
}

await determineShowOngMenu();