# Spec: note-name-quiz

เกมแรกของ Piano Quest (D22): จับคู่ชื่อโน้ต solfège (โด เร มี) กับชื่อตัวอักษร (C D E) ให้ตอบเร็วที่สุด เล่นบนเว็บฟรี ไม่เก็บข้อมูล

**Status:** ready-to-build

## Problem

ผู้ใช้เริ่มฝึกเปียโนจากทฤษฎีดนตรี แต่ยังต้องนึกว่า "ซอล คือ G ใช่ไหม" ทุกครั้ง อยากมีเกมสั้นๆ เล่นทุกวันจนจำได้ทันที แบบที่ Monkeytype ทำให้พิมพ์เร็วขึ้น

เว็บฝึกฟรีที่มีอยู่ (musictheory.net, Musicca) ไม่มีชื่อ solfège ภาษาไทย และไม่มีรอบจับเวลาที่ตอบด้วยปุ่มเดียวแล้วปรับ mode ได้เอง (D13)

## Solution

- เล่นรอบสั้นๆ จับคู่ชื่อโน้ตสองระบบ ทั้งทิศโด→C ทิศ C→โด และสลับ (D2)
- เลือกแบบรอบได้ ทั้งจับเวลา ครบจำนวนข้อ หรือ `zen` (D2)
- เลือกตัวอักษร solfège ไทยหรืออังกฤษ (D3)
- ตอบด้วยคีย์บอร์ด หรือแตะปุ่มบนมือถือ (D6, D14)
- ดูผลและเฉลยข้อที่ผิดตอนจบรอบ (D7, D15)
- เปิดเสียงโน้ตเมื่อตอบถูกได้ (D5)

## User Stories

**Player** (ผู้เล่น ดู `CONTEXT.md`)
1. As a Player, I want to choose Mode, length, Direction and Script in the Mode bar, so that I practise the way I like today (D1, D2, D3)
2. As a Player, I want to answer a Prompt by pressing one key, so that I train speed, not typing (D3, D14)
3. As a Player, I want a wrong answer to show clearly and move on, so that the round keeps its pace (D7, D20)
4. As a Player, I want a Results screen with accuracy, speed and every wrong Prompt with its correct Answer, so that I see what to fix (D7, D15)
5. As a Player on a phone, I want 7 tap buttons, so that I can play without a keyboard (D6)
6. As a Player, I want to hear the note when I answer right, so that I link the name to the sound (D5)
7. As a Player, I want to restart instantly with `Tab`, so that I can play again and again (D14)
8. As a Player, I want my Mode bar settings kept in the URL, so that a bookmark opens my usual mode (D16)

## Design

หน้าจอทั้งหมดจัดจาก component มาตรฐานของ shadcn/ui (D9) โทนเรียบ ตัวโจทย์ใหญ่กลางจอ ไอคอนจาก Lucide (D8) สีตามระบบ (D17) สีเน้นเขียวมิ้นต์หนึ่งสีกับ animation สั้นๆ (D31)

| Screen | User stories | Must show | Source |
|---|---|---|---|
| Game | 1, 2, 3, 5, 6, 7, 8 | Mode bar ด้านบน: Mode `time` `count` `zen` กับความยาวของ Mode ที่เลือก (D2), Direction โด→C C→โด สลับ (D2), Script ไทย อังกฤษ (D3), ปุ่มเสียงไอคอน `Volume2` `VolumeX` (D5); กลางจอ: Prompt ปัจจุบันตัวใหญ่ อีก 3 ข้อถัดไปจางๆ (D14, D20); ตัวนับเวลาที่เหลือ (`time`) หรือข้อที่ตอบ เช่น `7/25` (`count`) หรือจำนวนที่ตอบ (`zen`) พร้อมตัวนับผิดเล็กๆ (D20); แถวปุ่มตอบ 7 ปุ่มใต้ Prompt ป้ายเปลี่ยนตาม Direction ของข้อนั้น มีปุ่มลัดเล็กกำกับ (`C` หรือ `1`) (D6); ตอบผิด: Prompt สั่นและกระพริบแดง ปุ่มที่กดขึ้น `X` ชั่วครู่ ไม่บอกเฉลย (D7, D20); ทิศสลับแล้วกดปุ่มผิดชุด: แถวปุ่มกระพริบป้ายปุ่มลัด (D20); ปุ่มเริ่มใหม่ไอคอน `RotateCcw` (D14); ปุ่มจบ ใน `zen` เท่านั้น (D14); ก่อนตอบข้อแรก: ข้อความ "กดปุ่มคำตอบเพื่อเริ่ม" (D14); แถบล่าง: `Tab` เริ่มใหม่, `Esc` จบ (`zen`), `Shift+Tab` ไปที่ Mode bar (D20) | existing components |
| Results | 4, 7 | ถูก ผิด ความแม่น % โน้ตต่อนาที เวลาเฉลี่ยต่อข้อ หรือ `—` เมื่อตอบไม่ถึง 2 ข้อหรือเวลาที่ใช้เป็น 0 (D15, D20, D25); Mode Direction Script ที่เล่น; รายการข้อที่ผิด: Prompt สิ่งที่ตอบ คำตอบที่ถูก (D7); ไม่ผิดเลย → ข้อความ "ไม่ผิดสักข้อ"; ปุ่มเล่นอีกรอบไอคอน `RotateCcw` และ `Tab` (D14) | existing components |

