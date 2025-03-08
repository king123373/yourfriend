import speech_recognition as sr
import pyttsx3
import os

engine = pyttsx3.init()
recognizer = sr.Recognizer()

def speak(text):
    """Speak out the given text."""
    engine.say(text)
    engine.runAndWait()

def execute_command(command):
    """Execute system commands based on recognized speech."""
    if "open chrome" in command:
        os.system("start chrome")  # Windows
        return "Opening Chrome"
    elif "open notepad" in command:
        os.system("notepad")
        return "Opening Notepad"
    elif "exit" in command:
        return "Exiting assistant."
    else:
        return "Command not recognized."

def process_voice_command():
    """Listen to the user's voice and process commands."""
    with sr.Microphone() as source:
        recognizer.adjust_for_ambient_noise(source)
        print("Listening...")
        try:
            audio = recognizer.listen(source, timeout=5)
            command = recognizer.recognize_google(audio).lower()
            print("You said:", command)
            response = execute_command(command)
            speak(response)
            return response
        except sr.UnknownValueError:
            return "Sorry, I couldn't understand."
        except sr.RequestError:
            return "Error connecting to speech recognition service."
