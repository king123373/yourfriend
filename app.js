const GROQ_API_KEY = "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

let lastSpokenText = ""; // To prevent self-triggering
let isSpeaking = false; // Track if assistant is speaking
const confidenceThreshold = 0.85; // Minimum confidence to accept input

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = false;
recognition.lang = 'en-US';

// Function to speak responses
function speak(text, callback) {
    if (!text || text.trim() === "") return; // Prevent empty speech
    isSpeaking = true;
    window.speechSynthesis.cancel(); // Clear any ongoing speech
    const text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1;
    text_speak.volume = 1;
    text_speak.pitch = 1;
    lastSpokenText = text.toLowerCase(); // Store last spoken text to prevent self-triggering
    
    text_speak.onend = () => {
        isSpeaking = false;
        setTimeout(() => recognition.start(), 500); // Restart recognition after a short delay
        if (callback) callback();
    };
    window.speechSynthesis.speak(text_speak);
}

// Voice recognition handler
recognition.onresult = (event) => {
    if (isSpeaking) return; // Ignore input while speaking
    const lastResult = event.results[event.results.length - 1];
    const transcript = lastResult[0].transcript.toLowerCase().trim();
    const confidence = lastResult[0].confidence;

    if (confidence < confidenceThreshold || transcript === lastSpokenText) return; // Ignore low-confidence input and self-triggering
    
    document.querySelector('.content').textContent = transcript;
    console.log("Recognized Speech:", transcript, "Confidence:", confidence); // Debugging output
    
    recognition.stop(); // Stop recognition while processing
    processCommand(transcript); // Process command
};

// Function to process voice commands
async function processCommand(message) {
    try {
        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3-8b-8192",
                messages: [
                    { role: "system", content: "You are a friendly AI assistant. Keep responses short and conversational. Don't repeat system commands unnecessarily." },
                    { role: "user", content: message }
                ]
            })
        });

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            executeCommand(data.choices[0].message.content);
        } else {
            speak("I didn't get that.");
        }
    } catch (error) {
        speak("There was an error.");
        console.error("API Error:", error);
    }
}

// Function to execute system commands
function executeCommand(response) {
    if (response.includes("Command:")) {
        const command = response.replace("Command:", "").trim();
        fetch("http://127.0.0.1:5000/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ command: command })
        })
        .then(res => res.json())
        .then(data => {
            speak(data.message);
            console.log("Python Response:", data);
        })
        .catch(error => {
            speak("Couldn't run the command.");
            console.error("Error:", error);
        });
    } else {
        speak(response);
    }
}

document.querySelector('.talk').addEventListener('click', () => {
    document.querySelector('.content').textContent = "Listening...";
    recognition.start();
});

window.addEventListener('load', () => {
    setTimeout(() => recognition.start(), 1000); // Delay start to ensure proper initialization
});
