import { checkLoginState, sendLoginCode, getLoginToken } from "./backend";

//stub
function invalidateLogin() {
    console.log("invalidate login!")
}

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
                token = entry.split("=")[1];
            }

            if(entry.includes("loginmail")) {
                email = entry.split("=")[1];
            }
        }

        if(token && email) {
            console.log(email)
            console.log(token);
            let data = await checkLoginState(email, token);

            console.log(data)
            if(data && data.type && data.type == "okay") {
                return {
                    email: email,
                    token: token,

                    data: data
                }
            }

            return false;
        }

        return false;
    }

    return false;
}

async function requestLogin(email) {
    if(email) {
        let data = await sendLoginCode(email);

        if(data.type == "okay") {
            return true;
        }

        return false;
    }

    return false;
}

async function login(email, code, days_valid) {
    if(email && code) {
        let data = await getLoginToken(email, code);

        let curdate = new Date();
        curdate.setDate(curdate.getDate() + days_valid);

        if(data && data.type == "okay") {
            let expires_st = "";
            if(days_valid > 0) {
                expires_st = `; expires=${curdate.toUTCString()}`;
            }

            document.cookie = (`logintok=${data.token}` + expires_st);
            document.cookie = (`loginmail=${email}` + expires_st);

            return true;
        }
    }

    return false;
}

export {
    requestLogin,
    loggedIn,
    login,
    invalidateLogin
}