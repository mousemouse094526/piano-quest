# Decisions: note-name-quiz

## D1: หน้าตาและการเล่นแบบ Monkeytype

**Chosen:** หน้าจอเรียบ มีแถบตั้งค่า (Mode bar) ด้านบนให้ปรับทุกอย่างได้ เล่นด้วยคีย์บอร์ดเป็นหลัก

**Why:** ผู้ใช้อยากปรับ mode ได้ทั้งหมดแบบ Monkeytype และอยากได้ UI เรียบๆ

**Rejected:**
- รูปแบบรอบตายตัวแบบเดียว (60 วินาที หรือ 20 ข้อ) — ผู้ใช้อยากเลือกเอง

**Details:**
- เอาแค่แนวการเล่น (แถบตั้งค่า ปุ่มลัด หน้าผลลัพธ์) ไม่ลอกโลโก้ สี หรือหน้าตาของ Monkeytype

**From:** interview · **Status:** active

## D2: ตัวเลือกใน Mode bar

**Chosen:** แบบรอบ 3 แบบ คือ `time` (15/30/60/120 วินาที) `count` (10/25/50/100 ข้อ) และ `zen` (ไม่มีจบ) บวกทิศคำถาม 3 แบบ คือ โด→C, C→โด และสลับ

**Why:** ผู้ใช้เลือกชุดนี้

**Rejected:**
- `time` กับ `count` อย่างเดียว ไม่มี `zen` — ผู้ใช้อยากมีโหมดฝึกอิสระด้วย
- `time` อย่างเดียว — ปรับได้น้อยเกินไป

**Details:**
- ค่าเริ่มต้น: `time` 30 วินาที กับทิศโด→C — ผู้วางแผนเลือก แก้ได้ที่ gate
- ความยาวเริ่มต้นเมื่อเปลี่ยนเป็น `count` คือ 25 ข้อ
- ทิศ "สลับ" สุ่มทิศใหม่ทุกข้อ

**From:** interview · **Status:** active

## D3: ชื่อ solfège สลับไทยหรืออังกฤษได้ ตอบด้วยเลข 1–7

**Chosen:** Mode bar มีตัวเลือกตัวอักษร solfège คือไทย (โด เร มี ฟา ซอล ลา ที) หรืออังกฤษ (Do Re Mi Fa Sol La Ti) ทิศ C→โด ตอบด้วยการกดเลข 1–7 (โด=1 ถึง ที=7) ไม่ว่าเลือกแบบไหน

**Why:** ผู้ใช้อยากสลับได้เอง การตอบด้วยเลขทำให้ไม่ต้องสลับภาษาคีย์บอร์ด

**Rejected:**
- พิมพ์ชื่อไทยเป็นคำตอบ — ต้องสลับคีย์บอร์ด พิมพ์ช้า สะกดได้หลายแบบ (ซอล/ซล)
- ไทยอย่างเดียว หรืออังกฤษอย่างเดียว — ผู้ใช้อยากเลือกเอง

**Details:**
- ค่าเริ่มต้น: ไทย
- ปุ่มบนจอแสดงชื่อตามตัวอักษรที่เลือก พร้อมเลขเล็กกำกับ

**From:** interview · **Status:** active

## D4: ไม่เก็บข้อมูลอะไรเลย

**Chosen:** ไม่มี server ไม่มีบัญชี ไม่ใช้ `localStorage` `sessionStorage` IndexedDB หรือ cookie ไม่มี analytics ปิด tab แล้วผลหายหมด

**Why:** ผู้ใช้อยากให้เป็นมินิเกมเข้ามาเล่นอย่างเดียว ไม่เก็บอะไรเลย

**Rejected:**
- จำค่า Mode bar และสถิติดีสุดในเครื่อง — ผู้ใช้ไม่เอา
- จำค่า Mode bar อย่างเดียว — ผู้ใช้ไม่เอา

**From:** interview · **Status:** active

## D5: เสียงโน้ตเมื่อตอบถูก เปิดปิดได้

**Chosen:** ตอบถูกแล้วเล่นเสียงสั้นของโน้ตนั้น สังเคราะห์ด้วย Web Audio API ใน octave 4 มีปุ่มเปิดปิดใน Mode bar ค่าเริ่มต้นปิด

**Why:** ผูกหูกับชื่อโน้ต และผู้ใช้อยากเปิดปิดเองได้

**Rejected:**
- ไม่มีเสียงเลย — ผู้ใช้อยากมีเสียง

**Details:**
- ไม่ใช้ไฟล์เสียงตัวอย่าง จึงไม่มีเรื่องลิขสิทธิ์ไฟล์เสียง
- ความถี่: C4 261.63, D4 293.66, E4 329.63, F4 349.23, G4 392.00, A4 440.00, B4 493.88 Hz
- ตอบผิดไม่มีเสียง

