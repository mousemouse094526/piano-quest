# Flow: share-results

1 diagram, read in this order:
1. สิ่งที่เกิดเมื่อ Player กด "แชร์ผล" หรือ `S` บนหน้า Results

All diagrams use the same names as [spec.md](spec.md).

## 1. กด "แชร์ผล"

```mermaid
flowchart TD
    press["กด แชร์ผล หรือ S บนหน้า Results"] --> lock["ปุ่มกดไม่ได้จนจบ"]
    lock --> build["buildShareText จาก Round ที่แสดงอยู่"]
    build --> touch{"isCoarse<br/>และมี share?"}
    touch -->|ใช่| share["share({ text })"]
    touch -->|ไม่| hasCopy{"มี writeText?"}
    share -->|สำเร็จ: shared| quiet["ไม่แสดงอะไร"]
    share -->|AbortError หรือ InvalidStateError: dismissed| quiet
    share -->|ล้มด้วยเหตุอื่น: failed| box["กล่องข้อความที่มี Share text<br/>อยู่จนเริ่มรอบใหม่"]
    hasCopy -->|มี| copy["writeText(text)"]
    hasCopy -->|ไม่มี: failed| box
    copy -->|สำเร็จ: copied| copied["คัดลอกผลแล้ว<br/>หายเองหลัง 2 วินาที"]
    copy -->|ล้ม: failed| box
```

**กดแล้วข้อความไปทางไหน และ Player เห็นอะไร**
- share ล้มแล้วไม่ลองคัดลอกต่อ เพราะ activation ของการแตะถูกใช้ไปแล้ว (D7)
- กดซ้ำระหว่าง "คัดลอกผลแล้ว" ยังอยู่ เริ่มนับ 2 วินาทีใหม่และอ่านออกเสียงอีกครั้ง (D7)
- Share text สร้างตอนกดแล้วทิ้ง ไม่มีที่เก็บ (ADR-0001)
- `Tab` ยังเริ่มรอบใหม่ได้ทุกเมื่อ (note-name-quiz D14)
