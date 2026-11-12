import { deleteAccountAndInvalidate, voluntaryInvalidateLogin } from './logic/login';

document.getElementById("logout-button").addEventListener("click", () => {
    voluntaryInvalidateLogin();
});

document.getElementById("deleteacc-button").addEventListener("click", () => {
    deleteAccountAndInvalidate();
});