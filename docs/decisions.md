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
| Mode bar เป็น `ToggleGroup` เห็นทุกค่า ไม่มี popover ปุ่มเกมไม่รับ focus | [note-name-quiz](features/note-name-quiz/decisions.md) | D26 | — | — | active |

## ข้อมูลผู้เล่น

| Decision | Feature | D | Used by | ADR | Status |
|---|---|---|---|---|---|
| ไม่เก็บข้อมูลอะไรเลย ไม่มี server บัญชี storage cookie analytics | [note-name-quiz](features/note-name-quiz/decisions.md) | D4 | — | [0001](adr/0001-no-player-data.md) | active |
| ค่า Mode bar อยู่ใน URL search params | [note-name-quiz](features/note-name-quiz/decisions.md) | D16 | — | [0002](adr/0002-settings-in-url.md) | active |
| URL เขียนครบทุก param parser ใน `search.ts` ตัด query จริงก่อน `#` ตอนเปิดแอป | [note-name-quiz](features/note-name-quiz/decisions.md) | D27 | — | [0002](adr/0002-settings-in-url.md) | active |

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

## เนื้อหาจากภายนอก

| Decision | Feature | D | Used by | ADR | Status |
|---|---|---|---|---|---|
| เอาแค่ความคิด ลำดับ ข้อเท็จจริง ข้อความรูปเสียงทำเอง | [note-name-quiz](features/note-name-quiz/legal.md) | legal 1, 2 | — | [0006](adr/0006-own-content-only.md) | active |
