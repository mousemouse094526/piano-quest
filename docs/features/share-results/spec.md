# Spec: share-results

Player กดปุ่ม "แชร์ผล" บนหน้า Results แล้วส่งสรุป Round นั้นเป็นข้อความเข้า LINE หรือแอปอื่นได้ โดยแอปไม่เก็บอะไรเลย

**Status:** ready-to-build

## Problem

ครูแพร (persona ใน user trial 2026-11-09 F2) อยากส่งผลรอบของนักเรียนให้ผู้ปกครองทาง LINE แต่ทำไม่ได้

> "ทางเดียวที่ทำได้คือแคปหน้าจอแล้วส่งรูปเอง และต้องแคปก่อนปิดหรือรีเฟรชหน้า ไม่อย่างนั้นผลหาย"

Piano Quest ไม่เก็บผลไว้ที่ไหน (ADR-0001) จึงไม่มีหน้าโปรไฟล์หรือลิงก์ผลให้ส่ง

## Solution

- หน้า Results ทุก Mode มีปุ่ม "แชร์ผล" กดด้วยเมาส์ นิ้ว หรือปุ่ม `S` ได้ (D2, D7)
- กดแล้วได้ Share text ที่สรุปค่าตั้ง ตัวเลขทั้ง 5 ข้อที่ผิด และลิงก์เล่นค่าเดียวกัน (D1, D4)
- บนมือถือเปิด share sheet ของเครื่อง บนจอใหญ่คัดลอกข้อความให้วางเอง (D3)
- แชร์หรือคัดลอกไม่ได้ → เห็น Share text ในกล่องให้เลือกคัดลอกเอง ไม่ต้องแคปหน้าจอ (D7)

## User Stories

**ครู**
1. As a ครู, I want ส่งผลรอบของนักเรียนเป็นข้อความเข้า LINE ได้จากหน้า Results, so that ผู้ปกครองเห็นผลโดยไม่ต้องแคปหน้าจอ (D1, D3)
2. As a ครู, I want ข้อความมีข้อที่นักเรียนตอบผิดพร้อมเฉลย, so that ผู้ปกครองรู้ว่าเด็กสับสนโน้ตตัวไหน (D4, D7)
3. As a ครู, I want ข้อความมีลิงก์ที่เปิดแล้วได้ค่าตั้งเดิม, so that เด็กฝึกต่อที่บ้านด้วยค่าเดียวกันได้ (D4)

**Player**
4. As a Player, I want แชร์ผลได้ทุก Mode รวม `zen`, so that ไม่ต้องเลือก Mode เพื่อให้แชร์ได้ (D2)
5. As a Player, I want รู้ว่ากดแล้วคัดลอกสำเร็จหรือไม่ และได้ข้อความแม้คัดลอกไม่ได้, so that ไม่ต้องลองวางดูเองหรือแคปจอ (D3, D7)
6. As a Player ที่ใช้คีย์บอร์ดล้วน, I want กด `S` เพื่อแชร์ผล, so that ไม่ต้องจับเมาส์ (D7)

## Design

ไม่ทำ design แยก ใช้ component ของ shadcn ที่มีอยู่ (note-name-quiz D9)

| Screen | User stories | Must show | Source |
|---|---|---|---|
| Results | 1, 2, 3, 4, 5, 6 | ปุ่ม `Button` outline ขนาด `lg` ไอคอน `Share2` ข้อความ "แชร์ผล" ป้าย `Kbd` `S` ข้างปุ่ม "เล่นอีกรอบ" (D2, D7) ; ป้าย `S` ซ่อนบนจอสัมผัสแบบเดียวกับป้ายอื่น (D7) ; ปุ่มไม่รับ focus ทั้งจาก `Tab` และคลิก (note-name-quiz D26) ; ระหว่าง share sheet เปิด: ปุ่มกดไม่ได้ (D7) ; คัดลอกแล้ว: "คัดลอกผลแล้ว" หายเองหลัง 2 วินาที (D3) ; share sheet ล้มหรือคัดลอกไม่ได้: กล่องข้อความอ่านอย่างเดียวที่มี Share text ทั้งหมด หัวกล่อง "คัดลอกข้อความนี้ไปส่งเองได้" อยู่จนเริ่มรอบใหม่ (D7) ; region `aria-live="polite"` อยู่ตลอดหน้า ข้อความใหม่ทุกครั้งที่กด (D7) ; share sheet ถูกปิดเอง: ไม่แสดงอะไร (D3) | existing components |

