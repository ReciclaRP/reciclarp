const readline = require('node:readline');

let APP_URL = "http://127.0.0.1:3000";

async function get_login_code(email) {
    let res = await fetch(
        `${APP_URL}/auth/login`,
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

async function get_point_list() {
    let res = await fetch(
        `${APP_URL}/point/list`,
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

async function get_session_token(email, code) {
        let res = await fetch(
        `${APP_URL}/auth/token`,
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

async function check_session_token(email, token) {
        let res = await fetch(
        `${APP_URL}/auth/check`,
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

async function flow() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question("Insert the e-mail: ", email => {
        get_login_code(email);

        rl.question("Insert the code: ", code => {
            get_session_token(email, code).then(retdata => {
                console.log(retdata.token);
                check_session_token(email, retdata.token).then(retdata2 => {
                    console.log(retdata2);
                });
            });
        });
    })

}

flow();