# Progress: note-name-quiz

**Now:** merged — [PR #2](https://github.com/mousemouse094526/piano-quest/pull/2) (D31 สีเน้น + animation) เข้า `develop` ที่ `4faf1a9` ; ยังเหลือ Blocked #1 (ตรวจเสียงบน iPhone หลัง deploy `main`)

**Next:** —

## Tickets

| # | Title | Status |
|---|---|---|
| 01 | Scaffold + engine + deploy | done |
| 02 | Mode bar + URL + Results ครบ | done |
| 03 | มือถือ + เสียง + e2e | done |

## Log

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
