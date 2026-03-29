// Quick voice‑capture demo using Web Speech API
// run `node scripts/voice-demo.js` in a browser environment via devtools console

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
recognition.lang = 'en-US'
recognition.onresult = e => {
  console.log('captured text:', e.results[0][0].transcript)
}
recognition.onerror = e => console.error('speech error', e)
recognition.start()
