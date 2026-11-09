# Piano Quest

เว็บมินิเกมฝึกทฤษฎีดนตรีสำหรับมือใหม่ เล่นทีละรอบสั้นๆ ไม่เก็บข้อมูล

## Language

**Player**:
คนที่เปิดเว็บมาเล่น ไม่มีบัญชีและไม่ถูกจำ
_Avoid_: User, member, account

**Round**:
การเล่นหนึ่งครั้ง ตั้งแต่ตอบข้อแรกจนจบตาม Mode แล้วแสดง Results
_Avoid_: Game, session, test

**Mode**:
แบบของ Round คือ `time` (จับเวลา) `count` (ครบจำนวนข้อ) หรือ `zen` (ไม่มีจบเอง)
_Avoid_: Level, difficulty

**Mode bar**:
แถบตั้งค่าด้านบนหน้าจอ ใช้เลือก Mode ความยาว Direction Script เสียง และเปิด Dialog ตั้ง Keymap
_Avoid_: Settings, toolbar, menu

**Direction**:
ทิศของคำถาม คือ solfège→letter (โด→C) letter→solfège (C→โด) หรือ mixed (สุ่มทุกข้อ)
_Avoid_: Mode, way

**Script**:
ตัวอักษรที่ใช้แสดงชื่อ solfège คือไทย (โด เร มี) หรืออังกฤษ (Do Re Mi)
_Avoid_: Language, locale

**Prompt**:
ชื่อโน้ตหนึ่งตัวที่แสดงให้ Player ตอบ
_Avoid_: Question, card, note

**Answer**:
ชื่อโน้ตที่ Player เลือกตอบ Prompt ด้วยปุ่มลัดหรือปุ่มแตะ
_Avoid_: Input, guess

**Key set**:
ปุ่มบนคีย์บอร์ด 7 ปุ่มที่ตอบฝั่งเดียวกัน คือชุด letter (C–B) หรือชุด solfège (โด–ที)
_Avoid_: Key group, row

**Keymap**:
การผูกปุ่มบนคีย์บอร์ดกับแต่ละ Answer ทั้ง 2 Key set รวม 14 ปุ่มไม่ซ้ำกัน ตั้งเองได้และอยู่ใน URL
_Avoid_: Key bindings, hotkeys, shortcuts, controls

**Results**:
หน้าสรุปตอนจบ Round แสดงความแม่น ความเร็ว และเฉลยทุก Prompt ที่ตอบผิด
_Avoid_: Score screen, summary, report
