# Decisions: share-results

## D1: ส่งผลเป็นข้อความสรุป ไม่ใช่ลิงก์หรือรูป

**Chosen:** ปุ่มแชร์ส่ง Share text (ข้อความล้วน) ที่สรุป Round นั้น Player วางใน LINE หรือแอปไหนก็ได้

**Why:** ผู้ปกครองอ่านข้อความใน LINE ได้ทันทีโดยไม่ต้องเปิดเว็บ และข้อความไม่ต้องมีที่เก็บผล จึงไม่ขัด ADR-0001

**Rejected:**
- ลิงก์ที่ผลเข้ารหัสอยู่ใน URL — ต้องทำหน้าใหม่สำหรับคนรับ URL ยาว และใครก็แก้ตัวเลขในลิงก์ได้
- รูปการ์ดผลจาก canvas — ต้องทำ layout และ font เอง (ADR-0006) งานเยอะกว่ามากสำหรับสิ่งที่ข้อความทำได้

**From:** interview · **Status:** active

## D2: ปุ่ม "แชร์ผล" ปุ่มเดียวบน Results ทุก Mode

**Chosen:** หน้า Results มีปุ่ม "แชร์ผล" (ไอคอน `Share2`) ข้างปุ่ม "เล่นอีกรอบ" ทุก Mode รวม `zen`

**Why:** ทุก Mode จบที่หน้า Results เดียวกันอยู่แล้ว (`zen` จบด้วย `Esc`) การแชร์จึงไม่ขึ้นกับ Mode

**Rejected:**
- เฉพาะ `time` กับ `count` — `zen` ก็มีผลให้ครูดูเหมือนกัน แยกกรณีไปก็ไม่ได้อะไร

**Details:**
- ปุ่มไม่มีปุ่มลัดบนคีย์บอร์ด `Tab` ยังเป็นเล่นอีกรอบตาม note-name-quiz D14
- ปุ่มไม่รับ focus จากการคลิกแบบเดียวกับปุ่มเกมอื่น (note-name-quiz D26)

**From:** code · **Status:** changed by D7

## D3: มือถือเปิด share sheet ของเครื่อง จอใหญ่คัดลอกข้อความ

**Chosen:** เครื่องที่ชี้ด้วยนิ้ว (`pointer: coarse`) และมี `navigator.share` → เปิด share sheet ด้วย Share text ; เครื่องอื่นทั้งหมด → คัดลอก Share text ลง clipboard แล้วบอกบนจอว่า "คัดลอกผลแล้ว"

**Why:** บนมือถือ share sheet ส่งเข้า LINE ได้ในแตะเดียว บน desktop share sheet ของ macOS หรือ Windows มักไม่มี LINE การคัดลอกแล้ววางจึงตรงกว่า

**Rejected:**
- คัดลอกอย่างเดียวทุกเครื่อง — บนมือถือต้องสลับแอปเองแล้ววาง ช้ากว่า share sheet
- share sheet ทุกเครื่องที่มี `navigator.share` — desktop Chrome บน macOS ก็มี แต่ sheet นั้นไม่ช่วยส่งเข้า LINE desktop

**Details:**
- Player ปิด share sheet เอง (`AbortError`) → ไม่ต้องแสดงอะไร
- `navigator.share` ล้มด้วยเหตุอื่น → คัดลอกแทนแล้วบอก "คัดลอกผลแล้ว"
- คัดลอกไม่ได้ → บอกบนจอว่า "คัดลอกไม่ได้ ลองแคปหน้าจอแทน"
- ข้อความบอกผลอยู่ใน region `aria-live="polite"` และหายไปเองหลัง 2 วินาที
- ใช้ตัวคัดลอกและข้อความยืนยันชุดเดียวกับปุ่มคัดลอกลิงก์ของ note-name-quiz ticket 06 (F12)