## Expected Outcome

ผู้ใช้เปิดเว็บจากมือถือหรือคอม เล่นรอบ 30 วินาทีได้ทันที แล้วเห็นว่ารอบนี้เร็วและแม่นแค่ไหน พร้อมเฉลยข้อที่ผิด

- **รอบ `time` 30 วินาที ทิศโด→C:** โจทย์ "ซอล" กด `G` → ข้อต่อไปขึ้น ครบ 30 วินาที → หน้า Results
- **ตอบผิด:** โจทย์ "เร" กด `E` → สั่น กระพริบแดง ตัวนับผิดเพิ่ม ไปข้อต่อไป Results แสดง "เร — ตอบ E — ถูก D"
- **มือถือ:** แตะปุ่ม `G` บนจอ → เหมือนกด `G`
- **คีย์บอร์ดภาษาไทย:** ปุ่มเดียวกับ `G` บนคีย์บอร์ดตอบเป็น `G` ได้ (D14)

**How success is judged:**
- seam 1 และ seam 2 ผ่านใน CI
- เปิด `https://mousemouse094526.github.io/piano-quest/` แล้วเล่นครบหนึ่งรอบได้ทั้ง Chrome เดสก์ท็อปและ Safari บน iPhone
- iPhone เปิดโหมดเงียบ เปิดเสียงในเกม ตอบถูก → ได้ยินเสียงโน้ต (ตรวจด้วยมือ) (D20)
- refresh หน้าที่มี search params แล้ว Mode bar ยังเป็นค่าเดิม (D16)
- DevTools › Application ไม่มีข้อมูลใน Local Storage Session Storage IndexedDB หรือ Cookies ของเว็บนี้ (D4)

## Implementation

### Modules touched

แอปเดียว ไม่มี workspace โฟลเดอร์ตาม conventions ที่ตั้งตอนตัด ticket (D21)

- **`src/features/note-name-quiz/engine`**
  - pure TypeScript ไม่ import React หรือ DOM
  - ถือกติกาทั้งหมด: สร้าง Prompt, ตรวจ Answer, จบรอบ, คิดผล (D2, D7, D14, D15, D20)
  - random แบบมี seed เขียนเอง (D21)
- **`src/features/note-name-quiz/components`**
  - Mode bar, Game, Results, ปุ่มตอบ 7 ปุ่ม
  - listener เดียวบน `window` แปลง `KeyboardEvent.code` เป็น `Choice` ตามกติกาปุ่มและ focus (D14, D20)
  - ปุ่มแตะส่ง `Choice` ทางเดียวกัน ปุ่มไม่รับ focus (D6, D20)
- **`src/features/note-name-quiz/sound`**
  - สร้าง `AudioContext` ตอนกดเปิดเสียง เล่นเสียงสั้นหลัง engine อัปเดต ความผิดพลาดทุกอย่างถูกกลืน (D5, D20)
- **`src/routes`**
  - route `/` เดียว แบบ code-based อ่านค่า Mode bar จาก search params (D11, D16, D21)
  - seed ของแต่ละรอบจาก `crypto.getRandomValues` (D21)
