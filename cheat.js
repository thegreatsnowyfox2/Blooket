// SIMPLIFIED CHEAT - DEMO MODE FIRST
let activeGame = null;

document.getElementById('joinBtn').onclick = async () => {
    const pin = document.getElementById('gamePin').value;
    const name = document.getElementById('playerName').value;
    
    if (!pin || !name) {
        updateStatus('❌ Enter both Game PIN and Nickname!');
        return;
    }
    
    updateStatus('🎮 DEMO MODE: Cheat UI ready (proxy not connected)');
    document.getElementById('cheatPanel').style.display = 'block';
    activeGame = { pin, name };
    
    // Load fake player list for demo
    const select = document.getElementById('targetPlayer');
    select.innerHTML = '<option>Player2</option><option>Host</option><option>Student1</option>';
};

// DEMO BUTTONS - Show what they would do
document.getElementById('crashHostBtn').onclick = () => {
    alert('💥 REAL CRASH: Would send "g/t" = "t" to Firebase\n\nNeed Cloudflare Worker proxy for real effect');
};
document.getElementById('freezeScoreboardBtn').onclick = () => {
    alert('❄️ FREEZE: Would send "tat/t" = "t" to Firebase\n\nNeed Cloudflare Worker proxy for real effect');
};
document.getElementById('setGoldBtn').onclick = () => {
    const amount = document.getElementById('goldAmount').value || 99999;
    alert(`✨ SET GOLD: Would write "g" = ${amount} to Firebase\n\nNeed Cloudflare Worker proxy for real effect`);
};
document.getElementById('stealGoldBtn').onclick = () => {
    const target = document.getElementById('targetPlayer').value;
    const amount = document.getElementById('stealAmount').value || 100;
    alert(`💰 STEAL: Would write "tat" = "${target}:${amount}" to Firebase\n\nNeed Cloudflare Worker proxy for real effect`);
};
document.getElementById('setBlookBtn').onclick = () => {
    const blook = document.getElementById('blookSelect').value;
    alert(`🎭 CHANGE BLOOK: Would write "b" = "${blook}" to Firebase\n\nNeed Cloudflare Worker proxy for real effect`);
};
document.getElementById('leaveGameBtn').onclick = () => {
    updateStatus('🚪 Left game (demo)');
    document.getElementById('cheatPanel').style.display = 'none';
    activeGame = null;
};
document.getElementById('floodAlertBtn').onclick = () => {
    alert('📢 FLOOD ALERT: Would send 1000+ character string to "tat"\n\nNeed Cloudflare Worker proxy for real effect');
};

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

updateStatus('Ready (Demo Mode - No proxy required)');
