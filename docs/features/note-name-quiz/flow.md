# Flow: note-name-quiz

2 diagrams, read in this order:
1. สถานะของรอบ ตั้งแต่เปิดหน้าจนถึงหน้า Results
2. สิ่งที่เกิดเมื่อผู้เล่นกดปุ่มหรือแตะปุ่มตอบหนึ่งครั้ง

All diagrams use the same names as [spec.md](spec.md).

## 1. สถานะของรอบ

```mermaid
stateDiagram-v2
    [*] --> ready: เปิดหน้า / start(settings, seed)
    ready --> running: answer ข้อแรก (เริ่มนับเวลา)
    running --> running: answer ถูก หรือ ผิด
    running --> finished: count ตอบครบ len ข้อ
    running --> finished: zen กด Esc หรือปุ่มจบ (end)
    ready --> ready: zen end ก่อนตอบ
    finished --> ready: Tab หรือปุ่มเล่นอีกรอบ
    finished --> ready: เปลี่ยน Mode bar
    running --> ready: Tab หรือเปลี่ยน Mode bar (ยกเว้นเสียง)
    running --> finished: time answer หรือ tick เลย deadline
    ready --> ready: เปลี่ยน Mode bar
    finished --> [*]: ปิด tab (ไม่เก็บอะไร)
```

**รอบหนึ่งเริ่ม จบ และเริ่มใหม่เมื่อไร**
- `finished` แสดงหน้า Results ค่าตาม D15
- answer หลัง `finished` ไม่มีผล (spec.md › Engine contract)
- ปิด tab แล้วผลหายหมด (D4)
- เปลี่ยน Mode bar → แทนที่ URL แล้วเริ่มรอบใหม่ ยกเว้นเปิดปิดเสียงที่รอบเดิมเล่นต่อ (D14, D16, D20)
- `time` จบที่ `deadline` เสมอ แม้ `tick` มาช้า คำตอบหลัง deadline ไม่นับ (D20)

## 2. ตอบหนึ่งครั้ง

```mermaid
flowchart TD
    A[keydown หรือแตะปุ่มตอบ] --> A1{repeat หรือ modifier<br/>หรือ focus ใน Mode bar}
    A1 -- ใช่ --> Z0[ไม่สนใจ]
    A1 -- ไม่ --> B{ปุ่มเป็นคำตอบ<br/>ของทิศข้อนี้ไหม}
    B -- ไม่ใช่ --> Z[กระพริบป้ายปุ่มลัด ไม่นับผิด]
    B -- ใช่ --> C{สถานะ}
    C -- finished --> Z0
    C -- ready --> D[เริ่มนับเวลา]
    D --> E{ตรงกับ Prompt ไหม}
    C -- running --> T{time เลย deadline ไหม}
    T -- เลย --> M
    T -- ไม่ --> E
    E -- ถูก --> F[นับถูก]
    F --> I[เลื่อน Prompt ข้อถัดไป]
    I --> G{เปิดเสียงไหม}
    G -- เปิด --> H[resume แล้วเล่นเสียง error ถูกกลืน]
    E -- ผิด --> J[นับผิด บันทึก Prompt สิ่งที่ตอบ คำตอบที่ถูก]
    J --> K[สั่น กระพริบแดง X บนปุ่ม ตัวนับผิดเพิ่ม]
    K --> I
    I --> L{count ครบ len ข้อไหม}
    L -- ครบ --> M[finished แสดง Results]
    L -- ไม่ครบ --> N[รอคำตอบถัดไป]
```

**ปุ่มหนึ่งครั้งกลายเป็นผลอะไร**
- อ่านปุ่มจาก `KeyboardEvent.code` คีย์บอร์ดภาษาไทยก็ตอบได้ (D14)
- ทิศโด→C ตอบด้วยปุ่มลัด letter ทิศ C→โด ตอบด้วยเลข 1–7 (D3, spec.md › Data)
- ปุ่มแตะบนจอเข้าทางเดียวกับคีย์บอร์ด (D6)
- สร้าง `AudioContext` ตอนกดเปิดเสียง engine อัปเดตก่อนเล่นเสียงเสมอ (D5, D20)
- `Tab` กับ `Esc` ไปที่ diagram 1 ไม่ผ่านแผนภาพนี้ (D20)
