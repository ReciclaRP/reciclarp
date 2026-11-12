const API_URL = "http://localhost:3000"

async function pullMapData() {
    let res = await fetch(
        `${API_URL}/point/list`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            
            body: JSON.stringify({
                data: "test"
            })
        }
    )

    return await res.json();
}

async function sendLoginCode(email) {
    let res = await fetch(
        `${API_URL}/auth/login`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            
            body: JSON.stringify({
               email: email
            })
        }
    )

    return await res.json();
}

// Get the login token
async function getLoginToken(email, code) {
    let res = await fetch(
        `${API_URL}/auth/token`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            
            body: JSON.stringify({
                email: email,
                code: code
            })
        }
    )

    return await res.json();
}

async function checkLoginState(email, token) {
    let res = await fetch(
        `${API_URL}/auth/check`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            
            body: JSON.stringify({
               email: email,
               token: token
            })
        }
    )

    return await res.json();
}

async function createReport(email, token, pid, report) {
    let res = await fetch(
        `${API_URL}/report/create`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            
            body: JSON.stringify({
               email: email,
               token: token,

               description: report.description,
               problem_kind: report.problem_kind,
               pid: pid
            })
        }
    )

    return await res.json();
}

async function createPoint(email, token, pointdescription, lati, long, time_open, time_close, accepts_paper, accepts_metal, accepts_organic, accepts_biological) {
    let res = await fetch(
        `${API_URL}/point/create`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            
            body: JSON.stringify({
               email: email,
               token: token,

               data: {
                    pointdescription: pointdescription,
                    lati: lati,
                    long: long,
                    time_open: time_open,
                    time_close: time_close,
                    accepts_paper: accepts_paper,
                    accepts_metal: accepts_metal,
                    accepts_organic: accepts_organic,
                    accepts_biological: accepts_biological
               }
            })
        }
    )

    return await res.json();
}

async function deletePoint(email, token, pid) {
    let res = await fetch(
        `${API_URL}/point/remove`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            
            body: JSON.stringify({
               email: email,
               token: token,

               data: {
                    pid: pid
               }
            })
        }
    )

    return await res.json();
}

async function invalidateLoginTokens(email, token) {
    let res = await fetch(
        `${API_URL}/auth/logout`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            
            body: JSON.stringify({
               email: email,
               token: token
            })
        }
    )

    return await res.json();
}

async function deleteAccount(email, token) {
    let res = await fetch(
        `${API_URL}/auth/delete`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            
            body: JSON.stringify({
               email: email,
               token: token
            })
        }
    )

    return await res.json();
}

export {
    pullMapData,
    sendLoginCode,
    getLoginToken,
    checkLoginState,
    createReport,
    createPoint,
    deletePoint,
    invalidateLoginTokens,
    deleteAccount
};