- **ops**
  - GitHub Actions: ตรวจ แล้ว build แล้ว deploy ขึ้น GitHub Pages (D10, D22)

### Data

ข้อมูลโน้ตตายตัว 7 ตัว (D12) ไม่มีข้อมูลที่เก็บ (D4)

| Index | Letter | Thai | English | ปุ่มลัด letter | ปุ่มลัด solfège | Hz |
|---|---|---|---|---|---|---|
| 1 | C | โด | Do | `KeyC` | `Digit1` `Numpad1` | 261.63 |
| 2 | D | เร | Re | `KeyD` | `Digit2` `Numpad2` | 293.66 |
| 3 | E | มี | Mi | `KeyE` | `Digit3` `Numpad3` | 329.63 |
| 4 | F | ฟา | Fa | `KeyF` | `Digit4` `Numpad4` | 349.23 |
| 5 | G | ซอล | Sol | `KeyG` | `Digit5` `Numpad5` | 392.00 |
| 6 | A | ลา | La | `KeyA` | `Digit6` `Numpad6` | 440.00 |
| 7 | B | ที | Ti | `KeyB` | `Digit7` `Numpad7` | 493.88 |

- ทิศโด→C: Prompt เป็นชื่อ solfège ตาม Script ตอบด้วยปุ่มลัด letter
- ทิศ C→โด: Prompt เป็นตัวอักษร ตอบด้วยปุ่มลัด solfège
- ทิศสลับ: สุ่มทิศทุกข้อ "ห้ามซ้ำข้อก่อนหน้า" หมายถึงโน้ตตัวเดียวกันไม่ว่าทิศไหน (D14) ปุ่มผิดชุดไม่นับ (D20)

### Search params

| Param | ค่าที่รับ | ค่าเริ่มต้น |
|---|---|---|
| `mode` | `time` `count` `zen` | `time` |
| `len` | `time`: 15 30 60 120 ; `count`: 10 25 50 100 ; `zen`: ไม่ใช้ | 30 หรือ 25 ตาม `mode` |
| `dir` | `solfege-to-letter` `letter-to-solfege` `mixed` | `solfege-to-letter` |
| `script` | `th` `en` | `th` |
| `sound` | `on` `off` | `off` |

- `validateSearch` เขียน fallback เอง ค่าผิดหรือไม่มี → ค่าเริ่มต้นของ param นั้น ไม่แสดง error (D16, D21)
- เปลี่ยนค่าใน Mode bar → `navigate` แบบ `replace` (ไม่เพิ่ม history) แล้วเริ่มรอบใหม่ (D14)
- ยกเว้น `sound`: แทนที่ URL อย่างเดียว รอบเดิมเล่นต่อ (D20)

### Engine contract

engine เป็น reducer `(state, event) => state` บวกฟังก์ชันคิดผล สัญญานี้คือ decision (D18, D20)

```ts
type Note = 1 | 2 | 3 | 4 | 5 | 6 | 7;            // spec.md › Data › Index
type Direction = 'solfege-to-letter' | 'letter-to-solfege' | 'mixed';
type Settings =
  | { mode: 'time'; len: 15 | 30 | 60 | 120; dir: Direction }
  | { mode: 'count'; len: 10 | 25 | 50 | 100; dir: Direction }
  | { mode: 'zen'; dir: Direction };
type Prompt = { note: Note; ask: 'solfege' | 'letter' }; // ask = what is shown
type Choice = { kind: 'letter' | 'solfege'; note: Note }; // kind = key set used
type Miss = { prompt: Prompt; answered: Note };
type Event =
  | { type: 'start'; settings: Settings; seed: number }
  | { type: 'answer'; choice: Choice; now: number }   // ms
  | { type: 'tick'; now: number }
  | { type: 'end'; now: number };
type RoundState = {
  status: 'ready' | 'running' | 'finished';
  settings: Settings;
  current: Prompt;
  upcoming: [Prompt, Prompt, Prompt];
  correct: number;
  misses: Miss[];
  startedAt: number | null;   // time of first answer
  lastAnswerAt: number | null;
  endedAt: number | null;     // finish time used for Results
  rngState: number;
};
type Results = {
  correct: number;
  wrong: number;
  accuracy: number;                 // integer %
  notesPerMinute: number | null;    // null → show "—"
  secondsPerAnswer: number | null;  // 2 decimals, null → show "—"
  misses: Miss[];
};
```

