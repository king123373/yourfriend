from flask import Flask, render_template, request, jsonify
from assistant import process_voice_command
import openai

app = Flask(__name__, static_folder="static", template_folder="templates")

# Set your Groq API key here
GROQ_API_KEY = "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"

def query_groq(message):
    """Query the Groq API to process commands."""
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "system", "content": "You are a voice assistant for PC system commands."},
            {"role": "user", "content": message}
        ]
    }
    
    response = openai.ChatCompletion.create(**data)
    return response['choices'][0]['message']['content'].strip()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/listen', methods=['POST'])
def listen():
    """Process voice command, send to AI, execute response."""
    command = process_voice_command()
    if command:
        ai_response = query_groq(command)
        return jsonify({"command": command, "response": ai_response})
    return jsonify({"error": "Could not process voice input."})

if __name__ == '__main__':
    app.run(debug=True)
