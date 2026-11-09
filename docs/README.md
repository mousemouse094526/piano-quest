# Docs

What each folder is for. Start with `progress/board.md` to see where every
feature stands, and `decisions.md` before deciding anything.

| Folder | Holds | Written by | Read it when |
|---|---|---|---|
| `decisions.md` | ทุก decision ในโปรเจกต์ บรรทัดละข้อ แยกตามเรื่อง ลิงก์ไปตัวเต็ม | warroom skills ทันทีที่ตัดสิน | ก่อนถามหรือตัดสินอะไร |
| `features/{slug}/` | feature หนึ่งตัวคืออะไร: spec decisions flow legal | warroom | ทำงานกับ feature นั้น |
| `progress/` | งานที่กำลังทำ: `board.md` ของทุก feature แล้วแยกต่อ feature เป็น tickets progress log และ user-trials | warroom skills | หยิบงานต่อหรือเช็คสถานะ |
| `adr/` | กฎที่ทุก feature ต้องทำตาม ไฟล์สั้นๆ ไฟล์ละข้อ | warroom ตอน gate | เริ่ม feature ใดก็ตาม |
| `library-notes/` | สรุป docs ของภาษาและ library ตาม version ที่ติดตั้ง best practice และกับดัก | warroom-build ก่อนเขียน code | ก่อนเขียน code ที่เรียก library นั้น |
