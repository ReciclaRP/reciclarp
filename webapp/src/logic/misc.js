function descriptionFromPointTypes(point) {
    if(point) {
        let acceptedkinds = "";

        if(point.accepts_biological == 1) {
            acceptedkinds += "biológicos"
        }

        if(point.accepts_metal == 1) {
            if(acceptedkinds != "") {
                acceptedkinds += ", ";
            }
            acceptedkinds += "metal";
        }

        if(point.accepts_organic == 1) {
            if(acceptedkinds != "") {
                acceptedkinds += ", ";
            }
            acceptedkinds += "orgânicos";
        }

        if(point.accepts_paper == 1) {
            if(acceptedkinds != "") {
                acceptedkinds += ", ";
            }
            acceptedkinds += "papel";
        }

        acceptedkinds += ".";

        return acceptedkinds;
    }

    return false;
}

function cbtob(cbval) {
    if(cbval == "on") return true;
    return false;
}

function isBackOng() {
    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get("back");

    if(myParam == "ong") {
        return true;
    }

    return false;
}

export {
    descriptionFromPointTypes,
    cbtob,
    isBackOng
};