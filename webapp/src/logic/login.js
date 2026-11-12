import { checkLoginState, sendLoginCode, getLoginToken, invalidateLoginTokens, deleteAccount } from "./backend";

function invalidateLogin() {
    document.cookie = "logintok=; expires = Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "loginmail=; expires = Thu, 01 Jan 1970 00:00:00 UTC;";

    window.location.href = "/";
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

async function voluntaryInvalidateLogin() {
    let udata = await loggedIn();

    if(udata) {
        await invalidateLoginTokens(udata.email, udata.token);
    }

    invalidateLogin();
}

async function deleteAccountAndInvalidate() {
    let udata = await loggedIn();

    if(udata) {
        let okay = window.confirm("Tem certeza? Estes dados não poderão ser recuperados!");

        if(okay) {
            await deleteAccount(udata.email, udata.token);
        }
    } else {
        invalidateLogin();
    }
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
    invalidateLogin,
    voluntaryInvalidateLogin,
    deleteAccountAndInvalidate
}