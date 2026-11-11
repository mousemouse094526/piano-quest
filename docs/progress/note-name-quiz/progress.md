# Progress: note-name-quiz

**Now:** feature review (trial fixes) เสร็จ ; พร้อม merge ; Blocked #1 (ตรวจเสียงและปุ่มคัดลอกลิงก์บน iPhone) รอหลัง merge เข้า `main`

**Next:** `/pr-open`

## Tickets

| # | Title | Status |
|---|---|---|
| 01 | Scaffold + engine + deploy | done |
| 02 | Mode bar + URL + Results ครบ | done |
| 03 | มือถือ + เสียง + e2e | done |
| 04 | Keymap ใน URL + ป้ายบนปุ่มคำตอบ | done |
| 05 | Dialog ตั้งปุ่มลัด | done |
| 06 | Trial fixes 2026-11-09 | done |

## Log

### Feature review (trial fixes) — done 2026-11-09

**Built:**
- e2e F11 (Results นับขึ้น) flaky 5/40: อ่าน 3 ตัวเลขแยกกัน React commit frame ใหม่ระหว่างอ่านได้ (fake clock ไม่คุม scheduler ของ React) ; อ่านทีเดียวใน `evaluate` → 60/60
- `CopyLinkButton`: ไม่มี `navigator.clipboard` → "คัดลอกไม่ได้" ; กดซ้ำนับ 2 วินาทีใหม่ (D45) + e2e ไม่มี clipboard
- `modeHowTo` ใช้ `lengthLabel` ; `DO` แทน `NOTES[1]` ; `missed` → `missedPrompt` ; `hideKeySetHint` ; keyframe `miss` ไม่ใส่สีซ้ำ ; คอมเมนต์ `share` ใน `countedUp`
- e2e: ข้อที่ผิดอยู่ในจอ (`toBeInViewport`) ; `animation-name` ตรงตัว `miss, miss-fade` ; copy-link ใช้ `watchErrors` และ `ClipboardSpy` ; ชื่อ test "Mode bar"
- spec.md › Seams Testing decisions Out of Scope (ลบ "ไม่มีปุ่ม copy link") ; flow.md ข้อที่ผิด ; CONTEXT.md "การตั้งค่า" บนจอ = Mode bar

**Decided:**
- D45 — ปุ่มคัดลอกลิงก์เมื่อไม่มี clipboard และเมื่อกดซ้ำ
- ทิ้งตามตัวเลือก Recommended (auto mode): e2e F11 คิดความแม่นจากตัวเลขบนจอ (AC F11 ขอให้ทุก frame ตรงกัน) ; export `accuracyOf` เพื่อ unit test ; review บอกว่า 375 px กับจอสัมผัสไม่ได้ตรวจคู่กัน — ผิด test 375 px รันใน project `iphone` ด้วย

**For the next ticket:**
- —

**Checks:** `npx biome ci .`, `npm run typecheck`, `npm test` (74 passed), `npm run e2e` (98 passed, 4 skipped), `npm run build` — all green ที่ `2390861`

### 06: Trial fixes 2026-11-09 — done 2026-11-09

