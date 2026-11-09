# 04: Keymap ใน URL + ป้ายบนปุ่มคำตอบ

**What to build:** ผู้เล่นเปิดลิงก์ที่มี `letter-keys` หรือ `solfege-keys` แล้วตอบด้วยปุ่มที่ลิงก์กำหนด ปุ่มคำตอบบนจอแสดงป้ายปุ่มที่ผูกอยู่ ลิงก์ผิดหรือไม่มี Keymap เล่นด้วยปุ่มเดิม และ bookmark แล้วเปิดใหม่ได้ Keymap เดิม

**Blocked by:** None (can start immediately)

**Covers:**
- Decisions: D32, D33, D34, D38, D39
- ADR: 0002, 0007
- Screens: Game
- Seams: 2
- User stories: 10, 11

**Status:** ready-for-agent

## Acceptance criteria

### URL
- เปิดหน้าโดยไม่มี Keymap → URL มี `letter-keys=CDEFGAB` และ `solfege-keys` เป็น `1234567` (D27, D34)
- `letter-keys=asdfghj` → อ่านเป็น `ASDFGHJ`
- ค่ายาวไม่ใช่ 7 มีตัวนอกตาราง D38 หรือซ้ำในชุด → param นั้นเป็นค่าเริ่มต้น ไม่มี error (e2e)
- คู่ที่ได้หลัง fallback มีปุ่มซ้ำข้ามชุด (เช่น `AAAAAAA` กับ `ASDFGHJ`) → ทั้งสองเป็นค่าเริ่มต้น
- ค่าที่ JSON เปลี่ยนรูป (`1234.50` `1e23456` `[12345]`) → ค่าเริ่มต้น
- `solfege-keys=1234567` ที่พิมพ์เองไม่มี `"` → อ่านได้ ; refresh → Keymap เดิม

### ตอบด้วย Keymap
- `letter-keys=ASDFGHJ` Prompt ซอล กด `G` → นับถูก ; กด `C` → ไม่มีอะไรเกิด (e2e)
- กด `Numpad5` ในทิศ C→โด กับ Keymap ค่าเริ่มต้น → ตอบ ซอล (e2e)
- ทิศสลับ กดปุ่มของ Key set อื่น → กระพริบป้าย ไม่นับผิด เหมือนเดิม (D20)
- ปุ่มนอกตาราง D33 ไม่เคยเป็นคำตอบ แม้ใส่มาใน URL

### ป้ายและมือถือ
- ปุ่มคำตอบ C ขึ้นป้าย `A` เมื่อ `letter-keys=ASDFGHJ` ; ป้ายเครื่องหมายตามตาราง D38 (e2e)
- viewport iPhone กับ `letter-keys=ASDFGHJ` แตะปุ่มคำตอบครบ 10 ข้อ → หน้า Results (e2e)
- unit test ของ parse และการแปลง `code` ครบตาม spec.md › Testing decisions
