# 03: มือถือ + เสียง + e2e

**What to build:** ผู้เล่นบนมือถือแตะปุ่ม 7 ปุ่มตอบได้ทั้งรอบ เปิดเสียงแล้วได้ยินโน้ตเมื่อตอบถูกแม้ iPhone เปิดโหมดเงียบ และ flow การเล่นทั้งหมดมี e2e บน Chromium และ WebKit iPhone รันใน CI

**Blocked by:** 02: Mode bar + URL + Results ครบ

**Covers:**
- Decisions: D5, D6, D20, D21
- Screens: Game
- Seams: 2
- User stories: 5, 6

**Status:** done

## Acceptance criteria

### ปุ่มแตะ
- แตะปุ่ม `G` บนจอ → ผลเหมือนกด `G`
- ป้ายปุ่มเปลี่ยนตาม Direction ของข้อนั้น พร้อมปุ่มลัดเล็กกำกับ
- แตะปุ่มแล้วกด Enter หรือ Space → ไม่ตอบซ้ำ (ปุ่มไม่รับ focus)
- ตอบผิดด้วยปุ่มแตะ → ปุ่มนั้นขึ้น `X` ชั่วครู่
- viewport 375 px → ปุ่ม 7 ปุ่มอยู่ในแถวเดียวไม่ล้นจอ

### เสียง
- กดปุ่มเสียง (`VolumeX` → `Volume2`) กลางรอบ → URL มี `sound=on` ตัวนับไม่รีเซ็ต
- เปิดเสียงแล้วตอบถูก → ได้ยินเสียงโน้ตนั้น ; ตอบผิด → ไม่มีเสียง
- `AudioContext` ใช้ไม่ได้หรือ throw → เกมเดินต่อ ไม่มี error ใน console
- iPhone เปิดโหมดเงียบ เปิดเสียงในเกม ตอบถูก → ได้ยินเสียง (ตรวจด้วยมือ บันทึกใน progress.md)

### e2e (seam 2)
- ทุก bullet ใน spec.md › Seams › 2 เป็น Playwright test ที่ผ่านบน Chromium และ WebKit `iPhone` (e2e)
- CI รัน Playwright ก่อน build และ deploy
