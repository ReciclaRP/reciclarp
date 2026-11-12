import { deleteAccountAndInvalidate, voluntaryInvalidateLogin } from './logic/login';
import { redeemSpecial } from './logic/account';
import { showErrorPopup, showPopup } from './miscellaneous_elements/error_popup';

async function redeem() {
    let el = document.getElementById("special-code-input");
    if(el) {
        let code = el.value;

        let res = await redeemSpecial(code);

        if(res) {
            showPopup("Código resgatado com sucesso!", "green", "white");
        } else {
            showErrorPopup("Código incorreto.");
        }
    }
}

document.getElementById("logout-button").addEventListener("click", () => {
    voluntaryInvalidateLogin();
});

document.getElementById("deleteacc-button").addEventListener("click", () => {
    deleteAccountAndInvalidate();
});

document.getElementById("special-code-submit").addEventListener("click", () => {
    redeem();
});