**Built:**
- F3: ก่อนข้อแรกขึ้นว่า Mode จบเมื่อไรพร้อมหน่วย (`modeHowTo`) และ "กดปุ่มบนคีย์บอร์ดตามป้ายเล็กใต้ปุ่มคำตอบ หรือแตะปุ่ม" ; ซ่อนแบบ `invisible` ตอนรอบเริ่ม Prompt ไม่ขยับ ; แถบล่าง "ไปที่การตั้งค่า"
- F6: Prompt ใหม่ไม่แดงแล้ว ; ข้อที่เพิ่งตอบผิด (`LastAnswer.prompt`) ค้างทางซ้าย สีแดง สั่น แล้วจาง (`animate-missed-prompt`) ; keyframe `miss-mark` → `miss-fade`
- F9: `useRound` คืน `keySetHint` (`shown` `flashes`) แทน `keySetHints` ; บรรทัด "ข้อนี้ตอบด้วยปุ่ม {keySetLabel}" จนกว่าจะตอบข้อนั้น
- F8: focus อยู่ใน Mode bar → แถบล่างเหลือ "`Esc` กลับเข้าเกม" (CSS `group/quiz` + `group-has-[nav:focus-within]`)
- F5: `pointer-coarse:` ซ่อนแถบล่างและ `Tab` บนปุ่มเล่นอีกรอบ (`Kbd` รับ `className`) ; ปุ่มตอบ `min-h-16`
- F14: `directionLabel(dir, script)` แทน `DIRECTION_LABELS` ; Mode bar และ Results
- F12: `CopyLinkButton` (`Link`/`Check`) หน้าปุ่มเสียง ปุ่มไอคอนสามตัวอยู่กลุ่มเดียว Mode bar `lg:gap-x-2` ยังบรรทัดเดียวที่ 1024 px ; "คัดลอกแล้ว"/"คัดลอกไม่ได้" ใต้ปุ่มแบบ absolute
- F11: engine `accuracyOf` `countedUp(results, progress)` + `hooks/useCountUpProgress.ts` (เดิม `useCountUp.ts`)
- unit test ใหม่ 5 ข้อ (`accuracyOf` `countedUp`) ; e2e ใหม่ใน `play-round.spec.ts` (วิธีเล่น, กดผิดชุด, คำใบ้ Esc, จอสัมผัส, ป้าย Direction อังกฤษ, Results นับขึ้น 8/0 และ 6/2) และ `e2e/copy-link.spec.ts` (stub clipboard) ; test ตอบผิดเดิมเปลี่ยนเป็นข้อที่ค้าง
- library note ใหม่ `clipboard.md` ; `tailwindcss.md` เพิ่ม `pointer-coarse:` และ `group-has-[…]/name` ; `rules/testing.md` เพิ่ม copy-link
- ตรวจด้วยตาที่ 1024 px และ iPhone: Mode bar บรรทัดเดียว ข้อที่ผิดสีแดงทางซ้าย ข้อความกดผิดชุด ไม่มีแถบล่างบนมือถือ ; clipboard จริงใน Chromium (ให้ permission) ได้ URL ครบ

**Decided:**
- D44 — วิธีทำทั้ง 8 ข้อ (auto mode เลือก Recommended ทุกข้อ: ข้อที่ผิดค้างสีแดง, ข้อความใต้ปุ่ม, ปุ่มคัดลอกใน Mode bar, ซ่อนตาม `pointer: coarse`) ; D31 และ D39 → changed by D44
- ทิ้งจาก review: รวมตารางป้ายต่อ Mode เป็นตารางเดียว

**For the next ticket:**
- F3 "แต่ละ Mode": เห็นคำอธิบายเฉพาะ Mode ที่เลือก ต้องกดดูทีละ Mode — เจ้าของควรดูว่าพอไหม
- clipboard ใน e2e เป็น stub ; ตรวจปุ่มคัดลอกลิงก์บน iPhone Safari จริงพร้อม Blocked #1
- iPad ต่อคีย์บอร์ดไม่เห็นแถบล่าง (D44 ยอมรับ)

**Checks:** `npx biome ci .`, `npm run typecheck`, `npm test` (74 passed), `npm run e2e` (96 passed, 4 skipped), `npm run build` — all green

### Feature review (Keymap) — done 2026-11-09

**Built:**
- e2e ของ Keymap (URL และ Dialog) แยกเป็น `e2e/keymap.spec.ts` ; helper ร่วมอยู่ `e2e/quiz.ts` ; `play-round.spec.ts` เหลือเฉพาะรอบเล่น (one file per user flow) ; `rules/testing.md` และ spec.md › Testing decisions ตาม
- ตรวจ scroll แนวนอนด้วย `expect.poll` (`expectNoSidewaysScroll`) แทนอ่าน `page.evaluate` ครั้งเดียว
- Dialog ปุ่มลัด: กด modifier เดี่ยวขณะรอ ไม่ขึ้น "ใช้ปุ่มนี้ไม่ได้" ; `Shift+Q` ผูก `Q` (D43) + e2e ใหม่
- `SIDES` อยู่ที่ `hooks/keys.ts` ที่เดียว ; `shortcutLabel` → `boundKeyLabel` (CONTEXT.md เลี่ยงคำ shortcut) ; `change` → `commitKeymap` ; คอมเมนต์ `roundKeyOf` `bindableCode` (Numpad) D40 และ `onMouseDown` ใน portal อธิบายเหตุผล
- unit test fixture เขียนเป็น code ตรงๆ ไม่สร้างด้วย `keySetOf` ที่กำลังถูก test
- `dialog.tsx` import `cn` ผ่าน `@/lib/utils` เหมือน component อื่น

