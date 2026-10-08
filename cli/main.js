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