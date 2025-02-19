document.addEventListener("DOMContentLoaded", function () {
    // Download Button Event Listener
    const downloadButton = document.getElementById("downloadTemplate");
    if (downloadButton) {
      downloadButton.addEventListener("click", function () {
        window.location.href = "/download-templates";
      });
    }
  
    // Capture and Send User IP (with error handling)
    fetch("https://api64.ipify.org?format=json")
      .then(response => response.json())
      .then(data => {
        if (data.ip) {
          fetch("/capture-ip", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ip: data.ip })
          })
          .then(response => {
            if (!response.ok) {
              console.error("IP capture failed:", response.statusText);
            }
          })
          .catch(error => console.error("Error sending IP:", error));
        }
      })
      .catch(error => console.error("Error fetching IP:", error));
  });
  