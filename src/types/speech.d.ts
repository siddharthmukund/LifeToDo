// Web Speech API type declarations
// TypeScript's lib.dom.d.ts includes SpeechRecognition in newer versions,
// but event types can be inconsistently named across TS versions.
// This file ensures stable types for all TS 5.x releases.

interface SpeechRecognitionResultItem {
  readonly transcript: string
  readonly confidence: number
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean
  readonly length: number
  item(index: number): SpeechRecognitionResultItem
  [index: number]: SpeechRecognitionResultItem
  [Symbol.iterator](): Iterator<SpeechRecognitionResultItem>
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
  [Symbol.iterator](): Iterator<SpeechRecognitionResult>
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string
  readonly message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  grammars: SpeechGrammarList
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onaudioend: ((this: SpeechRecognition, ev: Event) => unknown) | null
  onaudiostart: ((this: SpeechRecognition, ev: Event) => unknown) | null
  onend: ((this: SpeechRecognition, ev: Event) => unknown) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown) | null
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null
  onsoundend: ((this: SpeechRecognition, ev: Event) => unknown) | null
  onsoundstart: ((this: SpeechRecognition, ev: Event) => unknown) | null
  onspeechend: ((this: SpeechRecognition, ev: Event) => unknown) | null
  onspeechstart: ((this: SpeechRecognition, ev: Event) => unknown) | null
  onstart: ((this: SpeechRecognition, ev: Event) => unknown) | null
  abort(): void
  start(): void
  stop(): void
}

declare let SpeechRecognition: {
  prototype: SpeechRecognition
  new(): SpeechRecognition
}

interface SpeechGrammar {
  src: string
  weight: number
}

declare let SpeechGrammar: {
  prototype: SpeechGrammar
  new(): SpeechGrammar
}

interface SpeechGrammarList {
  readonly length: number
  addFromString(string: string, weight?: number): void
  addFromURI(src: string, weight?: number): void
  item(index: number): SpeechGrammar
  [index: number]: SpeechGrammar
}

declare let SpeechGrammarList: {
  prototype: SpeechGrammarList
  new(): SpeechGrammarList
}
