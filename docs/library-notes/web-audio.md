# Web Audio API

**Kind:** browser API

**Version:** Web Audio API (MDN, checked 2026-11-07)

**Docs:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

## Best practices

- Create or resume the `AudioContext` inside a user gesture (`click`, `pointerup`, `keydown`). A context made inside the handler starts `running`; one made earlier starts `suspended` — [Best practices › Autoplay policy](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices#autoplay_policy)
- Keep one `AudioContext` for the app and reuse it for every note. `close()` releases system audio resources, and a closed context cannot run again — [AudioContext.close](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/close)
- Before playing, check `state` and call `resume()` when it is not `'running'`. `'interrupted'` (iOS: the user left the page or locked the screen) also needs `resume()` — [BaseAudioContext.state](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state), [resume](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/resume)
- One short note is one `OscillatorNode` → `GainNode` → `destination`. Source nodes are single-use; create new ones per note — [OscillatorNode](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode), [Using the Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API)
- Shape gain with `AudioParam` scheduling, not `gain.value =`. Anchor with `setValueAtTime(0.0001, t)`, ramp up and down with `exponentialRampToValueAtTime`, then `stop(t + duration)` at the end of the release. Starting and ending near zero avoids clicks — [setValueAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setValueAtTime), [exponentialRampToValueAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/exponentialRampToValueAtTime)
- Schedule from `context.currentTime`, not `Date.now()` or `performance.now()` — [Best practices › Scheduling](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- Clean up in `onended`: call `disconnect()` on the oscillator and gain. `ended` fires once the `stop()` time is reached — [ended event](https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/ended_event), [AudioNode.disconnect](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/disconnect)
- On iOS, set `navigator.audioSession.type = 'playback'` before the first sound. Under the default `'auto'`, a page using only an `AudioContext` gets `'ambient'`, which obeys the silent switch — [Audio Session API](https://developer.mozilla.org/en-US/docs/Web/API/Audio_Session_API), [Audio Session spec › 6.1](https://w3c.github.io/audio-session/), [WebKit bug 251532](https://bugs.webkit.org/show_bug.cgi?id=251532)
- Feature-detect both: `'AudioContext' in window` and `'audioSession' in navigator`. `navigator.audioSession` is Safari and iOS Safari only (no Chrome) and marked experimental — [Navigator.audioSession](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/audioSession)
- Use `latencyHint: 'interactive'` (the default) for sounds that answer a tap — [AudioContext()](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext)
- **Avoid:** `exponentialRampToValueAtTime(0, ...)`; it throws `RangeError`. Use a small positive value such as `0.0001`, or `setTargetAtTime(0, ...)` — [exponentialRampToValueAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/exponentialRampToValueAtTime), [spec › AudioParam](https://webaudio.github.io/web-audio-api/#dom-audioparam-exponentialramptovalueattime)
- **Avoid:** `webkitAudioContext`; iOS Safari has had unprefixed `AudioContext` since 14.5 and removed the prefix then — [AudioContext › Browser compatibility](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext#browser_compatibility)

## Pattern

```ts
// src/features/note-name-quiz/sound/notePlayer.ts (shape)
type NavigatorWithAudioSession = Navigator & { audioSession?: { type: string } };

const SILENT = 0.0001;

export function playNote(ctx: AudioContext, hz: number, seconds = 0.4) {
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(hz, t);
  gain.gain.setValueAtTime(SILENT, t);
  gain.gain.exponentialRampToValueAtTime(0.3, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(SILENT, t + seconds);
  osc.connect(gain).connect(ctx.destination);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
  osc.start(t);
  osc.stop(t + seconds);
}

/** Call inside the tap or key press that turns sound on. */
export function makeContext(): AudioContext | null {
  try {
    const { audioSession } = navigator as NavigatorWithAudioSession;
    if (audioSession) audioSession.type = 'playback';
    return new AudioContext();
  } catch {
    return null;
  }
}
```

The real code is `src/features/note-name-quiz/sound/notePlayer.ts`. Follows [Best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices).

## Traps

- If the start value is 0, an exponential ramp holds 0 for the whole segment and the note is silent. Anchor at `0.0001`, not `0` — [spec › exponentialRampToValueAtTime](https://webaudio.github.io/web-audio-api/#dom-audioparam-exponentialramptovalueattime)
- `resume()` does not reject when autoplay blocks it. The promise stays pending until a gesture allows the start. It rejects with `InvalidStateError` only when the context is closed or the document is not fully active. No `NotAllowedError` comes from Web Audio — [spec › resume()](https://webaudio.github.io/web-audio-api/#dom-audiocontext-resume)
- `NotAllowedError` belongs to `HTMLMediaElement.play()`, not to `AudioContext`. A blocked context just stays `'suspended'` — [Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- What throws: `new AudioContext()` throws `ReferenceError` where the API is missing (Node, Vitest's `node` environment, Windows WebKit), `NotSupportedError` for an unsupported `sampleRate`, and `InvalidStateError` if the document is not fully active. Wrap creation in `try` — [AudioContext()](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext), [spec › AudioContext constructor](https://webaudio.github.io/web-audio-api/#AudioContext-constructors)
- `start()` twice on one node throws `InvalidStateError`; `stop()` before `start()` throws `InvalidStateError`; a negative time throws `RangeError` — [spec › AudioScheduledSourceNode](https://webaudio.github.io/web-audio-api/#AudioScheduledSourceNode), [stop](https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/stop)
- `cancelScheduledValues` jumps back to the pre-automation value and can click; `cancelAndHoldAtTime` holds the current value instead — [spec › AudioParam](https://webaudio.github.io/web-audio-api/#AudioParam)
- MDN's compat data lists `navigator.audioSession.type` from Safari and iOS Safari 16.4, but WebKit says setting `'playback'` only fixes the silent switch from iOS 17. Treat it as iOS 17+ for that effect — [Navigator.audioSession](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/audioSession), [WebKit bug 251532](https://bugs.webkit.org/show_bug.cgi?id=251532)
- `'transient'` and `'transient-solo'` do not get past the silent switch; only `'playback'` (or `'play-and-record'`) does — [WebKit bug 264473](https://bugs.webkit.org/show_bug.cgi?id=264473)
- `'playback'` does not mix: it can pause music the player has running in another app. Set it only when the player turns sound on — [Audio Session spec › 3.1](https://w3c.github.io/audio-session/)
- `navigator.getAutoplayPolicy('audiocontext')` exists only in Firefox (112+). Do not rely on it; check `ctx.state` instead — [Navigator.getAutoplayPolicy](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getAutoplayPolicy)
- Playwright's Linux WebKit and headless runs may not output sound; do not assert on audio in e2e (see [playwright.md](playwright.md))

## Sources

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) and [Best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) — gesture, scheduling (accessed 2026-11-07)
- [AudioContext()](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext), [close](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/close), [resume](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/resume), [state](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state) — lifecycle (accessed 2026-11-07)
- [exponentialRampToValueAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/exponentialRampToValueAtTime), [ended event](https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/ended_event) — envelope, cleanup (accessed 2026-11-07)
- [Web Audio API spec (editor's draft)](https://webaudio.github.io/web-audio-api/) — exceptions, ramp from 0, `resume()` steps (accessed 2026-11-07)
- [Audio Session API](https://developer.mozilla.org/en-US/docs/Web/API/Audio_Session_API), [Audio Session spec](https://w3c.github.io/audio-session/), `@mdn/browser-compat-data` 8.1.8 — types, support (accessed 2026-11-07)
- [Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) — gestures, `getAutoplayPolicy` (accessed 2026-11-07)
- [WebKit bug 251532](https://bugs.webkit.org/show_bug.cgi?id=251532), [WebKit bug 264473](https://bugs.webkit.org/show_bug.cgi?id=264473) — silent switch behaviour (accessed 2026-11-07)
