document.addEventListener('DOMContentLoaded', () => {
    // 1. INITIALIZATION: Read incoming url track indices
    const urlParams = new URLSearchParams(window.location.search);
    const selectedEvent = urlParams.get('event') || "General Event Track";
    
    const eventDisplay = document.getElementById('event-display');
    if (eventDisplay) {
        eventDisplay.innerHTML = `
            <i class="fa-solid fa-shield-halved"></i> ${selectedEvent}
        `;
    }

    // 2. FORM PROCESSING PIPELINE
    const form = document.getElementById('registration-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('username').value;
            const email = document.getElementById('user-email').value; // Captured email field
            const submitBtn = document.getElementById('submit-btn');
            const spinner = document.getElementById('spinner');

            // Set UI processing states
            if (submitBtn) submitBtn.style.opacity = "0.8";
            if (spinner) spinner.style.display = "inline-block";

            try {
                console.log("📨 Shipping transaction arrays to Node server backend...");
                
                const response = await fetch('http://localhost:3000/api/generate-itinerary', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, topic: selectedEvent })
                });

                const data = await response.json();
                console.log("📥 Backend Response Received:", data);

                if (data.success) {
                    // Commit structural text straight to client-side localStorage nodes
                    localStorage.setItem('vip_name', name);
                    localStorage.setItem('vip_event', selectedEvent);
                    localStorage.setItem('vip_itinerary', data.itinerary);

                    // CACHING DISPATCH LINK: Crucial block for rendering the link on the ticket page!
                    if (data.previewUrl) {
                        console.log("🔗 Mail Node Verified! URL:", data.previewUrl);
                        localStorage.setItem('mail_preview', data.previewUrl);
                    } else {
                        console.warn("⚠️ Transaction complete, but no secure email preview URL returned.");
                        localStorage.removeItem('mail_preview'); // Wipe dirty parameters
                    }

                    // Shift client to final ticket display frame
                    window.location.href = 'ticket.html';
                } else {
                    alert(`Pipeline execution error: ${data.error || 'Transaction declined.'}`);
                }
            } catch (err) {
                console.error("❌ Transmission Exception:", err);
                alert("Could not build communication tunnel with backend engine.");
            } finally {
                if (submitBtn) submitBtn.style.opacity = "1";
                if (spinner) spinner.style.display = "none";
            }
        });
    }
});