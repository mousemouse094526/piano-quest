# 02: Mode bar + URL + Results ครบ

**What to build:** ผู้เล่นปรับ Mode ความยาว Direction และ Script ใน Mode bar ได้ ค่าอยู่ใน URL ให้ bookmark และ refresh ได้ ตอบผิดเห็นชัดโดยไม่พึ่งสี และหน้า Results แสดงความเร็วกับเฉลยทุกข้อที่ผิด

**Blocked by:** 01: Scaffold + engine + deploy

**Covers:**
- Decisions: D1, D2, D3, D7, D14, D15, D16, D20
- ADR: 0002
- Screens: Game, Results
- User stories: 1, 3, 4, 7, 8
- Legal: 2

**Status:** done

## Acceptance criteria

### Mode bar และ URL
- เลือก `count` 10 → URL มี `mode=count&len=10` รอบเริ่มใหม่ ตัวนับแสดง `0/10`
- เลือก `zen` → ไม่มีตัวนับเวลา มีปุ่มจบ ; ตอบ 3 ข้อแล้วกด `Esc` → หน้า Results
- เลือก Direction C→โด → Prompt เป็นตัวอักษร ตอบด้วยเลข 1–7
- เลือก สลับ → ทิศสุ่มทุกข้อ กดปุ่มผิดชุด → แถวปุ่มกระพริบป้ายปุ่มลัด ไม่นับผิด
- เลือก Script อังกฤษ → Prompt เป็น Do Re Mi ; refresh → ยังเป็นอังกฤษ
- เปิด `/#/?mode=xyz&len=7` → ใช้ค่าเริ่มต้น ไม่มี error
- เปลี่ยนค่าแล้วกดปุ่ม back ของเบราว์เซอร์ → ไม่ย้อนไปค่าเดิมทีละขั้น (`replace`)

### Focus และปุ่มลัด
- `Shift+Tab` จากพื้นที่เกม → focus เข้า Mode bar ; `Tab` ใน Mode bar ย้าย focus ตามปกติ
- `Esc` ใน Mode bar → focus กลับพื้นที่เกม ; popover ที่เปิดอยู่ปิดก่อน และ `zen` ไม่จบ
- แถบล่างแสดง `Tab` `Esc` `Shift+Tab`

### ตอบผิด
- ตอบผิด → Prompt สั่นและกระพริบแดง ตัวนับผิดเพิ่ม ไม่บอกเฉลย ไปข้อต่อไป

### Results
- แสดง ถูก ผิด ความแม่น โน้ตต่อนาที เวลาเฉลี่ยต่อข้อ และ Mode Direction Script ที่เล่น
- `zen` จบหลังตอบ 1 ข้อ → ความเร็วแสดง `—`
- ผิด 2 ข้อ → รายการ 2 แถว: Prompt สิ่งที่ตอบ คำตอบที่ถูก ; ไม่ผิด → "ไม่ผิดสักข้อ"
- เปลี่ยน Mode bar ที่หน้า Results → กลับหน้า Game รอบใหม่
