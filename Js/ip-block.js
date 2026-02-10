// ip-block.js
// Lógica de verificación y bloqueo de IP

async function checkBlockedIP() {
    try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const { ip: userIP } = await ipResponse.json();
        const blockedResponse = await fetch('Json/blocked_ips.json');
        const { blocked_ips, error_code } = await blockedResponse.json();
        const blockedIPCookie = document.cookie.split('; ').find(row => row.startsWith('blocked_ip='))?.split('=')[1];
        const blockedIPStorage = localStorage.getItem('blocked_ip');
        const isCurrentIPBlocked = blocked_ips.includes(userIP);
        const isStoredIPBlocked = (blockedIPCookie && blocked_ips.includes(blockedIPCookie)) || 
                                 (blockedIPStorage && blocked_ips.includes(blockedIPStorage));
        if (isCurrentIPBlocked) {
            document.cookie = `blocked_ip=${userIP}; path=/; max-age=2592000`;
            localStorage.setItem('blocked_ip', userIP);
            window.location.href = `error.html?code=${error_code}`;
            return true;
        } else if (isStoredIPBlocked) {
            window.location.href = `error.html?code=${error_code}`;
            return true;
        } else {
            if (blockedIPCookie) document.cookie = 'blocked_ip=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            if (blockedIPStorage) localStorage.removeItem('blocked_ip');
            return false;
        }
    } catch (error) {
        console.error('Error en verificación de IP:', error);
        return false;
    }
}
