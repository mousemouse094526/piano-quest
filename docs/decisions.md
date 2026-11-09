# Decisions

Every decision in the project, by subject. Check here before asking a
question; the full entry is in the feature's decisions.md.

## ชื่อและการ host

| Decision | Feature | D | Used by | ADR | Status |
|---|---|---|---|---|---|
| Host ฟรีบน GitHub Pages จาก public repo deploy ด้วย GitHub Actions | [note-name-quiz](features/note-name-quiz/decisions.md) | D10 | — | [0003](adr/0003-github-pages-static.md) | changed by D19 |
| ชื่อเว็บ Note Quest repo `mousemouse094526/note-quest` path `/note-quest/` | [note-name-quiz](features/note-name-quiz/decisions.md) | D19 | — | — | superseded by D22 |
| ชื่อเว็บ Piano Quest repo `mousemouse094526/piano-quest` path `/piano-quest/` | [note-name-quiz](features/note-name-quiz/decisions.md) | D22 | — | [0003](adr/0003-github-pages-static.md) | active |

## Stack และ UI

| Decision | Feature | D | Used by | ADR | Status |
|---|---|---|---|---|---|
| UI ใช้ shadcn/ui กับ Tailwind ไอคอนใช้ Lucide | [note-name-quiz](features/note-name-quiz/decisions.md) | D8 | — | — | active |
| ไม่ทำ design แยก ใช้ shadcn ค่าเริ่มต้น | [note-name-quiz](features/note-name-quiz/decisions.md) | D9 | — | — | active |
| React SPA บน Vite กับ TanStack Router แบบ hash history | [note-name-quiz](features/note-name-quiz/decisions.md) | D11 | — | [0004](adr/0004-hash-history.md) | active |
| ธีมสว่างมืดตามระบบ ไม่มีปุ่มสลับ | [note-name-quiz](features/note-name-quiz/decisions.md) | D17 | — | — | active |
| Biome ตรวจเฉพาะ code รูปแบบ code และห้าม browser storage ด้วย lint กับ test | [note-name-quiz](features/note-name-quiz/decisions.md) | D24 | — | [0001](adr/0001-no-player-data.md) | active |
| Mode bar เป็น `ToggleGroup` เห็นทุกค่า ไม่มี popover ปุ่มเกมไม่รับ focus | [note-name-quiz](features/note-name-quiz/decisions.md) | D26 | — | — | changed by D35 |
| สีเน้นเขียวมิ้นต์ของเราเอง (`--brand`) และ animation ตอบ เลื่อน Prompt นับผล เวลาใกล้หมด | [note-name-quiz](features/note-name-quiz/decisions.md) | D31 | — | [0006](adr/0006-own-content-only.md) | changed by D44 |
| แก้ตาม user trial 2026-11-09: วิธีเล่นก่อนข้อแรก ข้อที่ตอบผิดค้างสีแดง ข้อความกดผิดชุด คำใบ้ `Esc` ซ่อนคำใบ้คีย์บอร์ดบนจอสัมผัส ป้าย Direction ตาม Script ปุ่มคัดลอกลิงก์ ตัวเลข Results นับขึ้นพร้อมกัน | [note-name-quiz](features/note-name-quiz/decisions.md) | D44 | — | — | active |
| ตั้งปุ่มลัดใน Dialog จากปุ่ม `Keyboard` ท้าย Mode bar ปุ่มเกมไม่ทำงานขณะเปิด ปิดแล้ว focus กลับเกม | [note-name-quiz](features/note-name-quiz/decisions.md) | D35 | — | — | active |
| ป้ายปุ่มลัดตามแป้น US QWERTY ตายตัว | [note-name-quiz](features/note-name-quiz/decisions.md) | D38 | — | [0007](adr/0007-key-labels-are-bookmark-format.md) | active |
| ปุ่มตั้งปุ่มลัดและป้ายปุ่มแสดงทุกจอ ไม่ตรวจว่ามีคีย์บอร์ด | [note-name-quiz](features/note-name-quiz/decisions.md) | D39 | — | — | changed by D44 |