| Event | ผลต่อสถานะ |
|---|---|
| `start` | `ready` สร้าง `current` กับ `upcoming` จาก `seed` ยังไม่นับเวลา |
| `answer` `kind` ไม่ตรงกับชุดที่ `current.ask` ต้องการ | ไม่เปลี่ยน |
| `answer` ข้อแรก | `startedAt = now` สถานะ `running` แล้วตรวจเหมือนข้อถัดไป |
| `answer` `time` และ `now >= startedAt + len × 1000` | `finished`, `endedAt = startedAt + len × 1000` คำตอบนี้ไม่นับ (D20) |
| `answer` ถูก | `correct + 1` เลื่อน Prompt `count` ครบ `len` → `finished`, `endedAt = now` |
| `answer` ผิด | เพิ่ม `Miss` เลื่อน Prompt เงื่อนไขครบ `len` เหมือนข้อถูก (D7) |
| `tick` `time` และ `now >= deadline` | `finished`, `endedAt = deadline` |
| `end` `zen` ตอบแล้ว | `finished`, `endedAt = now` |
| `end` ยังไม่ตอบ | กลับ `ready` (D15) |
| ทุก event หลัง `finished` ยกเว้น `start` | ไม่เปลี่ยน |

เวลาที่ใช้ = `endedAt − startedAt` ; ตอบไม่ถึง 2 ข้อ หรือเวลาที่ใช้เป็น 0 → `notesPerMinute` และ `secondsPerAnswer` เป็น `null` (D20, D25) สูตรอื่นตาม D15

### Content rules

จาก [legal.md](legal.md) item 1 และ 2

- ข้อความ คำอธิบาย และคำสั่งทั้งหมดเขียนเอง ไม่คัดลอกจากเว็บสอนดนตรี (D13)
- รูป เสียง และ font สร้างเองหรือมี license เปิด เสียงสังเคราะห์ (D5)
- ไม่ใช้ชื่อ โลโก้ ชุดสี หรือ code ของ Monkeytype ใช้ theme ค่าเริ่มต้นของ shadcn/ui กับสีเน้นเขียวมิ้นต์ของเราเอง (D1, D9, D31)

### Library assumptions