## Expected Outcome

ครูส่งผลรอบเข้า LINE ได้ในหนึ่งแตะบนมือถือ หรือคลิกแล้ววางบน desktop โดยไม่ต้องแคปหน้าจอ

- **ครูบน iPhone จบ `count` 10:** แตะ "แชร์ผล" แล้ว share sheet ขึ้นพร้อม Share text เลือก LINE แล้วส่งได้เลย
- **ครูบน desktop จบ `time` 60:** คลิก "แชร์ผล" หรือกด `S` เห็น "คัดลอกผลแล้ว" วางใน LINE desktop ได้ข้อความเต็ม
- **เครื่องที่คัดลอกไม่ได้:** เห็นกล่องที่มี Share text ให้เลือกคัดลอกเอง
- **ผู้ปกครองกดลิงก์ในข้อความ:** เปิดหน้าเกมที่ค่าตั้งเหมือนรอบนั้น

**How success is judged:**
- Share text ของ Round ตัวอย่างแรกใน [sketch-share-text.md](sketch-share-text.md) ตรงตัวอักษรต่อตัวอักษรกับที่ test คาด เมื่อส่ง URL เดียวกับ sketch
- e2e บน `Desktop Chrome` ได้ข้อความที่คัดลอกซึ่งมี Share text และเปิดลิงก์ในนั้นแล้ว Mode bar ตรงกับรอบเดิม
- e2e บน `iPhone 15` ได้ `navigator.share` ที่ถูกเรียกด้วย Share text
- e2e ไม่เห็น request ใหม่ตั้งแต่หน้า Results ขึ้นจนกดแชร์เสร็จ
- `src/no-player-data.test.ts` ยังผ่านโดยไม่แก้

## Implementation

### Modules touched

- **`src/features/note-name-quiz/components` › `format.ts`** (ใหม่)
  - ย้าย `asWhole` `asPercent` `asSeconds` และ `NO_VALUE` ออกจาก `ResultsScreen` มาไว้ที่นี่ ทั้งจอและ Share text ใช้ชุดเดียวกัน
- **`src/features/note-name-quiz/components` › `shareText.ts`** (ใหม่)
  - `buildShareText(state: RoundState, script: Script, url: string): string` ตาม [sketch-share-text.md](sketch-share-text.md) (D4, D7)
  - ใช้ `results()` `roundLabel()` `promptLabel()` `noteLabel()` และ `answerKind()` ที่มีอยู่ ไม่คำนวณตัวเลขใหม่ (note-name-quiz D15, D25)
  - ไม่ import React หรือ DOM จึง test ได้แบบเดียวกับ engine
- **`src/lib` › `shareOrCopy.ts`** (ใหม่)
  - `shareOrCopy(text, deps): Promise<ShareOutcome>` ตามลำดับใน spec › Share or copy (D3, D7)
  - `deps` คือ `{ share?, writeText?, isCoarse }` ส่งเข้ามาจากข้างนอก ไม่อ่าน `navigator` หรือ `matchMedia` เอง
  - `ShareOutcome` คือ `'shared'` `'dismissed'` `'copied'` หรือ `'failed'`
  - อยู่ใน `src/lib` เพราะปุ่มคัดลอกลิงก์ของ note-name-quiz ticket 06 ใช้ด้วย และเกมถัดไปจะใช้ต่อ (`.claude/skills/vite-react-web/SKILL.md` › Where shared code goes)
- **`src/features/note-name-quiz` › `ResultsScreen`**
  - ปุ่ม "แชร์ผล" region บอกผล และกล่องข้อความตาม spec › Design (D2, D3, D7)
  - URL ที่ส่งเข้า Share text คือ `window.location.href` ตอนกด (ADR-0002, ADR-0004, note-name-quiz D27)
- **`src/features/note-name-quiz` › ตัวรับคีย์ของหน้า Results**
  - `KeyS` บนหน้า Results ทำงานเหมือนกดปุ่ม "แชร์ผล" (D7)
  - ไม่รับ `KeyS` ที่มี `Ctrl` `Cmd` หรือ `Alt` แบบเดียวกับปุ่มคำตอบ
- **ปุ่มคัดลอกลิงก์ของ note-name-quiz ticket 06 (F12)**
  - เปลี่ยนให้เรียก `shareOrCopy` ด้วย `share` ว่าง จะได้มีตัวคัดลอกตัวเดียว (D6, D7)

### Share or copy

ลำดับใน `shareOrCopy` (D3, D7):

