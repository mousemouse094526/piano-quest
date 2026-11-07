# Progress: note-name-quiz

**Now:** 02 done; 03 next

**Next:**

```
/warroom-build note-name-quiz 03
```

## Tickets

| # | Title | Status |
|---|---|---|
| 01 | Scaffold + engine + deploy | done |
| 02 | Mode bar + URL + Results ครบ | done |
| 03 | มือถือ + เสียง + e2e | ready |

## Log

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
