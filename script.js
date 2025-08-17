let chatBox;

async function init() {
  await tableau.extensions.initializeAsync();
  chatBox = document.getElementById("chat");
  logMessage("System", "AI Explainer ready. Ask about your data!");
}

function logMessage(sender, msg) {
  chatBox.innerHTML += `<p><b>${sender}:</b> ${msg}</p>`;
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById("input");
  const question = input.value;
  input.value = "";

  logMessage("You", question);

  // Step 1. Grab Tableau data
  const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
  const worksheet = worksheets[0]; // Use first sheet (customize this!)
  const dataTable = await worksheet.getSummaryDataAsync({ maxRows: 50 });
  const headers = dataTable.columns.map(c => c.fieldName);
  const rows = dataTable.data.map(r => r.map(c => c.formattedValue));

  // Step 2. Send data + question to Gemini API
  const response = await fetch("http://localhost:3000/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, headers, rows })
  });

  const data = await response.json();
  logMessage("AI", data.answer);
}

window.onload = init;
