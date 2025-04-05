// Element References
const startButtonListening = document.getElementById('start-btn');
const stopButtonListening = document.getElementById('stop-btn');
const output = document.getElementById('output');
const languageSelector = document.getElementById('language');
const saveButton = document.getElementById('save-btn');
const exportButton = document.getElementById('export-btn');
const transcriptList = document.getElementById('transcript-list');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "en-US";


recognition.onstart = () => {
  toggleListening(true);
  output.textContent = "Listening...";
};

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
  const timestamp = new Date().toLocaleTimeString();
  output.textContent = `${timestamp}: ${transcript}\n`;

  handleVoiceCommands(transcript);
};

recognition.onerror = (event) => {
  console.error("Speech recognition error:", event.error);
  output.textContent = `Error: ${event.error}`;
};

// Button Events
startButtonListening.addEventListener("click", () => {
  recognition.lang = languageSelector.value;
  recognition.start();
});

stopButtonListening.addEventListener("click", () => {
  stopListening();
});

saveButton.addEventListener("click", saveTranscript);
exportButton.addEventListener("click", exportTranscript);

const copyButton = document.createElement('button');
copyButton.textContent = 'Copy to Clipboard';
document.querySelector('.container').appendChild(copyButton);

copyButton.addEventListener('click', () => {
  navigator.clipboard.writeText(output.textContent);
  copyButton.textContent = 'Copied!';
  setTimeout(() => ((copyButton.textContent) = 'Copy to Clipboard'), 
  2000);
});


function toggleListening(isListening) {
  startButtonListening.style.display = isListening ? "none" : "inline-flex";
  stopButtonListening.style.display = isListening ? "inline-flex" : "none";
}

function stopListening() {
  recognition.stop();
  toggleListening(false);
  output.textContent = "Stopped listening.";
}

function saveTranscript() {
  const transcriptItem = document.createElement("li");
  transcriptItem.textContent = output.textContent;

  const deleteBtn = document.createElement("span");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.textContent = "❌";
  deleteBtn.addEventListener("click", () => transcriptList.removeChild(transcriptItem));

  transcriptItem.appendChild(deleteBtn);
  transcriptList.appendChild(transcriptItem);
}

function exportTranscript() {
  const blob = new Blob([output.textContent], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'transcription.txt';
  link.click();
}

function handleVoiceCommands(transcript) {
  if (transcript.includes("clear screen")) {
    output.textContent = "Screen cleared by voice command.";
    transcriptList.innerHTML = ""; 
  }

  if (transcript.includes("save this")) {
    saveTranscript();
    output.textContent = "Saved by voice command.";

  }

  if (transcript.includes("export")) {
    exportTranscript();
    output.textContent = "Exported by voice command.";
  }

  if (transcript.includes("stop listening")) {
    stopListening();

    output.textContent = "Stopped by voice command.";
  }
}