**Decided:**
- D43 — modifier เดี่ยวขณะรอปุ่ม ไม่มีอะไรเกิด
- ทิ้งตามตัวเลือก Recommended (auto mode): `ModeBar` ส่ง prop ต่อให้ Dialog (Middle Man) ; ชนิด branded ของ key code ; ย้าย `hooks/keys.ts` ออกจาก `hooks/` ; รวมคู่ `letter-keys`/`solfege-keys` ด้วย map ตาม Side ; fallback ใน `keymapOf` ; e2e ผูกกับรูป `%22…%22` ของ router (D34)

**For the next ticket:**
- —

**Checks:** `npx biome ci .`, `npm run typecheck`, `npm test` (69 passed), `npm run e2e` (80 passed, 2 skipped), `npm run build` — all green ที่ `a692936`

### 05: Dialog ตั้งปุ่มลัด — done 2026-11-09

**Built:**
- ปุ่มไอคอน `Keyboard` "ปุ่มลัด" ท้าย Mode bar ข้างปุ่มเสียง เปิด shadcn `Dialog` (`components/KeymapDialog.tsx`): 2 คอลัมน์ `C–B` กับ solfège ตาม Script ; คลิก แตะ หรือ Enter ที่แถว → "กดปุ่มที่ต้องการ…" ; ปุ่มที่ผูกได้ → ผูก (ชน → สลับ "สลับกับ {Answer}") ; ปุ่มอื่น → "ใช้ปุ่มนี้ไม่ได้" รอต่อ ; `Esc` เลิกรอ ; `Tab` ย้าย focus และเลิกรอ ; แตะแถวเดิมซ้ำ แถวอื่น หรือปิด → เลิกรอ ; "คืนค่าเริ่มต้น" ; บรรทัด "ต้องใช้คีย์บอร์ดจริง แตะปุ่มคำตอบได้เสมอ"
- ทุกการเปลี่ยนเขียน URL ทันทีผ่าน `withKeymap` (`search.ts`) แล้วรอบเริ่มใหม่ (D37) ; เปิด Dialog เริ่มรอบใหม่เสมอ (D40) ด้วยตัวนับการเปิดต่อท้าย `roundKey`
- `hooks/keys.ts`: `bindableCode` `rebind(keymap, answer, code)` (สลับในชุดและข้ามชุด) `isSameAnswer` ; `choiceFromCode` ใช้ `bindableCode`
- `useRound`: listener เลิกเมื่อ `e.defaultPrevented` หรือ ref `keymapOpen` (ตั้งใน `onOpenChange` ก่อน render) ; `FocusAreas` → `KeyRouting`
- ปิด Dialog แล้ว focus กลับพื้นที่เกม (`onCloseAutoFocus`) ; เนื้อหา Dialog หยุด `mousedown` ไม่ให้ถึง `<nav>`
- unit test ใหม่ 8 ข้อ (`bindableCode` `rebind` `withKeymap`) ; e2e ใหม่ 15 test ใน `e2e/play-round.spec.ts` (ครบทุก criterion รวม `zen` Esc ปิดแล้ว `G` ตอบได้, เปิดจาก Results, 1024 px บรรทัดเดียว, 375 px ไม่มี scroll แนวนอน)
- library note ใหม่ `radix-dialog.md` (Esc ของ Radix อยู่ช่วง capture บน `document` และ `preventDefault` ก่อนปิด) ; `rules/components.md` เพิ่มกติกา Dialog ที่อ่านปุ่มเอง ; ป้ายปิดของ shadcn `dialog.tsx` เป็น "ปิด"
- ตรวจด้วยตาที่ 375 และ 1024 px: Mode bar ตัดบรรทัดเรียบร้อย ปุ่มลัดอยู่ข้างปุ่มเสียง Dialog พอดีจอ

**Decided:**
- D42 — Dialog อยู่ใน Mode bar (`Dialog.Trigger`) ; ตัวนับการเปิดต่อท้าย Round key ; ref Dialog เปิดผ่าน `KeyRouting` ; หัวคอลัมน์ `C–B` กับ `โด–ที`/`Do–Ti`

