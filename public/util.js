const urlBase = getApiUrl();

export async function getMyUserId() {
    const response = await get('/api/users/me');
    const result = await response.json();
    if (result.success) {
        return result.data.userId;
    }
    else {
        log(result.message);
        return undefined;
    }
}

// POSTリクエスト
export async function post(endpoint, data) {
    const response = await fetch(urlBase + endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
    });
    return response;
}

// GETリクエスト
export async function get(endpoint) {
    const response = await fetch(urlBase + endpoint, {
        method: 'GET',
        credentials: 'include'
    });
    return response;
}

// PUTリクエスト
export async function put(endpoint, data) {
    const response = await fetch(urlBase + endpoint, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
    });
    return response;
}

// DELETEリクエスト
export async function del(endpoint) {
    const response = await fetch(urlBase + endpoint, {
        method: 'DELETE',
        credentials: 'include'
    });
    return response;
}

// ログを表示
export async function log(message) {
    const log = document.getElementById('log');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.marginBottom = '5px';
    messageDiv.style.whiteSpace = 'pre-wrap';
    log.appendChild(messageDiv);
}

// URLを取得
export function getApiUrl() {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3500';
    } else {
        return 'https://tkino117.dev/time-share';
    }
}