1. `isCoarse` และมี `share` → `share({ text })`
   - สำเร็จ → `'shared'`
   - ล้มด้วย `AbortError` หรือ `InvalidStateError` → `'dismissed'`
   - ล้มด้วยเหตุอื่น → `'failed'` ไม่ลองคัดลอกต่อ
2. ไม่เข้าข้อ 1 และมี `writeText` → `writeText(text)`
   - สำเร็จ → `'copied'`
   - ล้ม → `'failed'`
3. ไม่มีทั้งสองทาง → `'failed'`

`ResultsScreen` ทำตาม `ShareOutcome`:

| `ShareOutcome` | บนจอ |
|---|---|
| `'shared'` | ไม่แสดงอะไร |
| `'dismissed'` | ไม่แสดงอะไร |
| `'copied'` | "คัดลอกผลแล้ว" ใน region บอกผล หายหลัง 2 วินาที กดซ้ำเริ่มนับใหม่ |
| `'failed'` | กล่องข้อความอ่านอย่างเดียวที่มี Share text อยู่จนเริ่มรอบใหม่ |

- ปุ่มกดไม่ได้ระหว่างรอ `shareOrCopy` (D7)
- `share` ส่งแค่ `text` ไม่ส่ง `url` แยก เพราะลิงก์อยู่ในข้อความแล้ว และบางแอปทิ้ง `text` เมื่อมี `url`

### Data

ไม่มีข้อมูลใหม่ Share text สร้างตอนกดแล้วทิ้ง ไม่อยู่เกินหน้า Results (ADR-0001)

### Library assumptions

