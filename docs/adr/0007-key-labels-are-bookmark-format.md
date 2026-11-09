# ปุ่มคีย์บอร์ดอ่านจาก `code` และเขียนด้วยตารางป้าย US QWERTY ตารางเดียว

เกมอ่านปุ่มจาก `KeyboardEvent.code` เสมอ ส่วนป้ายบนจอและตัวอักษรของ Keymap ใน URL มาจากตารางป้ายแป้น US QWERTY ตายตัวตารางเดียว ตารางนี้จึงเป็นส่วนหนึ่งของสัญญากับ bookmark (ADR-0002) เพิ่มปุ่มได้ แต่ลบปุ่มหรือเปลี่ยนป้ายทำให้ลิงก์ที่ผู้เล่นเก็บไว้กลับเป็นค่าเริ่มต้น เลือกแบบนี้แทนป้ายตาม layout จริงของเครื่อง เพราะ `getLayoutMap()` มีแค่ Chromium และเกมถัดไปที่ตอบด้วยคีย์บอร์ดต้องใช้ตารางเดียวกันนี้

Source: note-name-quiz D14, D33, D34, D38

Links: [Keyboard.getLayoutMap()](https://developer.mozilla.org/en-US/docs/Web/API/Keyboard/getLayoutMap)
