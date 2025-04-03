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
  startButtonListening.style.display = "none";
  stopButtonListening.style.display = "inline-flex";
  output.textContent = "Listening...";
};

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript;
  output.textContent = transcript;
};

recognition.onerror = (event) => {
  console.error("Speech recognition error:", event.error);
  output.textContent = `Error: ${event.error}`;
};

startButtonListening.addEventListener("click", function() {
  recognition.lang = languageSelector.value;
  recognition.start();
});

stopButtonListening.addEventListener("click", function() {
  recognition.stop();
  startButtonListening.style.display = "inline-flex";
  stopButtonListening.style.display = "none";
  output.textContent = "Stopped listening.";
});

saveButton.addEventListener("click", function() {
  const transcriptItem = document.createElement("li");
  transcriptItem.textContent = output.textContent;
  const deleteBtn = document.createElement("span");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.textContent = "❌";
  transcriptItem.appendChild(deleteBtn);
  deleteBtn.addEventListener("click", function() {
    transcriptList.removeChild(transcriptItem);
  });
  transcriptList.appendChild(transcriptItem);
});

exportButton.addEventListener("click", function() {
  const blob = new Blob([output.textContent], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'transcription.txt';
  link.click();
});
