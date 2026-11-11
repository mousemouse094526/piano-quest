# Progress: share-results

**Now:** merged ([PR #5](https://github.com/mousemouse094526/piano-quest/pull/5), a4ecc4e) — หลัง deploy ตรวจ share sheet บน iPhone จริงพร้อม Blocked #1 ของ note-name-quiz

**Next:** —

## Tickets

| # | Title | Status |
|---|---|---|
| 01 | ปุ่มแชร์ผลบนหน้า Results | done |

## Log

### Feature review — done 2026-11-09

**Built:**
- `shareOrCopy` ย้ายจาก `src/lib` เข้า `features/note-name-quiz/hooks/` ; แยก `copyText` ให้ปุ่มคัดลอกลิงก์เรียกตรง ; `COPIED_SHOWN_MS` ตัวเดียวของทั้งสองปุ่ม
- prop `share` → `shareView` ใน `ResultsScreen` ; `Shown` → `LastShare`
- e2e: ข้อความ "คัดลอกผลแล้ว" ตรวจ 2 วินาทีด้วย `page.clock` ; กดซ้ำแล้ว region ว่างก่อนข้อความเดิมกลับมา (ตรวจด้วย `MutationObserver` และลองถอดบรรทัดล้างแล้ว test ล้มจริง)
- test "ผิด 27 ข้อ" สร้างแถวที่คาดจากข้อมูล engine ไม่ใช่จาก `buildShareText`
- library-notes `clipboard.md` `web-share.md` และ `rules/testing.md` ชี้ที่อยู่ใหม่

**Decided:**
- D9 — `shareOrCopy` อยู่ใน feature จนเกมที่สองใช้ ; `copyText` ; `COPIED_SHOWN_MS` (แทนสองข้อใน D8)
- ไม่แก้: `(state, script)` ที่เดินด้วยกัน, `onShare` ใน `useRound` (ตามกติกา listener ตัวเดียว), Share text ภาษาไทยแม้ Script อังกฤษ (ตาม spec)

**For the next ticket:**
- ตรวจ share sheet บน iPhone จริงพร้อม Blocked #1 ของ note-name-quiz หลัง deploy

**Checks:** `npx biome ci .` · `npm run typecheck` · `npm test` (89) · `npm run e2e` (104) · `npm run build` — all green

### 01: ปุ่มแชร์ผลบนหน้า Results — done 2026-11-09

**Built:**
- หน้า Results ทุก Mode มีปุ่ม "แชร์ผล" (`Share2`, ป้าย `S` ซ่อนบนจอสัมผัส) กดด้วยคลิก แตะ หรือ `S` ; ไม่รับ focus และกดไม่ได้ระหว่าง share sheet เปิด
- `buildShareText` (`components/shareText.ts`) สร้าง Share text ตาม sketch ตัวต่อตัว ; ข้อผิดไม่เกิน 20 แถวแล้ว "และอีก N ข้อ" ; ตัวเลขใช้ `components/format.ts` ชุดเดียวกับหน้า Results
- `shareOrCopy` (`src/lib/shareOrCopy.ts`) มือถือเปิด share sheet จอใหญ่คัดลอก ; ล้ม → กล่องข้อความอ่านอย่างเดียวจนเริ่มรอบใหม่ ; region `aria-live` อยู่ตลอดหน้า
- ปุ่มคัดลอกลิงก์ของ note-name-quiz ใช้ `shareOrCopy` ตัวเดียวกัน ; `stubShare` ใน `e2e/quiz.ts` ใช้ร่วมทั้งสอง spec
- merge `develop` (note-name-quiz 06) เข้ามา และเลื่อน ADR ของเราเป็น 0008 0009 เพราะ develop ใช้ 0007 แล้ว

**Decided:**
- D8 — share ล้มบอก "แชร์ไม่ได้" ; `S` ผ่าน `RoundHandlers.onShare` ใน `useRound` ; ผลแชร์ผูกกับ Round และกล่องอยู่ต่อเมื่อกดซ้ำ ; ปุ่มคัดลอกลิงก์ใช้ `shareOrCopy` ; `shareOrCopy` อยู่ `src/lib` ตาม spec แม้ยังมีผู้ใช้ feature เดียว

**For the next ticket:**
- feature review: ตัดสิน `src/lib/shareOrCopy.ts` — ย้ายเข้า `features/note-name-quiz/` ตาม "Where shared code goes" หรือแก้กติกาให้รับ helper ที่ spec ตั้งใจให้เกมถัดไปใช้ (D8)
- ยังไม่มี test ที่พิสูจน์ว่ากดซ้ำแล้ว region ว่างก่อนตั้งข้อความใหม่ (screen reader อ่านซ้ำ) — พิสูจน์ได้แค่บนเครื่องจริงหรือด้วย test ของ hook
- test "ผิด 27 ข้อ" ตรวจลำดับด้วย `buildShareText` เองบน 20 ข้อแรก ไม่ใช่ค่าคงที่
- ตรวจ share sheet บน iPhone จริงพร้อมกับ Blocked #1 ของ note-name-quiz หลัง deploy

**Checks:** `npx biome ci .` · `npm run typecheck` · `npm test` (89) · `npm run e2e` (104) · `npm run build` — all green

## Blocked

| # | Ticket | What | Needs | Status |
|---|---|---|---|---|
| 1 | 01 | รอ `note-name-quiz 06: Trial fixes 2026-11-09` merge เข้า `develop` (D6) | note-name-quiz 06 merged | done (PR #4 merged 2026-11-09) |

**2026-11-11:** เจ้าของตรวจ share sheet บน iPhone จริงแล้ว ใช้ได้ (Blocked #1 ปิด)