**For the next ticket:**
- ป้ายในแถวรอที่ 375 px ("กดปุ่มที่ต้องการ…") พอดีช่องพอดี — ถ้าเปลี่ยนคำต้องดูอีกที
- review เสนอแต่ไม่ทำ (judgement): ชนิด branded ของ code ที่ผูกได้ ; `ModeBar` ส่ง `onKeymapOpenChange` `gameArea` ต่อให้ Dialog อย่างเดียว ; `hooks/keys.ts` ไม่ใช่ hook (เดิม)
- AC "URL เป็น `CDEFGAB` กับ `1234567`" — router เขียน `solfege-keys=%221234567%22` (D34 รู้แล้ว ไม่ใช่ของใหม่)

**Checks:** `npx biome ci .`, `npm run typecheck`, `npm test` (69 passed), `npm run e2e` (78 passed, 2 skipped; 156/156 ใน `--repeat-each 2`), `npm run build` — all green

### 04: Keymap ใน URL + ป้ายบนปุ่มคำตอบ — done 2026-11-09

**Built:**
- `hooks/keys.ts`: ตาราง 47 ปุ่มที่ผูกได้พร้อมป้าย US QWERTY (D33 D38 ADR-0007) ; `Keymap` = `Record<Side, Record<Note, code>>` ; `choiceFromCode(code, keymap)` นับ `Numpad{n}` เป็น `Digit{n}` และไม่รับปุ่มนอกตาราง ; `keySetOf` `keySetLabels` `keyLabel`
- `search.ts`: param `letter-keys` `solfege-keys` (ค่าเริ่มต้น `CDEFGAB` `1234567`) อักษรเล็กเป็นใหญ่ รับ number ; ยาวผิด นอกตาราง ซ้ำในชุด → ค่าเริ่มต้นของ param นั้น ; ซ้ำข้ามชุดหลัง fallback → ทั้งสองเป็นค่าเริ่มต้น ; `keymapOf` ; `roundKeyOf` (ทุกค่ายกเว้น `sound` จึงเปลี่ยน Keymap แล้วเริ่มรอบใหม่ตาม D37)
- `useRound` ตอบตาม Keymap ; ปุ่มคำตอบขึ้นป้ายปุ่มที่ผูกทุกขนาดจอ (D39) ; `NOTES_IN_ORDER` ย้ายไป `engine/notes.ts`
- unit test ใหม่ `hooks/keys.test.ts` (10) และ Keymap ใน `search.test.ts` (8) ; e2e ใหม่ 8 test × 2 project: URL เขียนครบ, Keymap ผิด fallback ไม่มี error, `ASDFGHJ` ตอบและป้าย, ป้ายเครื่องหมาย, `7654321` ไม่มี `"` + refresh, `Numpad`, ทิศสลับกดชุดอื่น, iPhone แตะครบรอบ
- library note router: URL ถูกเขียนกลับตอนโหลดเท่านั้น ไม่ใช่ตอนเปลี่ยน hash ; รูปที่ `defaultStringifySearch` ใส่ `"`
- ติดตั้ง browser ของ Playwright ในเครื่อง (ก่อนหน้านี้ e2e ในเครื่องรันไม่ได้เลย)

**Decided:**
- D41 — Keymap ใน search เป็นป้าย `keymapOf` แปลงเป็น `code` ; `roundKeyOf` = ทุกค่ายกเว้น `sound` ; `1234567.0` ที่พิมพ์เองอ่านได้ (ยอมรับ)

**For the next ticket:**
- Dialog (05) เขียน Keymap ด้วย `navigate` ผ่าน helper แบบ `withSound` ใน `search.ts` (ต้องเพิ่ม เช่น `withKeymap`) ; `keySetLabels` แปลง `KeySet` กลับเป็นป้ายให้ URL
- listener ของเกมอยู่ใน `useRound.onKeyDown` — ticket 05 ต้องเพิ่มเงื่อนไข `e.defaultPrevented` และ ref "Dialog เปิด" ที่นี่ (D35)
- `script` กับ `keymap` เดินคู่กัน `Round → Game → AnswerRow` เพื่อทำป้าย — ถ้า prop เพิ่มอีกรวมเป็นก้อนเดียว
- e2e ของ D37 (ตั้ง Keymap กลางรอบแล้วเริ่มใหม่) อยู่กับ 05 ตาม Seam 2

**Checks:** `npx biome ci .`, `npm run typecheck`, `npm test` (61 passed), `npm run e2e` (50 passed), `npm run build` — all green

### Change request: สีเน้น + animation — done 2026-11-07

