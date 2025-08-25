const scriptURL = "https://script.google.com/macros/s/AKfycbxm4nw8lyixQW83-WJ3_ClopMAFmPL5gIn0QRrgVxovpZvGn8RjFWNKRRtwWS_KC2UO/exec";

function getScanType() {
  return document.querySelector('input[name="scanType"]:checked').value;
}

function sendScanData(studentId, lat = "", lng = "") {
  const scanType = getScanType();
  fetch(scriptURL, {
    method: 'POST',
    body: new URLSearchParams({ studentId, scanType, lat, lng })
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById("status").innerText = `✅ ${data.studentName} (${data.status})`;
    const tbody = document.querySelector("#scan-log tbody");
    const row = tbody.insertRow(0);
    row.className = data.direction;
    row.insertCell(0).innerText = data.studentId;
    row.insertCell(1).innerText = data.studentName;
    row.insertCell(2).innerText = data.direction.toUpperCase();
    row.insertCell(3).innerText = data.status;
    row.insertCell(4).innerText = new Date().toLocaleTimeString();

    setTimeout(() => {
      document.getElementById("status").innerText = "Waiting for scan...";
      if (!document.getElementById("manualMode").checked) startScanner();
    }, 2000);
  })
  .catch(error => {
    document.getElementById("status").innerText = "❌ Error: " + error;
    setTimeout(() => {
      document.getElementById("status").innerText = "Waiting for scan...";
      if (!document.getElementById("manualMode").checked) startScanner();
    }, 3000);
  });
}

function manualScan() {
  const studentId = document.getElementById("manualStudentId").value.trim();
  if (studentId) {
    navigator.geolocation.getCurrentPosition(
      pos => sendScanData(studentId, pos.coords.latitude, pos.coords.longitude),
      () => sendScanData(studentId)
    );
    document.getElementById("manualStudentId").value = "";
  } else {
    alert("Please enter a valid Student ID.");
  }
}

let html5QrCode;
function startScanner() {
  html5QrCode = new Html5Qrcode("reader");
  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    qrCodeMessage => {
      html5QrCode.stop();
      navigator.geolocation.getCurrentPosition(
        pos => sendScanData(qrCodeMessage, pos.coords.latitude, pos.coords.longitude),
        () => sendScanData(qrCodeMessage)
      );
    },
    errorMessage => {}
  ).catch(err => console.log(err));
}

document.getElementById("manualMode").addEventListener("change", e => {
  if (e.target.checked) html5QrCode.stop();
  else startScanner();
});

startScanner();
