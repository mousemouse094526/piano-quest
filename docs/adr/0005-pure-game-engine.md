# กติกาเกมเป็น pure reducer ที่รับเวลาและ seed จากข้างนอก

กติกาของแต่ละเกมเขียนเป็น reducer TypeScript ล้วน `(state, event) => state` ไม่ import React หรือ DOM และ `now` กับ `seed` ส่งเข้ามากับ event เท่านั้น เพราะทำให้ test กติกาได้เร็วและซ้ำผลได้โดยไม่ต้องรอ timer จริง ส่วน UI พิสูจน์ด้วย e2e flow เดียว ทางที่ไม่เลือกคือเขียนกติกาใน hook หรือ component แล้วใช้ timer จริง ซึ่ง test ช้าและผลไม่แน่นอน

Source: note-name-quiz D18, D21
