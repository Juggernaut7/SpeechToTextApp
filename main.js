// ==== Element References ====
const startButtonListening = document.getElementById('start-btn'); // Button to start voice recognition
const stopButtonListening = document.getElementById('stop-btn'); // Button to stop voice recognition
const output = document.getElementById('output'); // Area to display real-time transcriptions and feedback
const languageSelector = document.getElementById('language'); // Dropdown to select language for recognition
const saveButton = document.getElementById('save-btn'); // Button to save transcript to list
const exportButton = document.getElementById('export-btn'); // Button to export transcript as a file
const transcriptList = document.getElementById('transcript-list'); // List to display saved transcripts

// ==== Initialize Speech Recognition API ====
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true; // Keep listening until explicitly stopped
recognition.interimResults = true; // Show results as the user is speaking
recognition.lang = "en-US"; // Default language

// ==== Event: Speech Recognition Started ====
recognition.onstart = () => {
  toggleListening(true); // Toggle UI state
  output.textContent = "Listening..."; // Feedback to user
};

// ==== Event: On Receiving Speech Result ====
recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase(); // Extract latest transcript
  const timestamp = new Date().toLocaleTimeString(); // Generate current time
  output.textContent = `${timestamp}: ${transcript}\n`; // Display with timestamp

  handleVoiceCommands(transcript); // Handle voice-triggered commands
};

// ==== Event: On Speech Recognition Error ====
recognition.onerror = (event) => {
  console.error("Speech recognition error:", event.error); // Log the error
  output.textContent = `Error: ${event.error}`; // Display error to user
};

// ==== Button Event: Start Listening ====
startButtonListening.addEventListener("click", () => {
  recognition.lang = languageSelector.value; // Update recognition language
  recognition.start(); // Start listening
});

// ==== Button Event: Stop Listening ====
stopButtonListening.addEventListener("click", () => {
  stopListening(); // Stop recognition and update UI
});

// ==== Button Event: Save Transcript to List ====
saveButton.addEventListener("click", saveTranscript);

// ==== Button Event: Export Transcript as File ====
exportButton.addEventListener("click", exportTranscript);

// ==== Dynamically Add Copy-to-Clipboard Button ====
const copyButton = document.createElement('button');
copyButton.textContent = 'Copy to Clipboard';
document.querySelector('.container').appendChild(copyButton);

// ==== Event: Copy Transcript to Clipboard ====
copyButton.addEventListener('click', () => {
  navigator.clipboard.writeText(output.textContent); // Copy to clipboard
  copyButton.textContent = 'Copied!'; // Temporary feedback
  setTimeout(() => (copyButton.textContent = 'Copy to Clipboard'), 2000); // Reset label
});

// ==== UI Helper: Toggle Start/Stop Button Visibility ====
function toggleListening(isListening) {
  startButtonListening.style.display = isListening ? "none" : "inline-flex";
  stopButtonListening.style.display = isListening ? "inline-flex" : "none";
}

// ==== Stop Speech Recognition & Update UI ====
function stopListening() {
  recognition.stop(); // Stop listening
  toggleListening(false); // Update buttons
  output.textContent = "Stopped listening."; // User feedback
}

// ==== Save Current Transcript to List with Delete Option ====
function saveTranscript() {
  const transcriptItem = document.createElement("li");
  transcriptItem.textContent = output.textContent;

  // Create delete button for each saved item
  const deleteBtn = document.createElement("span");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.textContent = "❌";
  deleteBtn.addEventListener("click", () => transcriptList.removeChild(transcriptItem));

  transcriptItem.appendChild(deleteBtn);
  transcriptList.appendChild(transcriptItem);
}

// ==== Export Transcript as Text File ====
function exportTranscript() {
  const blob = new Blob([output.textContent], { type: 'text/plain' }); // Create file blob
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'transcription.txt'; 
  // Set download filename
  link.click();
   // Trigger download
}

// ==== Handle Predefined Voice Commands ====
function handleVoiceCommands(transcript) {
  // Command: Clear screen
  if (transcript.includes("clear screen")) {
    output.textContent = "Screen cleared by voice command.";
    transcriptList.innerHTML = "";
     // Clear saved list
  }

  // Command: Save current transcript
  if (transcript.includes("save this")) {
    saveTranscript();
    output.textContent = "Saved by voice command.";
  }

  // Command: Export transcript to file
  if (transcript.includes("export")) {
    exportTranscript();
    output.textContent = "Exported by voice command.";
  }

  // Command: Stop listening
  if (transcript.includes("stop listening")) {
    stopListening();
    output.textContent = "Stopped by voice command.";
  }
}
function closeOnboarding() {
  document.getElementById('onboarding').style.display = 'none';
  document.getElementById('app').classList.remove('hidden');
}

// ==== Initialize Language Selector Options ====
// const languages = [
//   { code: "en-US", name: "English (US)" },
//   { code: "es-ES", name: "Spanish (Spain)" },
//   { code: "fr-FR", name: "French (France)" },
//   { code: "de-DE", name: "German (Germany)" },
//   { code: "it-IT", name: "Italian (Italy)" },
//   { code: "ja-JP", name: "Japanese (Japan)" },
//   { code: "zh-CN", name: "Chinese (China)" },
// ];