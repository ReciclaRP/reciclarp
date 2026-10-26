/* TODO / IDEIA PRO BACKEND: Enviar um único e-mail que comunica ao usuário se ele foi banido
na hora do login */
import { requestLogin } from './logic/login.js';

function displayLoginTechnicalFailure() {

}

function okPressed() {
    const email_box = document.getElementById("login-email");
    const email = email_box.textContent;
    if(email) {
        requestLogin(email).then(
            result => {
                if(result) {
                    const onetimecode_inputs = document.getElementById("id-verif-inputs");
    
                    if(onetimecode_inputs) {
                        onetimecode_inputs.style.display = "block";
                    }
                } else {
                    displayLoginTechnicalFailure();
                }
            },

            failure => {
                displayLoginTechnicalFailure();
            }
        )
    }
}