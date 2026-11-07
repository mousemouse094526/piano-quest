# 01: Scaffold + engine + deploy

**What to build:** เปิด `https://mousemouse094526.github.io/piano-quest/` แล้วเล่นรอบ `time` 30 วินาที ทิศโด→C Script ไทยได้ด้วยคีย์บอร์ด จบแล้วเห็นหน้า Results พื้นฐาน (ถูก ผิด ความแม่น) engine มีกติกาครบทุก Mode และทุก Direction พร้อม unit test แม้ UI ยังเลือก mode ไม่ได้

**Blocked by:** None (can start immediately)

**Covers:**
- Decisions: D4, D8, D10, D11, D12, D14, D15, D17, D18, D20, D21, D22, D23
- ADR: 0001, 0003, 0004, 0005, 0006
- Screens: Game (พื้นฐาน), Results (พื้นฐาน)
- Seams: 1
- User stories: 2
- Legal: 1, 3

**Status:** ready-for-agent

## Acceptance criteria

### Project และ CI
- `npm ci` แล้ว `npm run build` → ได้ `dist` ที่อ้าง asset ใต้ `/piano-quest/`
- push `main` → GitHub Actions รัน `biome ci .` typecheck `vitest run` build แล้ว deploy ขึ้น Pages
- pull request → รันการตรวจเหมือนกันแต่ไม่ deploy
- router ใช้ `createHashHistory` และ route `/` แบบ code-based
- ไม่มีการเรียก `localStorage` `sessionStorage` IndexedDB หรือ `document.cookie` ใน `src/`

### Engine (seam 1)
- ทุก bullet ใน spec.md › Seams › 1 เป็น unit test ที่ผ่าน
- type ตรงกับ spec.md › Engine contract

### เล่นได้
- เปิดหน้า → เห็น Prompt ภาษาไทย อีก 3 ข้อถัดไปจางๆ และ "กดปุ่มคำตอบเพื่อเริ่ม"
- กดปุ่มที่ตรงกับ Prompt บนคีย์บอร์ดภาษาไทยหรืออังกฤษ → ข้อต่อไปขึ้น และเวลาเริ่มนับ
- กด `Ctrl+C` หรือกด `C` ค้าง → ไม่ตอบหรือตอบแค่ครั้งเดียว
- ครบ 30 วินาที → หน้า Results แสดงถูก ผิด ความแม่น
- กด `Tab` → รอบใหม่ focus ไม่ย้าย
