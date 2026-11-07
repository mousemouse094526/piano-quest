# ใช้ hash history ไม่ใช้ browser history

TanStack Router ใช้ `createHashHistory` URL ทุกหน้าจึงมี `#/` เพราะ GitHub Pages ไม่ rewrite path ถ้าใช้ browser history ต้องพึ่ง `404.html` ซึ่งตอบ 404 ก่อนโหลดแอป และมีรายงานว่าพังเมื่อตั้ง `basepath` คู่กับ Vite `base` ถ้าเปลี่ยนไปใช้ browser history ทีหลัง bookmark ที่ผู้ใช้เก็บไว้ (ADR-0002) จะพังทั้งหมด

Source: note-name-quiz D11

Links: [TanStack Router history types](https://tanstack.com/router/latest/docs/framework/react/guide/history-types)
