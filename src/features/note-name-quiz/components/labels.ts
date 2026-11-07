import { NOTES } from '../engine/notes';
import type { Prompt } from '../engine/types';

export function promptLabel(prompt: Prompt): string {
  const info = NOTES[prompt.note];
  return prompt.ask === 'solfege' ? info.th : info.letter;
}
