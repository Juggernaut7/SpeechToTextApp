// === Element References ===
const startButtonListening = document.getElementById('start-btn');
const stopButtonListening = document.getElementById('stop-btn');
const output = document.getElementById('output');
const languageSelector = document.getElementById('language');
const saveButton = document.getElementById('save-btn');
const exportButton = document.getElementById('export-btn');
const copyButton = document.getElementById('copy-btn');
const offlineToggle = document.getElementById('offline-toggle');
const contrastToggle = document.getElementById('contrast-toggle');
const transcriptList = document.getElementById('transcript-list');

// === Global State ===
let offlineMode = false; 
let speaker = "Speaker 1"; 
let mediaRecorder; 
let audioChunks = []; 

// === Initialize Speech Recognition API ===
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "en-US"; // Default language

// === Initialize Audio Context for Noise Detection ===
const audioContext = new AudioContext();
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.fftSize = 2048;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    // Update noise level every 500ms
    setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const noiseLevel = dataArray.reduce((a, b) => a + b) / dataArray.length;
        output.placeholder = `Noise Level: ${noiseLevel.toFixed(2)}`;
    }, 500);

    // Setup MediaRecorder for timestamped playback
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = saveAudioWithTranscript;
}).catch(err => console.error("Audio setup error:", err));

// === Event Handlers ===

// Speech recognition started
recognition.onstart = () => {
    toggleListening(true);
    output.textContent = "Listening...";
};

// Process speech results with formatting, speaker ID, and translation
recognition.onresult = async (event) => {
    let transcript = event.results[event.results.length - 1][0].transcript.trim();
    transcript = transcript.charAt(0).toUpperCase() + transcript.slice(1) + (transcript.endsWith(".") ? "" : ".");
    const timestamp = new Date().toLocaleTimeString();
    // const translated = await translateText(transcript.split(" ").slice(1).join(" ")); 
    output.textContent = `${timestamp} - ${speaker}: ${transcript}\n`;
    handleVoiceCommands(transcript.toLowerCase());
};

// Handle recognition errors
recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    output.textContent = `Error: ${event.error}`;
    speakFeedback(`Error: ${event.error}`);
};

// Start listening with language and offline mode check
startButtonListening.addEventListener("click", () => {
    if (offlineMode) {
        output.textContent = "Offline mode: Limited to basic English.";
        speakFeedback("Offline mode active.");
    } else {
        recognition.lang = languageSelector.value;
        recognition.start();
        mediaRecorder.start();
    }
});

// Stop listening and recording
stopButtonListening.addEventListener("click", stopListening);

// Save transcript manually
saveButton.addEventListener("click", () => {
    saveTranscript();
    speakFeedback("Transcript saved.");
});

// Export transcript as file
exportButton.addEventListener("click", () => {
    exportTranscript();
    speakFeedback("Transcript exported.");
});

// Copy transcript to clipboard
copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(output.textContent);
    copyButton.textContent = 'Copied!';
    speakFeedback("Copied to clipboard.");
    setTimeout(() => copyButton.textContent = 'Copy to Clipboard', 2000);
});

// Toggle offline mode
offlineToggle.addEventListener("click", () => {
    offlineMode = !offlineMode;
    offlineToggle.textContent = `Offline Mode: ${offlineMode ? "ON" : "OFF"}`;
    recognition.stop();
    speakFeedback(`Offline mode ${offlineMode ? "enabled" : "disabled"}.`);
});

// Toggle high-contrast mode for accessibility
contrastToggle.addEventListener("click", () => {
    document.body.classList.toggle("high-contrast");
    speakFeedback("High contrast mode toggled.");
});

// === Helper Functions ===

// Toggle UI between start/stop states
function toggleListening(isListening) {
    startButtonListening.style.display = isListening ? "none" : "inline-flex";
    stopButtonListening.style.display = isListening ? "inline-flex" : "none";
    speakFeedback(isListening ? "Listening..." : "Stopped listening.");
}

// Stop recognition and audio recording
function stopListening() {
    recognition.stop();
    mediaRecorder.stop();
    toggleListening(false);
    output.textContent = "Stopped listening.";
    speakFeedback("Stopped listening.");
}

// Save transcript to list with delete option
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

// Save audio and link to transcript for playback
function saveAudioWithTranscript() {
    const audioBlob = new Blob(audioChunks);
    const audioUrl = URL.createObjectURL(audioBlob);
    output.textContent.split("\n").forEach(line => {
        if (line.includes(":")) {
            const [time, text] = line.split(": ", 2);
            const li = document.createElement("li");
            li.innerHTML = `<a href="${audioUrl}" onclick="new Audio('${audioUrl}').play()">${time}</a>: ${text}`;
            const deleteBtn = document.createElement("span");
            deleteBtn.classList.add("delete-btn");
            deleteBtn.textContent = "❌";
            deleteBtn.addEventListener("click", () => transcriptList.removeChild(li));
            li.appendChild(deleteBtn);
            transcriptList.appendChild(li);
        }
    });
    audioChunks = [];
}

// Export transcript as text file
function exportTranscript() {
    const blob = new Blob([output.textContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'transcription.txt';
    link.click();
}

// Translate text using a free API 
// async function translateText(text, targetLang = "en") {
//     try {
//         const response = await fetch(`https://github.com/argosopentech/argos-translate`, {
//             method: "POST",
//             body: JSON.stringify({ q: text, source: recognition.lang.split("-")[0], target: targetLang }),
//             headers: { "Content-Type": "application/json" }
//         });
//         const data = await response.json();
//         return data.translatedText || "Translation unavailable";
//     } catch (err) {
//         console.error("Translation error:", err);
//         return "Translation failed";
//     }
// }

// Provide audio feedback for accessibility
function speakFeedback(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageSelector.value;
    window.speechSynthesis.speak(utterance);
}

// Handle voice commands
function handleVoiceCommands(transcript) {
    if (transcript.includes("clear screen")) {
        output.textContent = "Screen cleared by voice command.";
        transcriptList.innerHTML = "";
        speakFeedback("Screen cleared.");
    }
    if (transcript.includes("save this")) {
        saveTranscript();
        output.textContent = "Saved by voice command.";
        speakFeedback("Saved.");
    }
    if (transcript.includes("export")) {
        exportTranscript();
        output.textContent = "Exported by voice command.";
        speakFeedback("Exported.");
    }
    if (transcript.includes("stop listening")) {
        stopListening();
    }
    if (transcript.includes("new speaker")) {
        speaker = prompt("Enter new speaker name:") || `Speaker ${transcriptList.children.length + 1}`;
        output.textContent = `Speaker changed to ${speaker}.`;
        speakFeedback(`Speaker set to ${speaker}.`);
    }
}

// Close onboarding screen
function closeOnboarding() {
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('app').classList.remove('hidden');
}