# Page Summarizer Chrome Extension

A Chrome extension that generates AI-powered audio summaries of web pages using the AI SDK and ElevenLabs text-to-speech.

## Installation

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/nicoalbanese/ai-sdk-chrome-extension-template.git
   cd ai-sdk-chrome-extension-template
   ```

2. **Configure API endpoint**

   Edit `extension/content.js`:
   ```javascript
   API_ENDPOINT: 'http://localhost:3000/api/summarize', // Development
   // API_ENDPOINT: 'https://your-api.vercel.app/api/summarize', // Production
   ```

3. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `extension` directory

## Usage

1. **Navigate to any article or blog post**
2. **Click the extension icon** in the Chrome toolbar
3. **Click "Generate trailer"** button that appears below the main heading
4. **Listen to the summary** using the audio player controls

### Playback Controls

- **Play/Pause** - Center button or spacebar when player is focused
- **Skip Backward** - Left arrow or rewind button (10 seconds)
- **Skip Forward** - Right arrow or forward button (10 seconds)
- **Seek** - Click anywhere on the waveform


## License

MIT License

## Learn More

- [AI SDK](https://ai-sdk.dev/) for AI integration
- [ElevenLabs](https://elevenlabs.io/) for text-to-speech