| Library | Version | The plan needs | Docs |
|---|---|---|---|
| Web Share API | browser | `navigator.share({ text })` เรียกได้จาก user activation ใน secure context และ reject ด้วย `AbortError` เมื่อ Player ปิด sheet หรือ `InvalidStateError` เมื่อมี share ค้างอยู่ | [MDN `Navigator.share()`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) |
| Web Share API | browser | `navigator.share` ใช้ transient activation ไปแล้ว การเรียก API ที่ต้องมี activation หลังจากนั้นอาจถูกปฏิเสธ จึงไม่คัดลอกต่อหลัง share ล้ม | [MDN Transient activation](https://developer.mozilla.org/en-US/docs/Glossary/Transient_activation) |
| Clipboard API | browser | `navigator.clipboard.writeText()` ใช้ได้ใน secure context (GitHub Pages เป็น HTTPS) จาก user activation | [MDN `Clipboard.writeText()`](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText) |
| CSS media queries | browser | `(pointer: coarse)` จริงบนเครื่องที่ชี้ด้วยนิ้วเป็นหลัก | [MDN `pointer`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/pointer) |
| lucide-react | 1.70.0 | มีไอคอน `Share2` | [Lucide `share-2`](https://lucide.dev/icons/share-2) |
| @playwright/test | 1.65.0 | `page.addInitScript` แทน `navigator.share` และ `navigator.clipboard.writeText` ก่อนหน้าโหลด และ `page.on('request')` จับ request | [Playwright `page.addInitScript`](https://playwright.dev/docs/api/class-page#page-add-init-script) |

## Seams

ตัวสร้าง Share text กับการเลือก share หรือคัดลอกตรวจด้วย Vitest ส่วนปุ่มบนจอตรวจด้วย e2e flow เดียวต่อเครื่อง (D5, D7)

1. **ตัวสร้าง Share text** `buildShareText`
   - `count` 10 ไทย `solfege-to-letter` ถูก 8 ผิด 2 ใช้เวลา 15 วินาที URL ตาม sketch → ตรงกับตัวอย่างแรกใน sketch ทุกบรรทัด
   - `zen` ตอบถูก 1 ข้อ → `โน้ตต่อนาที —` และ `เวลาเฉลี่ยต่อข้อ —` และบรรทัด `ไม่ผิดสักข้อ`
   - `mixed` ไทย ผิดที่โจทย์ `G` ตอบ ฟา → แถว `G / ฟา / ซอล` ; ผิดที่โจทย์ ซอล ตอบ `A` → แถว `ซอล / A / G`
   - ผิด 27 ข้อ → 20 แถวแรกตามลำดับที่ตอบ แล้ว `และอีก 7 ข้อ`
   - ผิด 1,000 ข้อ → Share text ยาวไม่เกิน 1,000 ตัวอักษร
2. **เลือก share หรือคัดลอก** `shareOrCopy`
   - `isCoarse` จริง `share` สำเร็จ → `'shared'` และไม่เรียก `writeText`
   - `share` reject `AbortError` → `'dismissed'` ; reject `InvalidStateError` → `'dismissed'`
   - `share` reject `NotAllowedError` → `'failed'` และไม่เรียก `writeText`
   - `isCoarse` เท็จ แต่มี `share` → เรียก `writeText` ไม่เรียก `share`
   - `writeText` สำเร็จ → `'copied'` ; reject → `'failed'`
   - ไม่มีทั้ง `share` และ `writeText` → `'failed'`
3. **แชร์ผลจากหน้า Results** (e2e) `e2e/` หน้าเกม
   - `Desktop Chrome` จบ `count` 10 ผิด 2 คลิก "แชร์ผล" → เห็น "คัดลอกผลแล้ว" ; ข้อความที่คัดลอกขึ้นต้นด้วย `Piano Quest — ผลรอบนี้` และมี `ผิด 2` ; ไม่มี request ใหม่
   - `Desktop Chrome` เปิดลิงก์จากข้อความที่คัดลอก → Mode bar แสดง `count` 10 และ Direction กับ Script เดิม
   - `Desktop Chrome` จบรอบแล้วกด `S` → คัดลอกแบบเดียวกับคลิก ; จากนั้นกด `Tab` → เริ่มรอบใหม่ (note-name-quiz D14)
   - `Desktop Chrome` `writeText` stub reject → เห็นกล่องที่มี Share text
   - `iPhone 15` จบ `count` 10 แตะ "แชร์ผล" → `navigator.share` ถูกเรียกหนึ่งครั้งด้วย `text` ที่มี `ผิด` และไม่มีการคัดลอก

## Testing decisions

- **Copy:** `src/features/note-name-quiz/engine/round.test.ts` — วิธีสร้าง `RoundState` ที่จบแล้วด้วย reducer พร้อม `now` และ `seed` คงที่ (ใช้ `now` ห่างกัน 15 วินาทีสำหรับตัวอย่างแรก)
- **Copy:** `src/features/note-name-quiz/sound/notePlayer.test.ts` — แบบของ test ที่ส่ง browser API ปลอมเข้า function
- **Copy:** `e2e/play-round.spec.ts` — `answer()` เล่นรอบให้จบ และ `countNotesPlayed()` เป็นแบบของการแทน browser API ด้วย `page.addInitScript`
- e2e แทน `navigator.share` และ `navigator.clipboard.writeText` ด้วย stub ทั้งสองเครื่อง ไม่พึ่งสิทธิ์ clipboard จริงของ browser ใน CI
- `(pointer: coarse)` บน WebKit ของ Playwright ที่ `iPhone 15` (`hasTouch`) ยังไม่ได้ตรวจ ตรวจก่อนเขียน test
  - จริง → ใช้โปรไฟล์อุปกรณ์ตามเดิม
  - ไม่จริง → stub `matchMedia('(pointer: coarse)')` ใน project `iphone` ด้วย `page.addInitScript` แล้วจดผลลง `docs/library-notes/playwright.md`
- ทางล้มของ share บนเครื่องจริงตรวจไม่ได้ด้วย stub จึงพิสูจน์ด้วย seam 2 แทน
- `src/no-player-data.test.ts` ต้องผ่านต่อโดยไม่แก้

## Out of Scope

- ลิงก์ที่เปิดแล้วเห็นผล (D1)
- รูปการ์ดผล (D1)
- ช่องใส่ชื่อนักเรียน (D4)
- วันเวลาในข้อความ (D4)
- ประวัติหรือคะแนนดีสุด (ADR-0001, user trial F1)

## Open Questions

None.

## Sources

- [MDN `Navigator.share()`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) — user activation, `AbortError` (accessed 2026-11-09)
- [MDN Transient activation](https://developer.mozilla.org/en-US/docs/Glossary/Transient_activation) — share ใช้ activation ไปแล้ว (accessed 2026-11-09)
- [MDN `Clipboard.writeText()`](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText) — secure context, user activation (accessed 2026-11-09)
- [MDN `pointer`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/pointer) — `coarse` บนเครื่องจอสัมผัส (accessed 2026-11-09)
- [Lucide `share-2`](https://lucide.dev/icons/share-2) — ไอคอนปุ่ม (accessed 2026-11-09)
- [Playwright `page.addInitScript`](https://playwright.dev/docs/api/class-page#page-add-init-script) — stub browser API และจับ request ใน e2e (accessed 2026-11-09)