## ข้อมูลผู้เล่น

| Decision | Feature | D | Used by | ADR | Status |
|---|---|---|---|---|---|
| ไม่เก็บข้อมูลอะไรเลย ไม่มี server บัญชี storage cookie analytics | [note-name-quiz](features/note-name-quiz/decisions.md) | D4 | — | [0001](adr/0001-no-player-data.md) | active |
| ค่า Mode bar อยู่ใน URL search params | [note-name-quiz](features/note-name-quiz/decisions.md) | D16 | — | [0002](adr/0002-settings-in-url.md) | active |
| URL เขียนครบทุก param parser ใน `search.ts` ตัด query จริงก่อน `#` ตอนเปิดแอป | [note-name-quiz](features/note-name-quiz/decisions.md) | D27 | — | [0002](adr/0002-settings-in-url.md) | active |
| Keymap ใน URL: `letter-keys` `solfege-keys` ค่าละ 7 ตัวอักษร เขียนครบ ผิด → ค่าเริ่มต้น ชนกันหลัง fallback → ทั้งคู่ค่าเริ่มต้น | [note-name-quiz](features/note-name-quiz/decisions.md) | D34 | — | [0007](adr/0007-key-labels-are-bookmark-format.md) | active |

## การเล่นเกม

| Decision | Feature | D | Used by | ADR | Status |
|---|---|---|---|---|---|
| หน้าตาและการเล่นแบบ Monkeytype มี Mode bar ปรับได้ทุกอย่าง | [note-name-quiz](features/note-name-quiz/decisions.md) | D1 | — | — | active |
| Mode `time` `count` `zen` กับ Direction 3 แบบ | [note-name-quiz](features/note-name-quiz/decisions.md) | D2 | — | — | active |
| ตอบผิดแล้วข้ามไป เฉลยตอนจบ Round | [note-name-quiz](features/note-name-quiz/decisions.md) | D7 | — | — | active |
| กติกาเล็ก: `KeyboardEvent.code` `Tab` `Esc` เริ่มนับเวลาตอนตอบข้อแรก | [note-name-quiz](features/note-name-quiz/decisions.md) | D14 | — | — | active |
| ค่าบนหน้า Results | [note-name-quiz](features/note-name-quiz/decisions.md) | D15 | — | — | active |
| ตอบน้อยกว่า 2 ข้อ ความเร็วแสดง `—` | [note-name-quiz](features/note-name-quiz/decisions.md) | D25 | — | — | active |
| แก้จาก red team: เวลา deadline ปุ่มที่ไม่นับ focus เสียง สัญญาณที่ไม่พึ่งสี | [note-name-quiz](features/note-name-quiz/decisions.md) | D20 | — | [0002](adr/0002-settings-in-url.md) | active |
| มือถือใช้ปุ่มแตะ 7 ปุ่ม | [note-name-quiz](features/note-name-quiz/decisions.md) | D6 | — | — | active |
| เสียงโน้ตสังเคราะห์เมื่อตอบถูก เปิดปิดได้ ค่าเริ่มต้นปิด | [note-name-quiz](features/note-name-quiz/decisions.md) | D5 | — | — | active |
| `X` บนปุ่มที่ผิดจนกว่าจะตอบข้อถัดไป ตัวเล่นเสียงตัวเดียวทั้งแอป ปุ่มแตะเป็น grid 7 ช่อง | [note-name-quiz](features/note-name-quiz/decisions.md) | D29 | — | — | active |
| กติกาต่อ Mode อยู่ใน `engine/modes.ts` ; Mode bar บรรทัดเดียวจาก `lg` (`main` `max-w-4xl`) | [note-name-quiz](features/note-name-quiz/decisions.md) | D30 | — | — | active |
| Keymap 2 Key set ชุดละ 7 ปุ่มไม่ซ้ำ `Numpad` เท่ากับ `Digit` | [note-name-quiz](features/note-name-quiz/decisions.md) | D32 | — | — | active |
| ผูกได้ 47 ปุ่ม: A–Z 0–9 และเครื่องหมาย 11 ปุ่ม ห้าม `Tab` `Esc` `Enter` `Space` | [note-name-quiz](features/note-name-quiz/decisions.md) | D33 | — | [0007](adr/0007-key-labels-are-bookmark-format.md) | active |
| ผูกปุ่มที่ Answer อื่นใช้อยู่ → สลับปุ่มกัน | [note-name-quiz](features/note-name-quiz/decisions.md) | D36 | — | — | active |
| เปลี่ยน Keymap แล้วเริ่มรอบใหม่ เหมือนค่า Mode bar อื่น | [note-name-quiz](features/note-name-quiz/decisions.md) | D37 | — | — | extended by D40 |
| เปิด Dialog ปุ่มลัดแล้วเริ่มรอบใหม่ เวลาไม่เดินระหว่างเปิด | [note-name-quiz](features/note-name-quiz/decisions.md) | D40 | — | — | active |
| Keymap ใน search เป็นป้าย `keymapOf` แปลงเป็น `code` ; รอบใหม่เมื่อทุก param ยกเว้น `sound` เปลี่ยน | [note-name-quiz](features/note-name-quiz/decisions.md) | D41 | — | [0007](adr/0007-key-labels-are-bookmark-format.md) | active |
| Dialog ปุ่มลัดอยู่ใน Mode bar ; จำนวนครั้งที่เปิดต่อท้าย Round key ; ref Dialog เปิดผ่าน `KeyRouting` | [note-name-quiz](features/note-name-quiz/decisions.md) | D42 | — | — | active |
| Dialog ปุ่มลัด: modifier ที่กดเดี่ยวขณะรอปุ่ม ไม่มีอะไรเกิด ; `Shift` + ปุ่ม ผูกปุ่มนั้น | [note-name-quiz](features/note-name-quiz/decisions.md) | D43 | — | — | active |