**Built:**
- สีเน้นเขียวมิ้นต์ `--brand` (`text-brand`) ใช้กับค่าที่เลือกใน Mode bar ปุ่มเสียงตอนเปิด ตัวนับเวลาหรือข้อ ปุ่มที่ตอบถูก และตัวเลขความแม่นกับโน้ตต่อนาทีในหน้า Results
- animation: แถว Prompt เลื่อนเข้าทุกครั้งที่ตอบ ; ปุ่มที่ตอบยุบแล้วเด้ง (ตอบถูกกระพริบสีมิ้นต์) ; หน้า Results ค่อยๆ โผล่และตัวเลขนับขึ้น (`hooks/useCountUp.ts`) ; `time` 5 วินาทีสุดท้ายตัวเลขเวลาเต้นทุกวินาที ; ทุกแบบปิดเมื่อตั้ง reduced motion
- `useRound` คืน `lastAnswer` แทน `missMark`
- e2e ใหม่: ตอบถูก ปุ่มที่กดมี animation `hit` และไม่มี `X`
- ตรวจใน browser ทั้งธีมสว่างและมืดที่ 1024 px: contrast ผ่าน AA (≥ 4.7:1) และตัวเลขเวลาเต้นที่ 5 วินาที

**Decided:**
- D31 — สีเน้นเขียวมิ้นต์ของเราเอง (ไม่ใช้ชุดสีของ Monkeytype ตาม ADR-0006) และ animation ทั้ง 4 แบบ

**For the next ticket:**
- ยังไม่ได้ดูด้วยตาที่ 375 px หลังเพิ่มสี (layout ไม่ได้เปลี่ยน)

**Checks:** `npx biome ci .`, `npm run typecheck`, `npm test` (43 passed), `npm run e2e` (34 passed), `npm run build` — all green

### Feature review — done 2026-11-07

**Built:**
- กติกาต่อ Mode อยู่ที่ `engine/modes.ts` (`MODE_LENGTHS` `hasLength` `isLengthMode` `isEndedByPlayer`) ; `Settings['len']` derive จาก `MODE_LENGTHS` ; การแยกกรณี `mode` ใน `search.ts` `labels.ts` `Game.tsx` `ModeBar.tsx` `NoteNameQuiz.tsx` `round.ts` หายไป (ปิดข้อค้างจาก 02 และ 03)
- ทุกการเปลี่ยนค่าใน Mode bar ผ่าน `parseQuizSearch` (เพิ่ม `withDirection` `withScript`) ; `settingsOf` ใช้ destructuring ; `AnswerOutcome` ย้ายไป `types.ts`
- `cn` import ผ่าน `@/lib/utils` ; component `Results` → `ResultsScreen` ; `keepFocus` → `stopFocusOnMouseDown`
- Mode bar: `main` กว้าง `max-w-4xl` → บรรทัดเดียวตั้งแต่ `lg` ; เส้นคั่นแสดงเฉพาะ `lg` ขึ้นไป ไม่ค้างท้ายแถวบนจอแคบ (ตรวจที่ 375 และ 1024 px)
- e2e: `page.clock` แทน `waitForTimeout` (suite 24 s → 12 s) ; ตอบผิดตรวจ animation ของ Prompt และ `X` ที่ `toBeVisible` แทน `data-missed` (ลบออก) ; test ใหม่ `Ctrl`/`Cmd`/`Alt` + ปุ่มคำตอบไม่ตอบ
- spec.md › Design และ Engine contract ตาม D25 (ตอบไม่ถึง 2 ข้อ → `—`)

**Decided:**
- D30 — กติกาต่อ Mode ที่เดียว ; Mode bar บรรทัดเดียวจาก `lg`
- ทิ้งตามที่ผู้ใช้เลือก: seed สร้างใน `useRound` (spec ว่า route) ; หน้า not-found ; unit test notePlayer ผูกกับ oscillator (D29) ; prop `script` ส่งผ่านหลาย component ; CI build สองรอบ

**For the next ticket:**
- `parseQuizSearch` ยังมี `as QuizSearch` หนึ่งที่ — TS จับคู่ `mode` กับ `len` ของมันข้าม union ไม่ได้ ; `parseLength` รับประกันคู่ให้
- บนจอแคบปุ่มเสียงอยู่แถวสุดท้ายคนเดียว — ตั้งใจ ไม่ใช่บั๊ก