**Sources:** [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

**From:** interview · **Status:** active

## D6: มือถือใช้ปุ่มแตะ 7 ปุ่ม

**Chosen:** ใต้โจทย์มีแถวปุ่ม 7 ปุ่ม (C–B หรือ โด–ที ตามทิศของข้อนั้น) แตะหรือคลิกตอบได้ทั้งมือถือและเดสก์ท็อป

**Why:** มือถือไม่มีคีย์บอร์ดจริง ผู้ใช้อยากเล่นบนมือถือด้วย

**Rejected:**
- เดสก์ท็อปอย่างเดียว — ผู้ใช้อยากเล่นบนมือถือ

**From:** interview · **Status:** active

## D7: ตอบผิดแล้วข้ามไป เฉลยตอนจบรอบ

**Chosen:** ตอบผิด ช่องโจทย์กระพริบแดงสั้นๆ ไม่บอกคำตอบที่ถูก แล้วไปข้อต่อไปทันที หน้าผลลัพธ์แสดงทุกข้อที่ผิด พร้อมสิ่งที่ตอบและคำตอบที่ถูก

**Why:** ผู้ใช้อยากให้ข้ามไปก่อน แล้วค่อยดูเฉลยทีหลัง

**Rejected:**
- กดใหม่จนถูก — ผู้ใช้เลือกแล้วแก้กลับ
- เฉลยทันทีแล้วไปต่อ — ผู้ใช้อยากเห็นเฉลยตอนจบรอบ

**From:** interview · **Status:** active

## D8: UI ใช้ shadcn/ui กับ Tailwind ไอคอนใช้ Lucide

**Chosen:** shadcn/ui บน Tailwind CSS ไอคอนทั้งหมดจาก `lucide-react`

**Why:** ผู้ใช้ระบุให้ไอคอนเป็น Lucide และเลือก shadcn/ui ซึ่งเรียบ ปรับได้ และใช้ Lucide เป็นค่าเริ่มต้นอยู่แล้ว

**Rejected:**
- Mantine — หนักกว่า หน้าตาออก "แอป" มากกว่า
- Tailwind เปล่า — ต้องเขียน component เองทั้งหมด

**From:** interview · **Status:** active

## D9: ไม่ทำ design แยก ใช้ shadcn ค่าเริ่มต้น

**Chosen:** ไม่ทำ Figma หรือ ui-prompt หน้าจอจัดจาก component มาตรฐานของ shadcn/ui ตาม spec › Design

**Why:** ผู้ใช้อยากได้แค่หน้าเรียบๆ คล้าย Monkeytype

**Rejected:**
- ออกแบบหลัง plan ด้วย ui-prompt — ผู้ใช้ไม่ต้องการ
- Figma — ผู้ใช้ไม่ทำ

**From:** interview · **Status:** active

## D10: Host ฟรีบน GitHub Pages จาก public repo

**Chosen:** repo public `mousemouse094526/practice-piano` deploy ขึ้น GitHub Pages ด้วย GitHub Actions ทุกครั้งที่ push `main` เว็บอยู่ที่ `https://mousemouse094526.github.io/practice-piano/`

**Why:** ฟรีสำหรับ public repo พอสำหรับเว็บเล็กๆ (เว็บไม่เกิน 1 GB และ soft limit 100 GB ต่อเดือน)

**Rejected:**
- Cloudflare Pages หรือ Netlify — ต้องมีบัญชีอีกที่ ไม่จำเป็นเพราะ repo เป็น public ได้

**Details:**
- Vite `base` เป็น `/practice-piano/`
- repo private ใช้ Pages ฟรีไม่ได้

**Sources:** [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

**From:** interview · **Status:** changed by D19

## D11: React SPA บน Vite กับ TanStack Router แบบ hash history

**Chosen:** React SPA สร้างด้วย Vite ใช้ TanStack Router กับ `createHashHistory` ไม่ใช้ TanStack Start

**Why:** ผู้ใช้อยากใช้ React กับ TanStack ส่วน hash history ทำให้ refresh หรือเปิดลิงก์ตรงบน GitHub Pages ได้โดยไม่ต้องใช้ `404.html`

**Rejected:**
- browser history กับ `404.html` ที่ copy จาก `index.html` — ตอบ 404 ก่อนโหลดแอป และมีรายงานปัญหาเมื่อตั้งทั้ง `basepath` และ Vite `base`
- TanStack Start — ต้องมี server หรือ prerender เกินความจำเป็นสำหรับเว็บ static หน้าเดียว

**Sources:** [TanStack Router history types](https://tanstack.com/router/latest/docs/framework/react/guide/history-types), [TanStack Router deploy to production](https://tanstack.com/router/latest/docs/framework/react/how-to/deploy-to-production)

**From:** interview · **Status:** active

## D12: Fixed Do กับ 7 โน้ตธรรมชาติเท่านั้น

**Chosen:** โด=C เสมอ (fixed Do) โจทย์มีแค่ C D E F G A B ไม่มีชาร์ปหรือแฟลต

**Why:** ตรงกับตัวอย่างของผู้ใช้ (โด เร มี ... กับ CDEFGAB) และเป็นขั้นแรกของหลักสูตรฟรีที่ค้นมา

**Rejected:**
- movable Do — ต้องมีเรื่อง key ซึ่งเป็นบทเรียนถัดไป
- ใส่ชาร์ปแฟลต — เกินเกมแรก

**From:** interview · **Status:** active

## D13: เกมแรกเท่านั้น เกมถัดไปทำเป็น feature ใหม่

**Chosen:** feature นี้มีเกมจับคู่ชื่อโน้ตเกมเดียว เกมถัดไปตามลำดับหลักสูตรฟรีบนเน็ตทำเป็น feature ของตัวเอง

**Why:** ผู้ใช้ขอให้มีตัวนี้ก่อน

**Details:**
- ลำดับที่หลักสูตรฟรีใช้ร่วมกัน: ชื่อโน้ต → ตำแหน่งบนคีย์บอร์ด → อ่านโน้ตบนบรรทัด 5 เส้น → interval → scale → chord
- เอามาแค่ลำดับและข้อเท็จจริงทางดนตรี เนื้อหาและข้อความเขียนเอง (legal 1)

**Sources:** [musictheory.net exercises](https://www.musictheory.net/exercises), [Musicca note identification](https://www.musicca.com/note-identification)

**From:** interview · **Status:** active

## D14: กติกาการเล่นที่ผู้วางแผนตัดสิน

**Chosen:** กติกาเล็กที่ผู้ใช้ไม่ได้พูดถึง ตัดสินตามแนว Monkeytype (D1) แก้ได้ที่ gate

**Details:**
- **อ่านปุ่ม:** ใช้ `KeyboardEvent.code` (`KeyC`, `Digit1`, `Numpad1`) ไม่ใช้ `key` — คีย์บอร์ดภาษาไทยยังตอบได้โดยไม่ต้องสลับภาษา
- **ปุ่มนอกชุดคำตอบ:** ไม่สนใจ ไม่นับว่าผิด — กดพลาดไม่ควรเสียคะแนน
- **เริ่มนับเวลา:** ตอนตอบข้อแรก ไม่ใช่ตอนเปิดหน้า — เหมือน Monkeytype
- **เริ่มรอบใหม่:** กด `Tab` หรือปุ่มเริ่มใหม่ ได้ทุกเวลา — เหมือน Monkeytype
- **จบ `zen`:** กด `Esc` หรือปุ่มจบ — `zen` ไม่มีจุดจบเอง
- **สุ่มโจทย์:** สุ่มเท่ากันจาก 7 ตัว ห้ามซ้ำกับข้อก่อนหน้า — ข้อซ้ำติดกันง่ายเกินไป
- **แสดงโจทย์:** ข้อปัจจุบันตัวใหญ่ และอีก 3 ข้อถัดไปจางๆ — เห็นล่วงหน้าแบบ Monkeytype
- **เปลี่ยน Mode bar ระหว่างรอบ:** รอบปัจจุบันทิ้ง เริ่มรอบใหม่ด้วยค่าใหม่

**Sources:** [KeyboardEvent.code](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code)

**From:** interview · **Status:** active

## D15: ค่าที่หน้าผลลัพธ์แสดง

**Chosen:** หน้าผลลัพธ์แสดง ถูก ผิด ความแม่น (%) โน้ตต่อนาที เวลาเฉลี่ยต่อข้อ และรายการข้อที่ผิดพร้อมเฉลย (D7)

**Why:** ให้เห็นว่าเร็วขึ้นและแม่นขึ้นไหมในแต่ละรอบ ซึ่งเป็นเป้าของผู้ใช้ว่ายิ่งเล่นทุกวันยิ่งชำนาญ โดยไม่ต้องเก็บข้อมูล (D4)

**Details:**
- ความแม่น = ถูก ÷ (ถูก + ผิด) × 100 ปัดเป็นจำนวนเต็ม
- โน้ตต่อนาที = ถูก ÷ นาทีที่ใช้จริง ปัดเป็นจำนวนเต็ม
- เวลาเฉลี่ยต่อข้อ = เวลาที่ใช้ ÷ จำนวนข้อที่ตอบ เป็นวินาที ทศนิยม 2 ตำแหน่ง
- จบรอบโดยยังไม่ตอบสักข้อ → ไม่แสดงหน้าผลลัพธ์ กลับไปหน้าเริ่ม

**From:** interview · **Status:** active

## D16: ค่า Mode bar อยู่ใน URL

**Chosen:** ค่า Mode bar เก็บใน search params ของ URL ผ่าน TanStack Router (`validateSearch`) ค่าผิดหรือไม่มี → ใช้ค่าเริ่มต้น

**Why:** URL ไม่ใช่ที่เก็บข้อมูลของแอป (D4) แต่ผู้ใช้ bookmark mode ที่ชอบได้ และ refresh แล้วค่าไม่หาย

**Rejected:**
- เก็บใน React state อย่างเดียว — refresh แล้วต้องตั้งใหม่ทุกครั้ง

**Sources:** [TanStack Router search params](https://tanstack.com/router/latest/docs/framework/react/guide/search-params)

**From:** interview · **Status:** active

## D17: ธีมตามระบบ

**Chosen:** สีสว่างหรือมืดตาม `prefers-color-scheme` ของเครื่อง ไม่มีปุ่มสลับ

**Why:** ปุ่มสลับจะจำค่าไม่ได้เพราะไม่เก็บข้อมูล (D4)

**From:** interview · **Status:** active

## D18: Seam สองจุด

**Chosen:** seam ที่ 1 เป็น game engine แบบ pure function และ seam ที่ 2 เป็น e2e หนึ่ง flow บนเดสก์ท็อปและมือถือ (spec › Seams)

**Why:** กติกาทั้งหมด (D2, D7, D14, D15) อยู่ใน engine ทดสอบเร็วโดยไม่ต้องมี UI ส่วนการกดปุ่ม ปุ่มแตะ และหน้าผลลัพธ์ พิสูจน์ได้ผ่าน UI เท่านั้น

**From:** interview · **Status:** active

## D19: ชื่อเว็บ Note Quest และ repo `note-quest`

**Chosen:** เว็บชื่อ Note Quest ไม่มีคำว่า piano เปลี่ยนชื่อ repo เป็น `mousemouse094526/note-quest` เว็บอยู่ที่ `https://mousemouse094526.github.io/note-quest/` และ Vite `base` เป็น `/note-quest/`

**Why:** ผู้ใช้อยากได้ชื่อแนวเกมสำหรับฝึกดนตรีมือใหม่ ไม่เอาคำว่า piano ชื่อนี้รองรับเกมถัดไป (D13) แบบด่านต่อด่าน

**Rejected:**
- `practice-piano` — ผู้ใช้อยากเอาคำว่า piano ออก
- Key Rush, Do Re Mi Dash, Tune Arcade — ผู้วางแผนเลือก Note Quest ให้ ผู้ใช้แก้ได้ที่ gate

**Details:**
- extends D10: วิธี host เหมือนเดิม เปลี่ยนแค่ชื่อ repo และ path
- ผู้ใช้เปลี่ยนชื่อ repo บน GitHub เอง

**From:** interview · **Status:** superseded by D22

## D20: แก้จาก red team

**Chosen:** กติกาที่ red team พบว่ายังไม่ชัด ตัดสินตามนี้ ข้อที่ผู้ใช้ยืนยันระบุไว้

**Details:**
- **ยืนยันโดยผู้ใช้:** ค่า Mode bar อยู่ใน URL ตาม D16 และแสดง 3 ข้อถัดไปตาม D14 — red team ถามว่าเกินที่ผู้ใช้ขอไหม ผู้ใช้ตอบว่าเอา
- **เวลาที่ใช้:** `time` = `len` ; `count` = เวลาตอบข้อสุดท้าย ลบ เวลาตอบข้อแรก ; `zen` = เวลา `end` ลบ เวลาตอบข้อแรก ; เป็น 0 → แสดง `—` แทนตัวเลขความเร็ว — กันหารด้วยศูนย์ ส่วนข้อแรกนับ 0 วินาทียอมรับได้
- **หมดเวลา:** engine เก็บ `deadline` = เวลาตอบข้อแรก + `len` ; `answer` หรือ `tick` ที่ `now >= deadline` จบรอบ และคำตอบนั้นไม่นับ — tab ที่ถูกซ่อน timer ช้า ผลต้องไม่เพี้ยน
- **ปุ่มที่ไม่นับ:** `event.repeat` หรือกด `Ctrl` `Cmd` `Alt` ค้าง หรือ `isComposing` → ไม่สนใจ — กดค้างหรือ shortcut ของเบราว์เซอร์ต้องไม่กลายเป็นคำตอบ
- **Focus:** listener เดียวบน `window` ; `Tab` (ไม่กด `Shift`) เรียก `preventDefault` แล้วเริ่มรอบใหม่ ; `Shift+Tab` ย้าย focus เข้า Mode bar ตามปกติ ; ขณะ focus อยู่ใน Mode bar หรือ popover เปิดอยู่ ปุ่มตอบ `Tab` และ `Esc` เป็นของ control นั้น ; `Esc` ใน Mode bar คืน focus ให้พื้นที่เกม ; ปุ่มตอบบนจอไม่รับ focus — ผู้เล่นคีย์บอร์ดยังเข้าถึง Mode bar ได้ และ Enter หรือ Space ไม่ตอบซ้ำ
- **เสียงไม่ทำให้รอบเริ่มใหม่:** เปลี่ยน `sound` แทนที่ URL เท่านั้น รอบเดิมเล่นต่อ — เสียงไม่เกี่ยวกับกติกา
- **เสียงพังไม่กระทบเกม:** engine อัปเดตก่อน เสียงเล่นทีหลังใน `try/catch` ; สร้าง `AudioContext` ตอนกดเปิดเสียง เรียก `resume()` ทุกครั้งที่ตอบถูก ; ตั้ง `navigator.audioSession.type = 'playback'` ถ้าเบราว์เซอร์รองรับ — iPhone เปิดโหมดเงียบอยู่ก็ยังได้ยิน
- **บอกผลโดยไม่พึ่งสี:** ตอบผิด → Prompt สั่นพร้อมกระพริบแดง ปุ่มที่กดขึ้น `X` ชั่วครู่ ตัวนับผิดเล็กๆ ข้างตัวนับเวลา ; ทิศสลับแล้วกดปุ่มผิดชุด → แถวปุ่มตอบกระพริบป้ายปุ่มลัดของชุดที่ถูก ไม่นับผิด — ผู้เล่นตาบอดสีหรือมองปุ่มอยู่ต้องรู้

**From:** red team · **Status:** active

## D21: เครื่องมือ build และ test

**Chosen:** Vitest สำหรับ unit test, Playwright (Chromium และ WebKit แบบ iPhone) สำหรับ e2e, Biome สำหรับ lint และ format, TanStack Router แบบ code-based route, npm เป็น package manager

**Why:** red team พบว่า spec ไม่ได้ตั้งชื่อเครื่องมือ ผู้วางแผนเลือกชุดที่เบาและเข้ากับ Vite ผู้ใช้ยืนยันตอนตั้ง conventions

**Rejected:**
- ESLint กับ Prettier — สองเครื่องมือ config มากกว่า Biome ตัวเดียว
- file-based route ด้วย `@tanstack/router-plugin` — มีหน้าเดียว ไม่คุ้มเพิ่ม plugin
- Zod สำหรับ search params — 5 ค่า เขียน fallback เองใน `validateSearch` สั้นกว่า

**Details:**
- random แบบมี seed เขียนเองใน engine (mulberry32) แอปเอา seed จาก `crypto.getRandomValues`

**From:** red team · **Status:** active

## D22: ชื่อเว็บ Piano Quest และ repo `piano-quest`

**Chosen:** เว็บชื่อ Piano Quest repo `mousemouse094526/piano-quest` เว็บอยู่ที่ `https://mousemouse094526.github.io/piano-quest/` และ Vite `base` เป็น `/piano-quest/`

**Why:** ผู้ใช้เลือกชื่อที่มีคำว่า piano และเป็นแนวเกมด่านต่อด่าน รองรับเกมถัดไป (D13)

**Rejected:**
- Note Quest — ผู้ใช้อยากให้มีคำว่า piano
- Piano Type — ผูกกับแนวพิมพ์เร็วอย่างเดียว
- Piano Mini Game — ผู้ใช้ไม่เลือก

**Details:**
- supersedes D19
- ผู้ใช้เปลี่ยนชื่อ repo `practice-piano` เป็น `piano-quest` บน GitHub เอง

**From:** interview · **Status:** active

## D23: Conventions ของ web app

**Chosen:** ใช้ conventions ใน `.claude/skills/vite-react-web/` โครง `src/features/{feature}/engine components hooks sound` route แบบ code-based ใน `src/routes/_public/` unit test วางข้างไฟล์ engine e2e อยู่ใน `e2e/`

**Why:** ผู้ใช้ยอมรับโครงที่เสนอ แยก engine ออกจาก UI ตาม ADR-0005 และรองรับเกมถัดไปเป็นโฟลเดอร์ใหม่

**From:** tickets · **Status:** active

## D24: รูปแบบ code และกฎ lint ของ Biome

**Chosen:** Biome ตรวจเฉพาะ code (ไม่รวมไฟล์ `.md`) format ด้วย space 2 ช่อง single quote บรรทัดยาวไม่เกิน 100 และเปิด `noRestrictedGlobals` ห้าม `localStorage` `sessionStorage` `indexedDB` ส่วน `document.cookie` ที่ lint จับไม่ได้ ตรวจด้วย unit test `src/no-player-data.test.ts`

**Why:** ค่าเริ่มต้นของ `biome init` เป็น tab กับ double quote ซึ่งต่างจากตัวอย่างใน conventions ; Biome 2.6 format Markdown ด้วยและจะเติม padding ตารางใน docs ทั้งหมด ; การห้ามด้วย lint ทำให้ ADR-0001 ถูกตรวจใน CI ทุกครั้ง

**Rejected:**
- ใช้ค่าเริ่มต้นของ Biome — ไม่ตรงกับตัวอย่างใน conventions และเขียน docs ใหม่ทั้งหมด

**From:** build ticket 01 · **Status:** active

## D25: ตอบข้อเดียว ความเร็วแสดง `—`

**Chosen:** รอบที่ตอบน้อยกว่า 2 ข้อ ทุก Mode → `notesPerMinute` และ `secondsPerAnswer` เป็น `null` หน้า Results แสดง `—`

**Why:** ข้อเดียววัดความเร็วไม่ได้จริง เวลาที่วัดได้คือเวลานั่งรอก่อนกด `Esc` ; spec › Seams › 1 กับสูตรเวลาใน D20 ขัดกัน ผู้ใช้เลือกข้อนี้

**Rejected:**
- ใช้สูตร D20 ตามเดิม แสดง `—` เฉพาะเวลาที่ใช้เป็น 0 — ตอบ 1 ข้อแล้วรอ 5 วินาทีจะได้ 12 โน้ตต่อนาที ซึ่งไม่มีความหมาย

**Details:**
- extends D20: สูตรเวลาที่ใช้เหมือนเดิม เพิ่มเงื่อนไขจำนวนข้อ

**From:** build ticket 01 · **Status:** active

## D26: Mode bar เป็นแถวปุ่มเลือกที่เห็นทุกค่าพร้อมกัน

**Chosen:** Mode bar ใช้ shadcn `ToggleGroup` แบบเลือกค่าเดียว 4 กลุ่ม (Mode, ความยาว, Direction, Script) เรียงในแถวเดียว ทุกค่าเห็นบนจอตลอด ไม่มี dropdown หรือ popover ; กลุ่มความยาวเปลี่ยนชุดตาม Mode และซ่อนใน `zen` ; กดค่าที่เลือกอยู่ซ้ำไม่ล้างค่า

**Why:** เปลี่ยนค่าได้ในคลิกเดียวแบบแถบตั้งค่าของ D1 ; `ToggleGroup` ให้ลูกศรซ้ายขวาเลื่อนในกลุ่มและ `Tab` ข้ามกลุ่มได้เอง ; ไม่มี popover จึงไม่มีปุ่มที่ต้องแย่ง `Esc` กับเกม (D20)

**Rejected:**
- `Select` หรือ popover ต่อกลุ่ม — ต้องกดสองครั้งต่อการเปลี่ยนค่า และต้องจัดการ `Esc` ซ้อน

**Details:**
- ปุ่มบนจอของเกม (ปุ่มตอบ เริ่มใหม่ จบรอบ เล่นอีกรอบ) ไม่รับ focus ทั้งจาก `Tab` และจากการคลิก (`tabIndex={-1}` และ `preventDefault` ตอน `mousedown`) — focus อยู่ที่พื้นที่เกม
- พื้นที่เกมมี `tabIndex={-1}` และรับ focus ตอนเปิดหน้า `Shift+Tab` จากตรงนี้จึงเข้า Mode bar ตามลำดับปกติ
- คลิก Mode bar ด้วยเมาส์ไม่ย้าย focus เข้า Mode bar (`preventDefault` ตอน `mousedown` ที่ `<nav>`) — เลือกค่าแล้วกดปุ่มตอบหรือ `Tab` ได้ทันที ; ผู้ใช้คีย์บอร์ดยังเข้า Mode bar ด้วย `Shift+Tab` (Radix ทิ้ง `onMouseDown` ที่ใส่ให้ item จึงต้องใส่ที่ `<nav>`)
- ป้ายปุ่มลัดกระพริบเฉพาะทิศสลับ (`needsKeySetHint` ใน engine) ทิศคงที่กดปุ่มนอกชุดแล้วไม่มีอะไรเกิด (D14)
- แถบล่างแสดง `Esc` เฉพาะ `zen` ตาม spec › Design ("`Esc` จบ (`zen`)")

**From:** build ticket 02 · **Status:** active

## D27: URL ของ Mode bar

**Chosen:** `validateSearch` ของ route `/` เรียก `parseQuizSearch` ใน `src/features/note-name-quiz/search.ts` (pure มี unit test) ; เปลี่ยนค่าใน Mode bar แล้ว URL มีครบทุก param ยกเว้น `len` ใน `zen` ; เปิดแอปแล้วตัด query string จริง (ส่วนก่อน `#`) ทิ้ง

**Why:** router เขียน URL ใหม่ด้วยค่าที่ตรวจแล้วอยู่แล้ว การเขียนครบทำให้ bookmark อ่านง่ายและไม่ขึ้นกับค่าเริ่มต้นที่อาจเปลี่ยน ; `createHashHistory` ของ TanStack เอา query จริง เช่น `?fbclid=…` ที่แอปแชร์ลิงก์เติมให้ ไปต่อท้าย param ตัวสุดท้ายใน hash ทำให้ค่านั้นกลายเป็นค่าเริ่มต้น แอปไม่ได้อ่านอะไรจาก query จริง

**Rejected:**
- เขียนเฉพาะค่าที่ต่างจากค่าเริ่มต้น — ต้องมีโค้ดเทียบค่าเพิ่ม และ router ก็เติมค่าครบตอนโหลดอยู่ดี

**Details:**
- input ของ `validateSearch` ติด `SearchSchemaInput` ทุก param จึงไม่บังคับเวลา `<Link to="/">`
- เปลี่ยน Mode → ความยาวกลับเป็นค่าเริ่มต้นของ Mode นั้น (D2) ด้วย `withMode`
- Script เปลี่ยนแล้วเริ่มรอบใหม่ด้วย ตาม spec › Search params (ทุกค่ายกเว้น `sound`)

**From:** build ticket 02 · **Status:** active

## D28: ตั้ง Playwright

**Chosen:** project `chromium` (`Desktop Chrome`) และ `iphone` (`iPhone 15` บน WebKit) ; `webServer` build แล้ว `vite preview` ที่ port 4317 ไม่ reuse server ที่รันอยู่ ; CI ติดตั้ง `chromium webkit` แล้วรัน `npm run e2e` ก่อน build และเก็บ `playwright-report` เป็น artifact

**Why:** port 4173 ของ Vite มักมี preview เก่าค้างอยู่ (ตอน build ticket นี้ test ผ่านกับ build เก่าโดยไม่รู้ตัว) จึงแยก port และ build ใหม่ทุกครั้ง ; `iPhone 15` (393 px) เป็น device ที่มีใน Playwright 1.65 ส่วน 375 px ตรวจแยกด้วย `setViewportSize`

**Rejected:**
- `reuseExistingServer` ตอนรันในเครื่อง — เร็วกว่าแต่เสี่ยงผ่านกับ code เก่า

**Details:**
- e2e หา Answer ที่ถูกจากข้อความ Prompt กับตาราง `NOTES` ของ engine และกดผ่าน `page.keyboard` จริงเท่านั้น
- ก่อนกดปุ่มแรกต้องรอ Prompt ขึ้น — ปุ่มที่กดก่อน listener ติดจะหายไป

**From:** build ticket 03 · **Status:** active

## D29: `X` บนปุ่มที่ผิด และตัวเล่นเสียง

**Chosen:** `useRound` รัน reducer ล่วงหน้ากับ event ตอบเพื่อรู้ผลทันที: ผิด → เก็บ `missMark` (โน้ตที่กด) ให้ปุ่มนั้นขึ้น `X` 600 ms แล้วจาง จนกว่าจะมีคำตอบที่นับครั้งถัดไป ; ถูก → เรียก `onCorrect` ซึ่งเล่นเสียงถ้า `sound=on` ; ตัวเล่นเสียงเป็นตัวเดียวทั้งแอป (`notePlayer`) คลื่น triangle 0.41 วินาที ; ปุ่มแตะเรียงเป็น grid 7 ช่องเต็มกว้าง

**Why:** เสียงต้องเล่นใน gesture เดียวกับที่ตอบ (iOS) และหลัง engine ตัดสิน (D20) ; `X` ที่คิดจาก Miss ล่าสุดตอน render จะโผล่ซ้ำเมื่อทิศสลับกลับมา ; `min-w-12` × 7 กว้าง 384 px ล้นจอ 375 px

**Details:**
- `X` แสดงทั้งตอบผิดด้วยปุ่มแตะและปุ่มคีย์บอร์ด (ปุ่มที่ตรงกับคำตอบ)
- เปิด `sound=on` จาก URL โดยไม่ได้กดปุ่ม → สร้าง `AudioContext` ตอนตอบถูกครั้งแรก (ก็เป็น gesture)
- `navigator.audioSession.type = 'playback'` หยุดเพลงจากแอปอื่นของผู้เล่นได้ — ยอมรับตาม D20
- ผลของการตอบหาด้วย selector `answerOutcome(before, after)` ของ engine
- `sound/notePlayer.ts` มี unit test ด้วย `AudioContext` ปลอม เฉพาะสัญญา "เสียงพังไม่ throw" กับ "เล่นความถี่ที่ส่งมา" — e2e ฟังเสียงไม่ได้ (spec › Testing decisions) ; e2e นับโน้ตที่เล่นด้วย stub แทน
- `resume()` ทุกครั้งที่ตอบถูก ตาม D20 แม้ context จะ `running` อยู่แล้ว (เป็น no-op)

**From:** build ticket 03 · **Status:** active

## D30: กติกาต่อ Mode อยู่ที่เดียว และ Mode bar บรรทัดเดียวบนจอกว้าง

**Chosen:** `engine/modes.ts` ถือ `MODES` `MODE_LENGTHS` (ความยาวที่เลือกได้และค่าเริ่ม) และ `hasLength` `isLengthMode` `isEndedByPlayer` ; `Settings['len']` derive จาก `MODE_LENGTHS` ; โค้ดนอก engine ถาม selector เหล่านี้แทนเทียบ `mode === 'zen'` ; ทุกการเปลี่ยนค่าใน Mode bar ผ่าน `parseQuizSearch` (`withMode` `withLength` `withDirection` `withScript` `withSound`) ; `main` กว้าง `max-w-4xl` (864 px) และเส้นคั่นใน Mode bar แสดงเฉพาะ `lg` ขึ้นไป

**Why:** feature review พบการแยกกรณี `mode` ราว 8 ที่และรายการความยาวเขียนซ้ำ 2 ที่ — เพิ่ม Mode หรือความยาวต้องแก้หลายไฟล์ ; Mode bar ต้องการราว 770 px แต่ `max-w-3xl` ให้ 736 px จึงตัดบรรทัดทุกจอ เส้นคั่นค้างท้ายแถวและปุ่มเสียงตกไปแถวเดียว

**Rejected:**
- ลดช่องไฟให้พอดี 736 px — พอดีแบบเฉียดฉิว ป้ายยาวขึ้นนิดเดียวก็ตัดบรรทัดอีก
- เส้นคั่นเป็น `border-l` ของแต่ละกลุ่ม — ตัดบรรทัดแล้วเส้นไปค้างหัวแถวแทน

**Details:**
- จอแคบกว่า `lg` (1024 px) Mode bar ตัดบรรทัดโดยไม่มีเส้นคั่น แยกกลุ่มด้วยช่องไฟ ; ตรวจที่ 375 px และ 1024 px แล้ว
- `ResultsScreen` (component) แยกชื่อจาก type `Results` ของ engine ; `cn` import ผ่าน `@/lib/utils` ตาม `components.json`
- e2e ที่ต้องรอเวลาใช้ `page.clock` แทน `waitForTimeout`

**From:** feature review · **Status:** active

## Sources

- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) — ฟรีสำหรับ public repo และ limit ของเว็บ (accessed 2026-11-07)
- [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) — deploy ด้วย GitHub Actions (accessed 2026-11-07)
- [TanStack Router history types](https://tanstack.com/router/latest/docs/framework/react/guide/history-types) — `createHashHistory` (accessed 2026-11-07)
- [TanStack Router deploy to production](https://tanstack.com/router/latest/docs/framework/react/how-to/deploy-to-production) — recipe GitHub Pages ที่ใช้ `404.html` (accessed 2026-11-07)
- [TanStack Router search params](https://tanstack.com/router/latest/docs/framework/react/guide/search-params) — `validateSearch` (accessed 2026-11-07)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) — สังเคราะห์เสียงในเบราว์เซอร์ (accessed 2026-11-07)
- [KeyboardEvent.code](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code) — ปุ่มจริงไม่ขึ้นกับภาษาคีย์บอร์ด (accessed 2026-11-07)
- [musictheory.net exercises](https://www.musictheory.net/exercises) — ลำดับแบบฝึกหัดฟรี (accessed 2026-11-07)
- [Musicca note identification](https://www.musicca.com/note-identification) — แบบฝึกชื่อโน้ตฟรี (accessed 2026-11-07)
- [Audio Session API](https://w3c.github.io/audio-session/) — `navigator.audioSession.type` (accessed 2026-11-07)
