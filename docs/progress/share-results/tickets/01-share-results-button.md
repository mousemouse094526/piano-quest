# 01: ปุ่มแชร์ผลบนหน้า Results

**What to build:** Player จบ Round แล้วกด "แชร์ผล" หรือ `S` บนหน้า Results ได้ Share text ที่สรุปรอบนั้น บนมือถือส่งผ่าน share sheet ของเครื่อง บนจอใหญ่คัดลอกให้วางเอง และถ้าทั้งสองทางใช้ไม่ได้ก็เห็นข้อความในกล่องให้คัดลอกเอง ปุ่มคัดลอกลิงก์ของ note-name-quiz ใช้ตัวคัดลอกตัวเดียวกัน

**Blocked by:** note-name-quiz 06: Trial fixes 2026-11-09

**Covers:**
- Decisions: D1, D2, D3, D4, D5, D6, D7, note-name-quiz D7, D9, D14, D15, D25, D26, D27
- ADR: 0001, 0002, 0004, 0008, 0009
- Screens: Results
- Seams: 1, 2, 3
- User stories: 1, 2, 3, 4, 5, 6
- Legal: 1, 2

**Status:** ready-for-agent

## Acceptance criteria

### Share text (seam 1)
- `count` 10 ไทย `solfege-to-letter` ถูก 8 ผิด 2 ใช้เวลา 15 วินาที กับ URL ของ sketch → `buildShareText` คืนตรงกับตัวอย่างแรกใน [sketch-share-text.md](../../../features/share-results/sketch-share-text.md) ทุกตัวอักษร
- `zen` ตอบถูก 1 ข้อ → ความเร็วทั้งสองค่าเป็น `—` และมีบรรทัด `ไม่ผิดสักข้อ`
- `mixed` ไทย ผิดที่โจทย์ `G` ตอบ ฟา → แถว `G / ฟา / ซอล`
- ผิด 27 ข้อ → 20 แถวแรก แล้ว `และอีก 7 ข้อ`
- ผิด 1,000 ข้อ → ยาวไม่เกิน 1,000 ตัวอักษร
- `ResultsScreen` กับ Share text ใช้ `asWhole` `asPercent` `asSeconds` `NO_VALUE` จาก `components/format.ts` ชุดเดียว

### เลือก share หรือคัดลอก (seam 2)
- ทุกแถวใน spec.md › Seams 2 ผ่านด้วย Vitest โดย `shareOrCopy` ไม่อ่าน `navigator` หรือ `matchMedia` เอง
- `share` reject ด้วยเหตุอื่นนอกจาก `AbortError` หรือ `InvalidStateError` → `'failed'` และไม่เรียก `writeText`

### หน้า Results (seam 3)
- `Desktop Chrome` จบ `count` 10 ผิด 2 คลิก "แชร์ผล" → เห็น "คัดลอกผลแล้ว" แล้วหายหลัง 2 วินาที ; ข้อความที่คัดลอกขึ้นต้นด้วย `Piano Quest — ผลรอบนี้` มี `ผิด 2` ; ไม่มี request ใหม่ (e2e)
- `Desktop Chrome` เปิดลิงก์จากข้อความที่คัดลอก → Mode bar แสดงค่าตั้งของรอบเดิม (e2e)
- `Desktop Chrome` จบรอบแล้วกด `S` → คัดลอกเหมือนคลิก ; กด `Tab` ต่อ → เริ่มรอบใหม่ (e2e)
- `Desktop Chrome` `writeText` ล้ม → เห็นกล่องข้อความอ่านอย่างเดียวที่มี Share text อยู่จนเริ่มรอบใหม่ (e2e)
- `iPhone 15` จบ `count` 10 แตะ "แชร์ผล" → `navigator.share` ถูกเรียกครั้งเดียวด้วย `text` ที่มี `ผิด` ไม่มีการคัดลอก ; ไม่เห็นป้าย `S` (e2e)
- ปุ่ม "แชร์ผล" ไม่รับ focus จาก `Tab` หรือคลิก และกดไม่ได้ระหว่างรอ share (ADR-0009)
- region `aria-live="polite"` อยู่ตลอดหน้า Results และข้อความถูกตั้งใหม่ทุกครั้งที่กด

### ตัวคัดลอกตัวเดียว
- ปุ่มคัดลอกลิงก์ของ note-name-quiz ticket 06 (F12) เรียก `shareOrCopy` จาก `src/lib` และ e2e เดิมของมันยังผ่าน

### ไม่เก็บข้อมูล
- `src/no-player-data.test.ts` ผ่านโดยไม่แก้