## เนื้อหาดนตรี

| Decision | Feature | D | Used by | ADR | Status |
|---|---|---|---|---|---|
| Script solfège ไทยหรืออังกฤษ ตอบด้วยเลข 1–7 | [note-name-quiz](features/note-name-quiz/decisions.md) | D3 | — | — | active |
| Fixed Do กับ 7 โน้ตธรรมชาติเท่านั้น | [note-name-quiz](features/note-name-quiz/decisions.md) | D12 | — | — | active |
| เกมถัดไปตามหลักสูตรฟรีทำเป็น feature ใหม่ เนื้อหาเขียนเอง | [note-name-quiz](features/note-name-quiz/decisions.md) | D13 | — | [0006](adr/0006-own-content-only.md) | active |

## การทดสอบ

| Decision | Feature | D | Used by | ADR | Status |
|---|---|---|---|---|---|
| Seam สองจุด: game engine กับ e2e หนึ่ง flow | [note-name-quiz](features/note-name-quiz/decisions.md) | D18 | — | [0005](adr/0005-pure-game-engine.md) | active |
| Vitest Playwright Biome code-based route npm | [note-name-quiz](features/note-name-quiz/decisions.md) | D21 | — | [0005](adr/0005-pure-game-engine.md) | active |
| Conventions web app ใน `.claude/skills/vite-react-web/` | [note-name-quiz](features/note-name-quiz/decisions.md) | D23 | — | — | active |
| Playwright: `Desktop Chrome` กับ `iPhone 15` build ใหม่ทุกครั้งที่ port 4317 CI รันก่อน build | [note-name-quiz](features/note-name-quiz/decisions.md) | D28 | — | — | active |

## เนื้อหาจากภายนอก

| Decision | Feature | D | Used by | ADR | Status |
|---|---|---|---|---|---|
| เอาแค่ความคิด ลำดับ ข้อเท็จจริง ข้อความรูปเสียงทำเอง | [note-name-quiz](features/note-name-quiz/legal.md) | legal 1, 2 | — | [0006](adr/0006-own-content-only.md) | active |