| Library | Version | The plan needs | Docs |
|---|---|---|---|
| react | 19.3.1 | React 19 SPA | [react.dev](https://react.dev/learn) |
| vite | 8.3.6 | ตั้ง `base` สำหรับ deploy ใต้ path `/piano-quest/` | [Vite static deploy › GitHub Pages](https://vite.dev/guide/static-deploy#github-pages) |
| @tanstack/react-router | 1.170.46 | `createHashHistory` ทำงานบน static host โดยไม่ต้องใช้ `404.html` | [History types](https://tanstack.com/router/latest/docs/framework/react/guide/history-types) |
| @tanstack/react-router | 1.170.46 | `validateSearch` รับ object ดิบ คืนค่าที่เราตรวจและเติม fallback เอง | [Search params](https://tanstack.com/router/latest/docs/framework/react/guide/search-params) |
| @tanstack/react-router | 1.170.46 | `navigate({ search, replace: true })` แทนที่ URL โดยไม่เพิ่ม history | [Navigation](https://tanstack.com/router/latest/docs/framework/react/guide/navigation) |
| @tanstack/react-router | 1.170.46 | code-based route สร้าง route ด้วย `createRootRoute` และ `createRoute` | [Code-based routing](https://tanstack.com/router/latest/docs/framework/react/routing/code-based-routing) |
| tailwindcss | 4.3.5 | Tailwind v4 กับ Vite plugin | [Tailwind with Vite](https://tailwindcss.com/docs/installation/using-vite) |
| shadcn | 4.23.0 | CLI ติดตั้ง component ในโปรเจกต์ Vite | [shadcn/ui Vite installation](https://ui.shadcn.com/docs/installation/vite) |
| lucide-react | 1.70.0 | ไอคอน `Volume2` `VolumeX` `RotateCcw` `X` เป็น React component | [lucide-react](https://lucide.dev/guide/packages/lucide-react) |
| vitest | 5.1.0 | unit test ของ engine บน Node | [Vitest guide](https://vitest.dev/guide/) |
| @playwright/test | 1.65.0 | e2e บน Chromium และ WebKit พร้อม device `iPhone` | [Playwright emulation](https://playwright.dev/docs/emulation) |
| @biomejs/biome | ตอนติดตั้ง | `biome ci .` ตรวจ lint และ format | [Biome CI](https://biomejs.dev/recipes/continuous-integration/) |
| Web Audio API | browser | `OscillatorNode` กับ `GainNode` เล่นเสียงสั้น `AudioContext` ต้องสร้างหรือ `resume()` หลัง user gesture | [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API), [Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) |
| Audio Session API | browser | `navigator.audioSession.type = 'playback'` ให้เสียงดังตอน iPhone เปิดโหมดเงียบ ใช้เมื่อมี property นี้เท่านั้น | [Audio Session](https://w3c.github.io/audio-session/) |
| KeyboardEvent | browser | `code` บอกปุ่มจริงไม่ขึ้นกับภาษาคีย์บอร์ด และมี `repeat` `isComposing` | [KeyboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent) |

### Ops

| Step | ทำอะไร |
|---|---|
| trigger | push `main` และ pull request |
| check | `biome ci .`, typecheck, `vitest run`, Playwright, build |
| deploy | เฉพาะ push `main`: upload `dist` ด้วย `actions/upload-pages-artifact` แล้ว `actions/deploy-pages` (D10, D22) |
| ตั้งค่า repo | Settings › Pages › Source = GitHub Actions (ผู้ใช้ทำเอง ครั้งเดียว) |
| ปิดเว็บ | Settings › Pages › Unpublish หรือ revert commit แล้ว push |

## Seams

engine ถือกติกาทั้งหมด ส่วน UI พิสูจน์ด้วย e2e หนึ่ง flow (D18)

1. **Game engine** `src/features/note-name-quiz/engine` reducer และ `results()`
   - `count` 10 ตอบถูก 10 ข้อ → `finished` ความแม่น 100
   - `count` 10 ผิด 3 ข้อ → 3 `Miss` แต่ละตัวมี Prompt สิ่งที่ตอบ คำตอบที่ถูก ความแม่น 70
   - `count` 10 ตอบทุก 1000 ms (ข้อแรก t=0 ข้อสุดท้าย t=9000) ถูกหมด → โน้ตต่อนาที 67 เวลาเฉลี่ย 0.90
   - `time` 15 ตอบข้อแรก t=0 แล้ว `tick` t=15000 → `finished` `endedAt` 15000
   - `time` 15 ตอบข้อแรก t=0 แล้ว `answer` t=16000 → `finished` `endedAt` 15000 คำตอบที่ t=16000 ไม่นับ
   - `time` ยังไม่ตอบ `tick` เวลาใดก็ได้ → ยัง `ready`
   - `zen` `end` หลังตอบ 5 ข้อ → `finished` ; `end` หลังตอบ 1 ข้อ → ความเร็วเป็น `null` ; `end` ก่อนตอบ → `ready`
   - seed เดียวกัน → ลำดับ Prompt เดียวกัน
   - 1000 ข้อทุก Direction รวม `mixed` → ไม่มีโน้ตซ้ำติดกัน
   - `mixed` ส่ง `Choice` `kind` ผิดชุด → สถานะไม่เปลี่ยน ไม่นับผิด
   - event หลัง `finished` → สถานะไม่เปลี่ยน
2. **Play one round** (e2e) หน้า `/` บน Chromium เดสก์ท็อป และ WebKit device `iPhone`
   - เปิด `/#/?mode=count&len=10` กดปุ่มลัดตอบ 10 ข้อ ผิด 2 ข้อ → ตัวนับผิดเป็น 2 ระหว่างเล่น หน้า Results แสดงผิด 2 และเฉลย 2 รายการ
   - ตอบผิด → Prompt มีสถานะผิดที่มองเห็นได้ (สั่นหรือ `X`)
   - กด `G` ค้าง → ตอบแค่ 1 ข้อ
   - viewport iPhone แตะปุ่มบนจอครบ 10 ข้อ → หน้า Results
   - กด `Tab` กลางรอบ → กลับไปข้อความ "กดปุ่มคำตอบเพื่อเริ่ม" focus ไม่ย้าย
   - กด `Tab` ที่หน้า Results → หน้า Game ข้อใหม่ ยังไม่นับเวลา
   - `zen` ตอบ 3 ข้อแล้วกด `Esc` → หน้า Results
   - เปลี่ยน Script เป็นอังกฤษ → URL มี `script=en` Prompt เป็น Do Re Mi ; refresh → ยังเป็นอังกฤษ
   - เปิด `sound=on` กลางรอบ → ตัวนับไม่รีเซ็ต ; ตอบถูก → ไม่มี error ใน console
   - จบรอบแล้ว Local Storage Session Storage และ Cookies ว่าง

## Testing decisions

- **Copy:** ยังไม่มี test ในโปรเจกต์ ticket แรกตั้ง pattern ตาม conventions (D21)
- engine ทดสอบด้วย unit test เท่านั้น ส่ง `now` และ `seed` เข้าไป ไม่ใช้ timer จริง
- e2e ฟังเสียงไม่ได้ ทดสอบแค่ว่าไม่มี error ใน console การได้ยินเสียงบน iPhone ตรวจด้วยมือ

## Out of Scope

- ชาร์ป แฟลต และ movable Do (D12)
- เกมถัดไปในหลักสูตร: ตำแหน่งบนคีย์บอร์ด อ่านโน้ตบนบรรทัด interval scale chord — แต่ละเกมเป็น feature ใหม่ (D13)
- สถิติข้ามรอบ คะแนนดีสุด บัญชี leaderboard (D4)
- ปุ่มสลับธีม (D17)
- Figma หรือ design แยก (D9)

## Open Questions

None.

## Sources

- [musictheory.net exercises](https://www.musictheory.net/exercises) — เว็บฝึกฟรีที่มีอยู่ (accessed 2026-11-07)
- [Musicca note identification](https://www.musicca.com/note-identification) — เว็บฝึกฟรีที่มีอยู่ (accessed 2026-11-07)
- [react.dev](https://react.dev/learn) — React (accessed 2026-11-07)
- [Vite static deploy › GitHub Pages](https://vite.dev/guide/static-deploy#github-pages) — ตั้ง `base` (accessed 2026-11-07)
- [TanStack Router history types](https://tanstack.com/router/latest/docs/framework/react/guide/history-types) — `createHashHistory` (accessed 2026-11-07)
- [TanStack Router search params](https://tanstack.com/router/latest/docs/framework/react/guide/search-params) — `validateSearch` (accessed 2026-11-07)
- [TanStack Router navigation](https://tanstack.com/router/latest/docs/framework/react/guide/navigation) — `replace` (accessed 2026-11-07)
- [TanStack Router code-based routing](https://tanstack.com/router/latest/docs/framework/react/routing/code-based-routing) — route แบบ code (accessed 2026-11-07)
- [Tailwind with Vite](https://tailwindcss.com/docs/installation/using-vite) — ติดตั้ง Tailwind v4 (accessed 2026-11-07)
- [shadcn/ui Vite installation](https://ui.shadcn.com/docs/installation/vite) — ติดตั้ง shadcn/ui (accessed 2026-11-07)
- [lucide-react](https://lucide.dev/guide/packages/lucide-react) — ไอคอน (accessed 2026-11-07)
- [Vitest guide](https://vitest.dev/guide/) — unit test (accessed 2026-11-07)
- [Playwright emulation](https://playwright.dev/docs/emulation) — device `iPhone` (accessed 2026-11-07)
- [Biome CI](https://biomejs.dev/recipes/continuous-integration/) — `biome ci` (accessed 2026-11-07)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) — สังเคราะห์เสียง (accessed 2026-11-07)
- [Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) — เสียงต้องเริ่มหลัง user gesture (accessed 2026-11-07)
- [Audio Session](https://w3c.github.io/audio-session/) — เสียงตอนโหมดเงียบ (accessed 2026-11-07)
- [KeyboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent) — `code` `repeat` `isComposing` (accessed 2026-11-07)
