// These are separate in case we want to give showErrorPopup differentiated functionality in the future;

function showPopup(message, bgcolor, color) {
    let body = document.getElementsByTagName("body")[0];

    let err_div = document.createElement("div");
    err_div.style.backgroundColor = bgcolor;
    err_div.style.color = color;
    
    err_div.innerHTML = `
        <p style="text-align:center;">${message}</p>
    `;

    body.prepend(err_div);
}

function showErrorPopup(message) {
    let body = document.getElementsByTagName("body")[0];

    let err_div = document.createElement("div");
    err_div.style.backgroundColor = "red";
    err_div.style.color = "white";
    
    err_div.innerHTML = `
        <p style="text-align:center;">${message}</p>
    `;

    body.prepend(err_div);
}

export {
    showErrorPopup,
    showPopup
}