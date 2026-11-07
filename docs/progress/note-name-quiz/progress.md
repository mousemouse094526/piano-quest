# Progress: note-name-quiz

**Now:** 01 done; 02 next

**Next:**

```
/warroom-build note-name-quiz 02
```

## Tickets

| # | Title | Status |
|---|---|---|
| 01 | Scaffold + engine + deploy | done |
| 02 | Mode bar + URL + Results ครบ | ready |
| 03 | มือถือ + เสียง + e2e | ready |

## Log

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
