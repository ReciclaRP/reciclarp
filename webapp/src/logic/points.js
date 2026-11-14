import { loggedIn, invalidateLogin } from "./login";
import { getPointAccessesAmount } from "./backend";

async function pointAccessNo(pid) {
    let udata = await loggedIn();
    if(udata) {
        let re = await getPointAccessesAmount(udata.email, udata.token, pid);
        return re.data;
    } else {
        invalidateLogin();
    }
}

export {
    pointAccessNo
}