/* TODO / IDEIA PRO BACKEND: Enviar um único e-mail que comunica ao usuário se ele foi banido
na hora do login */
// TODO: Variável de ambiente para duração padrão do login
const LOGIN_VALID_DAYS = 7;

import { requestLogin, login, loggedIn } from './logic/login.js';

function displayLoginTechnicalFailure() {
    console.log("Login failure!");
}

function displayLoginBadCodeFailure() {
    console.log("Login failure! (wrong code)")
}

function redirectToMap() {
    window.location.href = "/map.html";
}

function loginWithCode() {
    const email_box = document.getElementById("login-email");
    const email = email_box.value;

    const logincode_box = document.getElementById("login-code");
    const logincode = logincode_box.value;

    if(logincode && email) {
        login(email, logincode, LOGIN_VALID_DAYS).then(
            result => {
                if(result) {
                    console.log(result);
                    redirectToMap();
                } else {
                    displayLoginBadCodeFailure();
                }
            },

            failure => {
                displayLoginTechnicalFailure();
            }
        )
    }
}

function okPressed() {
    const email_box = document.getElementById("login-email");
    const email = email_box.value;

    if(email) {
        email_box.readOnly = true;

        requestLogin(email).then(
            result => {
                if(result) {
                    const onetimecode_inputs = document.getElementById("id-verif-inputs");
                    
                    if(onetimecode_inputs) {
                        onetimecode_inputs.style.display = "block";
                    }

                    const first_login_button = document.getElementById("send-code-button");
                    
                    if(first_login_button) {
                        first_login_button.style.display = "none";
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

if(await loggedIn()) {
    redirectToMap();
} else {
    document.getElementById("send-code-button").addEventListener("click", () => {
        okPressed();
    });

    document.getElementById("login-button").addEventListener("click", () => {
        loginWithCode();
    });
}