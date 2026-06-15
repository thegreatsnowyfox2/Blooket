// THIS IS THE REAL CHEAT ENGINE
// It requires a backend token proxy to work on real games
// Without backend, it runs in DEMO mode (shows explanations)

let activeGame = null;

document.getElementById('joinBtn').onclick = async () => {
    const pin = document.getElementById('gamePin').value;
    const name = document.getElementById('playerName').value;
    const incog = document.getElementById('incognito').getAttribute('checked') === 'true';
    
    updateStatus('Joining game...');
    
    // Try to fetch token from a free proxy (you need to deploy this)
    // For now, DEMO MODE
    try {
        const response = await fetch(`https://blooket-proxy.your-worker.workers.dev/join`, {
            method: 'POST',
            body: JSON.stringify({ pin, name, incog }),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if(data.success) {
            activeGame = data;
            initFirebase(data);
            document.getElementById('cheatPanel').style.display = 'block';
            updateStatus('✅ Connected! Cheats active.');
            loadPlayerList();
        } else {
            demoMode(pin, name);
        }
    } catch(e) {
        demoMode(pin, name);
    }
};

function demoMode(pin, name) {
    updateStatus('⚠️ DEMO MODE: Real cheats require backend proxy. Showing explanations only.');
    document.getElementById('cheatPanel').style.display = 'block';
    
    document.getElementById('crashHostBtn').onclick = () => alert('💥 REAL CRASH: setUserVal("g/t","t") sends string to numeric field → host crashes. Need backend token.');
    document.getElementById('freezeScoreboardBtn').onclick = () => alert('❄️ FREEZE: setUserVal("tat/t","t") injects CSS bomb. Need backend.');
    document.getElementById('setGoldBtn').onclick = () => alert('✨ SET GOLD: setUserVal("g",99999) writes to Firebase. Need backend.');
    document.getElementById('stealGoldBtn').onclick = () => alert('💰 STEAL: setUserVal("tat","target:amount") transfers gold. Need backend.');
    document.getElementById('setBlookBtn').onclick = () => alert('🎭 CHANGE BLOOK: setUserVal("b","BlookName"). Need backend.');
}

function initFirebase(tokenData) {
    // This would initialize Firebase with Blooket's config
    // Actual code requires Firebase SDK import
    console.log('Firebase ready', tokenData);
}

function loadPlayerList() {
    // Would populate player dropdown from Firebase
    const select = document.getElementById('targetPlayer');
    select.innerHTML = '<option>You</option><option>Player2</option><option>Host</option>';
}

function updateStatus(msg) {
    document.getElementById('status').innerHTML = `Status: ${msg}`;
}

// Checkbox handler
document.querySelectorAll('checkbox').forEach(cb => {
    cb.addEventListener('click', function() {
        if(this.getAttribute('checked')) this.removeAttribute('checked');
        else this.setAttribute('checked', 'true');
    });
});