**Checks:** `npx biome ci .`, `npm run typecheck`, `npm test` (43 passed), `npm run e2e` (32 passed; test ที่แก้ 30/30 ใน `--repeat-each 5`), `npm run build` — all green ที่ `0db2607`

### 03: มือถือ + เสียง + e2e — done 2026-11-07

**Built:**
- ปุ่มแตะ 7 ปุ่มเป็น grid 7 ช่องเต็มกว้าง (`max-w-md`) อยู่แถวเดียวที่ 375 px ไม่มี scroll แนวนอน ; ตอบผิดปุ่มที่กดขึ้น `X` 600 ms แล้วจาง (ทั้งแตะและคีย์บอร์ด) จนกว่าจะมีคำตอบที่นับครั้งถัดไป
- ปุ่มเสียง `Toggle` `VolumeX`/`Volume2` ท้าย Mode bar เปลี่ยนแค่ `sound` ใน URL รอบเดิมเล่นต่อ ; `sound/notePlayer.ts` สร้าง `AudioContext` ตอนกดเปิด (หรือตอนตอบถูกครั้งแรกถ้าเปิดจาก URL) ตั้ง `audioSession.type = 'playback'` `resume()` ทุกครั้ง คลื่น triangle 0.41 วินาที ความผิดพลาดทุกอย่างถูกกลืน
- engine เพิ่ม selector `answerOutcome(before, after)` ; `useRound` รัน reducer ล่วงหน้าในการกดเดียวกันเพื่อเล่นเสียงและตั้ง `missMark` หลัง engine ตัดสิน
- Playwright 1.65.0: `playwright.config.ts` (project `chromium` + `iphone`, port 4317, build ใหม่ทุกครั้ง) และ `e2e/play-round.spec.ts` 15 test ครอบทุก bullet ของ Seam 2 และทุก criterion ของ ticket (รวม AudioContext throw, ตอบผิดไม่มีเสียงด้วย stub นับโน้ต) ; CI รัน `npm run e2e` ก่อน build และ upload `playwright-report`
- library notes ใหม่: `playwright.md`, `web-audio.md`
- ตรวจด้วยมือที่ 375 px (browser pane): แถวปุ่มพอดี ปุ่มเสียงขึ้น แตะผิดเห็น `X`

**Decided:**
- D28 — Playwright: `Desktop Chrome` + `iPhone 15`, port 4317 ไม่ reuse server (preview เก่าบน 4173 ทำให้ test ผ่านกับ build เก่า), CI ก่อน build
- D29 — `X` อยู่ใน `useRound` จนกว่าจะตอบข้อถัดไป ; ตัวเล่นเสียงตัวเดียวทั้งแอป ; grid 7 ช่อง ; unit test ของ notePlayer จำกัดที่สัญญาไม่ throw ; `resume()` ทุกครั้ง

**For the next ticket:**
- Mode bar บนจอแคบ: เส้นคั่น (`Divider`) ค้างท้ายแถวเมื่อ `flex-wrap` ตัดบรรทัด และปุ่มเสียงตกไปอยู่แถวเดียว — ดูตอน feature review
- CI build สองรอบ (`webServer` ของ Playwright build เอง แล้ว step `npm run build` อีกรอบ) — เสียเวลาไม่ผิด ; ทำให้ webServer ใช้ `dist` ที่มีอยู่ได้ถ้าต้องการเร็วขึ้น
- `useRound.answer` ตัดสินด้วย `state` ของ render ล่าสุด — ถูกเพราะ React render ระหว่าง discrete event ; ถ้าย้ายไป event ที่ batch ต้องคิดใหม่
- ยังค้างจาก 02: `mode` แยกกรณีใน `parseQuizSearch` `settingsOf` `Progress` `roundLabel`
- Vite preview (sirv) cache รายการไฟล์ตอนเริ่ม และ browser cache `index.html` — หลัง build ใหม่ต้อง restart preview และ reload แบบ bust cache

