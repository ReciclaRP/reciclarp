import { redeemCode } from "./backend";
import { loggedIn, invalidateLogin } from "./login";

async function redeemSpecial(code) {
    let udata = await loggedIn();

    if(udata) {
        let res = await redeemCode(udata.email, udata.token, code);

        if(res && res.type == "okay") {
            return true;
        } else {
            return false;
        }
    } else {
        invalidateLogin();
    }
}

export {
    redeemSpecial
}