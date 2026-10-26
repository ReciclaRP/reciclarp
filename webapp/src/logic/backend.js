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

export {
    pullMapData,
    sendLoginCode,
    getLoginToken,
    checkLoginState
};