**Checks:** `npx biome ci .`, `npm run typecheck`, `npm test` (42 passed), `npm run e2e` (30 passed; 90/90 ใน `--repeat-each 3`), `npm run build` — all green ; iPhone โหมดเงียบยังไม่ได้ตรวจ (Blocked #1)

### 02: Mode bar + URL + Results ครบ — done 2026-11-07

**Built:**
- Mode bar (`ToggleGroup`) เลือก Mode ความยาว Direction Script ได้ ค่าอยู่ใน URL (`replace` ไม่เพิ่ม history) refresh และ bookmark ได้ ; ค่าผิดใน URL ใช้ค่าเริ่มต้นโดยไม่มี error ; เปลี่ยนค่าใดก็ได้ (ยกเว้น `sound`) เริ่มรอบใหม่ รวมถึงจากหน้า Results
- `search.ts` (`parseQuizSearch` `withMode` `withLength` `settingsOf`) pure พร้อม unit test 13 ข้อ ; engine เพิ่ม selector `answeredCount` `needsKeySetHint` (test 2 ข้อ)
- Game: ตัวนับตาม Mode (`time` เวลา, `count` `n/len`, `zen` จำนวน) ตัวนับผิด ปุ่มเริ่มใหม่ ปุ่มจบรอบใน `zen` แถวปุ่มตอบ 7 ปุ่มพร้อมป้ายปุ่มลัด ; ตอบผิด Prompt สั่นและกระพริบแดง (`prefers-reduced-motion` เหลือแค่สี) ; ทิศสลับกดผิดชุด ป้ายปุ่มลัดกระพริบ ไม่นับผิด
- Focus: พื้นที่เกมรับ focus ตอนเปิด `Shift+Tab` เข้า Mode bar `Esc` ใน Mode bar คืน focus (ไม่จบ `zen`) ; คลิก Mode bar ด้วยเมาส์ focus ไม่ย้าย ; แถบล่าง `Tab` `Esc` (เฉพาะ `zen`) `Shift+Tab`
- Results: ถูก ผิด ความแม่น โน้ตต่อนาที เวลาเฉลี่ยต่อข้อ (`—` เมื่อไม่มีค่า) Mode Direction Script ที่เล่น และตารางข้อที่ผิด (โจทย์ ตอบ ที่ถูก) หรือ "ไม่ผิดสักข้อ"
- แก้บั๊กที่พบตอนตรวจ: query จริงก่อน `#` (เช่น `?fbclid=`) ทำให้ param ตัวสุดท้ายใน hash กลายเป็นค่าเริ่มต้น → ตัดทิ้งใน `main.tsx` ก่อนสร้าง router

**Decided:**
- D26 — Mode bar เป็น `ToggleGroup` เห็นทุกค่า ไม่มี popover ; ปุ่มเกมไม่รับ focus ; คลิกเมาส์ไม่ย้าย focus ; ป้ายปุ่มลัดกระพริบเฉพาะทิศสลับ ; `Esc` ในแถบล่างเฉพาะ `zen` ตาม spec › Design
- D27 — URL เขียนครบทุก param parser อยู่ใน `search.ts` input ของ `validateSearch` ติด `SearchSchemaInput` ; ตัด query จริงตอนเปิดแอป

**For the next ticket:**
- `AnswerRow` แตะแล้วตอบได้แล้ว (เส้นทางเดียวกับปุ่มคีย์บอร์ด) และไม่รับ focus (`noFocus`) ticket 03 เหลือ: `X` บนปุ่มที่ตอบผิด, ตรวจ 375 px (ปุ่ม `min-w-12` × 7 + `gap-2` อาจล้น), และ e2e
- `sound` parse และพกต่อใน URL แล้ว แต่ยังไม่มีปุ่ม ; ใส่ปุ่ม `Volume2`/`VolumeX` ใน `ModeBar` แล้วเปลี่ยนด้วย `navigate` replace โดย **ไม่** ใส่ `sound` ใน `roundKey` ของ `NoteNameQuiz` (D20 รอบเดิมเล่นต่อ)
- e2e hooks ที่มีแล้ว: `data-testid` `prompt` (มี `data-missed` หลังตอบผิด) `miss-count` `answered` `miss-list`
- synthetic `KeyboardEvent` ที่ dispatch บน `window` มี `target` เป็น `window` จึงข้ามเงื่อนไข "focus อยู่ใน Mode bar" — e2e ต้องใช้ `page.keyboard` จริง
- Mode bar บนจอแคบตัดเป็นหลายแถว (`flex-wrap`) ยังไม่ได้ดูบน 375 px
- Smell ที่ยังเหลือ (เล็ก): `mode` ยังถูกแยกกรณีใน `parseQuizSearch` `settingsOf` `Progress` `roundLabel` — ถ้ามี Mode ใหม่ต้องแก้หลายที่

**Checks:** `npx biome ci .`, `npm run typecheck`, `npm test` (35 passed), `npm run build` — all green ; ตรวจด้วยมือบน `vite preview` ครบทุก acceptance criterion (Chromium ใน browser pane)

### 01: Scaffold + engine + deploy — done 2026-11-07

**Built:**
- เปิดเว็บแล้วเล่นรอบ `time` 30 วินาที ทิศโด→C Script ไทยด้วยคีย์บอร์ดได้ (ภาษาไทยหรืออังกฤษก็ได้) จบแล้วเห็นหน้า Results ถูก ผิด ความแม่น ; `Tab` เริ่มใหม่ focus ไม่ย้าย ; กดค้างหรือ `Ctrl`/`Cmd`/`Alt` ไม่ตอบ
- engine (`src/features/note-name-quiz/engine`) มีกติกาครบทุก Mode และ Direction ตาม Seams › 1 พร้อม unit test 20 ข้อ
- GitHub Actions: push `main` และ PR รัน Biome typecheck Vitest build ; push `main` deploy ขึ้น Pages ใต้ `/piano-quest/`

**Decided:**
- D24 — Biome ตรวจเฉพาะ code (ไม่รวม `.md`) space 2 single quote บรรทัด 100 ห้าม browser storage ด้วย lint และ `src/no-player-data.test.ts`
- D25 — ตอบน้อยกว่า 2 ข้อ ความเร็วแสดง `—` ทุก Mode (ผู้ใช้เลือก แก้ข้อขัดกันระหว่าง Seams › 1 กับ D20)

**For the next ticket:**
- `NoteNameQuiz.tsx` ใช้ `DEFAULT_SETTINGS` คงที่ ticket 02 แทนด้วยค่าจาก `validateSearch` ของ route `/`
- `Game.tsx` มีตัวนับผิด `ผิด N` และคำใบ้ `Tab` แล้ว ticket 02 เพิ่ม `Esc` `Shift+Tab` ในแถบล่าง
- `answerKind` ใน `round.ts` ยังไม่ export — export เมื่อต้องรู้ชุดปุ่มที่ถูกเพื่อกระพริบป้ายปุ่มลัด (D20)
- เวลาที่เหลือใช้ selector `timeLeft(state, now)` ของ engine ; ticker 100 ms ทำงานเฉพาะตอน `running`
- Vitest `include` จำกัดที่ `src/**/*.test.ts` เพื่อไม่ให้ Playwright spec ใน `e2e/` ถูกรัน (ticket 03 เพิ่ม Playwright ใน CI ก่อน build)
- deploy จริงยังไม่ได้ตรวจ: ต้องตั้ง Settings › Pages › Source = GitHub Actions แล้ว merge เข้า `main`
- shadcn 4.23 ใช้ package `cn` แทน clsx + tailwind-merge ; `src/lib/utils.ts` re-export ไว้ให้ component ที่ CLI เพิ่มภายหลัง
- library notes อยู่ที่ `docs/library-notes/` (TS 7: ห้าม `baseUrl` ; Biome 2.6 format Markdown ด้วย จึงต้อง exclude)

**Checks:** `npx biome ci .`, `npm run typecheck`, `npm test` (20 passed), `npm run build` — all green ; เล่นจริงบน `vite preview` ผ่าน

## Blocked

| # | Ticket | What | Needs | Status |
|---|---|---|---|---|
| 1 | 03 | ตรวจด้วยมือ: iPhone เปิดโหมดเงียบ เปิดเสียงในเกม ตอบถูก → ได้ยินเสียง (ต้องเป็นเว็บ HTTPS ที่ deploy แล้ว) | merge เข้า `main` แล้วตรวจบน iPhone จริง บันทึกผลที่นี่ | open |
| 2 | — | user trial F2: ครูแพรส่งผลรอบให้ผู้ปกครองไม่ได้ — **เจ้าของตัดสิน 2026-11-09: ทำเป็นฟีเจอร์ใหม่ `share-results`** ไม่แก้ในฟีเจอร์นี้ | `/warroom share-results` | moved |

**2026-11-11:** เจ้าของตรวจบน iPhone จริงแล้ว — เสียงและปุ่มคัดลอกลิงก์ใช้ได้ (Blocked #1 ปิด)
