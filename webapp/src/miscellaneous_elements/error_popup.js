function showErrorPopup(message) {
    let body = document.getElementByTagName("body");

    let err_div = document.createElement("div");
    err_div.style.backgroundColor = "red";

    err_div.innerHTML = `
        <p style="text-align:center;">${message}</p>
    `;

    body.prepend(err_div);
}

export {
    showErrorPopup
}