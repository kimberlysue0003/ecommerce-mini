// src/constants/synonyms.ts
// Synonym dictionary for product similarity matching

export const SYNONYMS: Record<string, string[]> = {
  headphones: ["headset", "earphone", "audio"],
  headset: ["headphones", "earphone", "audio"],
  bluetooth: ["wireless"],
  wireless: ["bluetooth"],
  keyboard: ["kb", "keyboards"],
  mechanical: ["mech"],
  mouse: ["mice", "pointer"],
  speaker: ["soundbar", "audio"],
  soundbar: ["speaker", "audio"],
  webcam: ["camera", "video"],
  microphone: ["mic", "audio"],
  mic: ["microphone", "audio"],
  monitor: ["display", "screen"],
  display: ["monitor", "screen"],
  screen: ["monitor", "display"],
  chair: ["office", "ergonomic"],
  ergonomic: ["chair", "office"],
  office: ["chair", "ergonomic"],
};
