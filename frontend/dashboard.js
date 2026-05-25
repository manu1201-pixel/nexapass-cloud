document.addEventListener('DOMContentLoaded', () => {
    // 1. INITIALIZATION: Boot up browser tracking systems
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            loadNearbyEvents(latitude, longitude);
        }, () => {
            document.getElementById('status-message').innerText = "Location access denied. Enable GPS permissions.";
        });
    } else {
        document.getElementById('status-message').innerText = "Geolocation services unsupported by this browser.";
    }

    // 2. INTEGRATION TRIGGER: Wire up our native Unstop sync pipeline button
    const syncBtn = document.getElementById('sync-btn');
    if (syncBtn) {
        syncBtn.addEventListener('click', async () => {
            const icon = document.getElementById('sync-icon');
            
            // Add a clean mechanical spinning animation to show workflow activity
            icon.classList.add('fa-spin'); 
            
            try {
                console.log("📡 Initiating direct server-to-server data fetch...");
                const response = await fetch('https://nexapass-cloud.onrender.com/api/sync-external-events', {
                    method: 'POST'
                });
                const data = await response.json();
                
                if (data.success) {
                    alert(`✨ ${data.message}`);
                    
                    // Re-request location coordinates to seamlessly display the new records
                    navigator.geolocation.getCurrentPosition(position => {
                        loadNearbyEvents(position.coords.latitude, position.coords.longitude);
                    });
                }
            } catch (err) {
                console.error("Pipeline communication failure:", err);
                alert("Could not establish direct synchronization link to gateway.");
            } finally {
                // Kill rotation when networking concludes
                icon.classList.remove('fa-spin');
            }
        });
    }
});

// 3. CORE CORE RENDERER: Fetch layout arrays from MongoDB and display them
async function loadNearbyEvents(lat, lng) {
    try {
        const response = await fetch('https://nexapass-cloud.onrender.com/api/events?lat=' + lat + '&lng=' + lng);
        const data = await response.json();

        const container = document.getElementById('event-container');
        container.innerHTML = ''; 
        document.getElementById('status-message').style.display = 'none';

        if (!data.events || data.events.length === 0) {
            document.getElementById('status-message').innerText = "No regional events active within radius.";
            document.getElementById('status-message').style.display = 'block';
            return;
        }

        data.events.forEach(item => {
            const row = `
                <div class="event-row" onclick="selectEvent('${item.title}')">
                    <div>
                        <div class="event-meta">
                            <span class="status-tag">${item.category || 'Live'}</span>
                            <span class="distance-metric"><i class="fa-solid fa-location-arrow" style="font-size:11px;"></i> Regional Track</span>
                        </div>
                        <h2 class="event-title">${item.title}</h2>
                        <p class="event-desc">${item.description}</p>
                        <div class="event-venue">
                            <i class="fa-regular fa-building"></i> ${item.address}
                        </div>
                    </div>
                    <div>
                        <button class="action-button">Register</button>
                    </div>
                </div>
            `;
            container.innerHTML += row;
        });
    } catch (err) {
        console.error("Fetch Exception:", err);
        document.getElementById('status-message').innerText = "Network execution timeout. Verify server runtime.";
    }
}

function selectEvent(title) {
    // Correctly routes the user to the newly renamed registration form panel
    window.location.href = `register.html?event=${encodeURIComponent(title)}`;
}