**Sources:**
- [MDN `Navigator.share()`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
- [MDN `Clipboard.writeText()`](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText)

**From:** interview · **Status:** changed by D7

## D4: Share text มีอะไรบ้าง

**Chosen:** Share text มีชื่อเว็บ ค่าตั้งของ Round ตัวเลขทั้ง 5 ของหน้า Results รายการข้อที่ผิดทุกข้อ และลิงก์เล่นค่าเดียวกัน ไม่มีชื่อ Player และไม่มีวันเวลา

**Why:** ครูอยากให้ผู้ปกครองเห็นสิ่งเดียวกับที่ครูเห็นบนจอ (note-name-quiz D15) รวมถึงข้อที่สับสน ส่วนชื่อคนเล่นไม่มีในระบบ (ADR-0001) และ LINE ใส่เวลาให้ทุกข้อความอยู่แล้ว

**Rejected:**
- ช่องให้พิมพ์ชื่อนักเรียนก่อนแชร์ — เพิ่มขั้นตอนและทำให้ข้อความระบุตัวเด็กได้ ครูพิมพ์ชื่อเองใน LINE ได้
- ใส่วันเวลาในข้อความ — ซ้ำกับเวลาของข้อความใน LINE
- ตัดรายการข้อผิดเหลือไม่กี่ข้อ — `count` 100 ผิดหมดยังยาวราว 2,000 ตัวอักษร ไม่เกินที่ LINE รับ

**Details:**
- ตัวอย่างเต็มอยู่ใน [sketch-share-text.md](sketch-share-text.md)
- ตัวเลขใช้รูปแบบเดียวกับบนจอ ค่าที่ไม่มีเป็น `—` (note-name-quiz D25)
- ชื่อโน้ตตาม Script ของ Round ป้ายอื่นเป็นภาษาไทยเหมือนบนจอ
- ลิงก์คือ URL ของหน้าเกมตอนนั้น ซึ่งมีค่าตั้งครบ (ADR-0002, note-name-quiz D27)

**From:** interview · **Status:** changed by D7

## D5: Seam สองจุด ตัวสร้าง Share text กับ e2e หนึ่ง flow

**Chosen:** test ตัวสร้าง Share text ซึ่งเป็น function ล้วนด้วย Vitest และพิสูจน์ปุ่มด้วย e2e flow เดียวทั้ง `Desktop Chrome` และ `iPhone 15`

**Why:** ข้อความทั้งหมดตรวจได้เร็วโดยไม่ต้องมีจอ (แนวเดียวกับ ADR-0005) ส่วนการเลือกระหว่าง share sheet กับคัดลอกเห็นได้ผ่าน UI เท่านั้น

**Rejected:**
- e2e อย่างเดียว — ตรวจทุกแบบของข้อความผ่าน UI ช้าและต้องเล่นหลาย Round

**From:** interview · **Status:** changed by D7

## D6: เริ่มสร้างหลัง note-name-quiz ticket 06 merge

**Chosen:** ticket ของ share-results รอ `note-name-quiz 06: Trial fixes 2026-11-09` เข้า `develop` ก่อน

**Why:** ticket 06 สร้างตัวคัดลอกกับข้อความยืนยัน (F12) และแก้หน้า Results (F5, F11) ถ้าสร้างพร้อมกันจะได้ตัวคัดลอกสองชุดและ conflict ในหน้า Results

**Rejected:**
- สร้างก่อน แล้วให้ ticket 06 มาใช้ของเรา — ticket 06 อยู่ลำดับก่อนบน board และกำลังจะเริ่ม

**From:** interview · **Status:** active

## D7: แก้จาก red team: ทางล้ม ความยาว ปุ่มลัด และ seam

**Chosen:** ชุดกติกาจาก red team ที่แก้ D2 D3 D4 และ D5 ตามรายการด้านล่าง

**Details:**
- **share sheet ล้ม:** ไม่ลองคัดลอกต่อ แสดง Share text ในกล่องข้อความอ่านอย่างเดียวที่เลือกคัดลอกเองได้ (แทนข้อ "ล้มด้วยเหตุอื่น → คัดลอก" ของ D3) — `navigator.share` ใช้ user activation ของการแตะไปแล้ว `writeText` หลังจากนั้นจะถูกปฏิเสธบน Safari
- **คัดลอกล้ม:** แสดงกล่องข้อความเดียวกัน แทน "คัดลอกไม่ได้ ลองแคปหน้าจอแทน" ของ D3 กล่องอยู่จนเริ่มรอบใหม่ — การแคปจอคือสิ่งที่ Problem บอกว่าไม่อยากทำ
- **กดซ้ำระหว่าง share sheet เปิด:** ปุ่มกดไม่ได้จน `navigator.share` จบ `InvalidStateError` ถือเหมือน `AbortError` — กดซ้ำไม่ใช่ความผิดพลาด
- **ข้อความบอกผล:** region `aria-live="polite"` อยู่ตลอดหน้า Results ทุกครั้งที่กดล้างแล้วใส่ข้อความใหม่ — จะได้อ่านออกเสียงทุกครั้ง แม้ข้อความเหมือนเดิม
- **ข้อที่ผิดเกิน 20 แถว:** Share text แสดง 20 แถวแรกตามลำดับที่ตอบ แล้ว "และอีก N ข้อ" (แก้ Rejected ข้อสามของ D4) — `zen` กับ `time` 120 ผิดได้หลายร้อยข้อ ยาวเกินที่ LINE รับ
- **ปุ่มลัด `S`:** หน้า Results กด `S` (`KeyS`) = กด "แชร์ผล" ปุ่มมีป้าย `Kbd` `S` ที่ซ่อนบนจอสัมผัสเหมือนป้ายอื่น (แทน "ไม่มีปุ่มลัด" ของ D2) — ปุ่มเกมไม่รับ focus (note-name-quiz D26) คนใช้คีย์บอร์ดล้วนจึงไปถึงปุ่มไม่ได้ถ้าไม่มีปุ่มลัด
- **seam:** เพิ่ม seam ของการเลือก share หรือคัดลอก เป็น function ที่รับ `share` `writeText` และ `isCoarse` จากข้างนอก test ด้วย Vitest ; e2e เหลือทางปกติของแต่ละเครื่อง (แก้ D5) — ทางล้มทุกแบบตรวจได้เร็วโดยไม่ต้อง stub ใน browser
- **ตัวคัดลอก:** share-results เป็นเจ้าของสัญญาของตัวคัดลอก (spec › Share or copy) ปุ่มคัดลอกลิงก์ของ note-name-quiz ticket 06 ย้ายมาใช้ตัวเดียวกันใน ticket ของเรา — ticket 06 ไม่ได้กำหนดรูปร่างของตัวคัดลอกไว้

**From:** red team · **Status:** active

## Sources

- [MDN `Navigator.share()`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) — share sheet, `AbortError` (accessed 2026-11-09)
- [MDN `Clipboard.writeText()`](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText) — คัดลอกข้อความ (accessed 2026-11-09)
