import { checkLoginState } from "./backend";

async function loggedIn() {
    if(
        document.cookie.includes("logintok") 
        && document.cookie.includes("loginmail")
    ) {
        let cookies = document.cookie.split(";");
        let token = null;
        let email = null;

        for(let entry of cookies) {
            if(entry.includes("logintok")) {
                token = entry.split("=")[0];
            }

            if(entry.includes("loginmail")) {
                email = entry.split("=")[0];
            }
        }

        if(token && email) {
            let data = await checkLoginState(email, token);

            if(data && data.type && data.type == "okay") {
                return data;
            }

            return false;
        }

        return false;
    }

    return false;
}