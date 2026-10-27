/* =========================================================================
   Enjin slaid bengkel. Tiada kebergantungan luar (berfungsi tanpa internet).

   Kekunci:  → / Space / PageDown   seterusnya      ← / PageUp   sebelumnya
             Home / End  pertama / akhir             12 + Enter   pergi ke halaman 12
             M menu      P paparan penceramah        F skrin penuh
             B skrin hitam   D tema gelap   ? bantuan
   ========================================================================= */
(function () {
  'use strict'

  const params = new URLSearchParams(location.search)
  const isPresenter = params.has('presenter')
  const stage = document.querySelector('.stage')
  const slides = Array.from(stage.querySelectorAll(':scope > .slide'))
  const W = 1280
  const H = 720
  const LANGKAH = 5 // checkpoint 01–05: PM2, Nginx, Docker, CI, CD (06 = jawapan cabaran)

  let index = 0
  let stepIndex = 0
  let peer = isPresenter ? window.opener : null

  // ---------------------------------------------------------------------
  // Utiliti
  // ---------------------------------------------------------------------
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const el = (tag, cls, html) => {
    const e = document.createElement(tag)
    if (cls) e.className = cls
    if (html != null) e.innerHTML = html
    return e
  }
  const store = {
    get(k) { try { return localStorage.getItem(k) } catch { return null } },
    set(k, v) { try { localStorage.setItem(k, v) } catch { /* abaikan */ } },
  }

  // ---------------------------------------------------------------------
  // 1. Penyerlah sintaks (syntax highlighter) ringkas
  // ---------------------------------------------------------------------
  const R = {
    hcom: /<!--[\s\S]*?-->/y,
    com: /\/\/[^\n]*|\/\*[\s\S]*?\*\//y,
    hash: /#[^\n]*/y,
    key: /"(?:\\.|[^"\\\n])*"(?=\s*:)/y,
    str: /'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`/y,
    kw: /\b(?:const|let|var|function|async|await|return|if|else|for|of|in|import|from|export|default|new|try|catch|finally|throw|true|false|null|undefined|this|typeof)\b/y,
    json: /\b(?:true|false|null)\b/y,
    cmd: /\b(?:npm|npx|node|cd|git|curl|pm2|docker|sudo|nginx|bash|cp|kill)\b/y,
    ykey: /[A-Za-z_][\w.-]*(?=:(?:\s|$))/y,
    dkw: /\b(?:FROM|AS|WORKDIR|COPY|RUN|ARG|ENV|USER|EXPOSE|HEALTHCHECK|CMD|ENTRYPOINT)\b/y,
    nkw: /\b(?:server|listen|root|location|proxy_pass|try_files)\b/y,
    num: /\b\d[\d_]*(?:\.\d+)?\b/y,
    fn: /[A-Za-z_$][\w$]*(?=\()/y,
    id: /[A-Za-z_$][\w$-]*/y,
    tag: /<\/?[A-Za-z][\w.-]*/y,
    tagEnd: /\/?>/y,
    mus: /\{\{|\}\}/y,
    dir: /(?:v-[\w-]+(?:[:.][\w.[\]-]+)*|[:@#][\w.[\]-]+)(?=[=\s>/])/y,
    attr: /[A-Za-z][\w-]*(?==)/y,
  }
  const LANG = {
    js: [['com', 'com'], ['str', 'str'], ['kw', 'kw'], ['num', 'num'], ['fn', 'fn'], ['id', null]],
    vue: [['hcom', 'com'], ['com', 'com'], ['str', 'str'], ['tag', 'tag'], ['tagEnd', 'punct'], ['mus', 'mus'],
      ['dir', 'dir', true], ['attr', 'attr', true], ['kw', 'kw'], ['num', 'num'], ['fn', 'fn'], ['id', null]],
    bash: [['hash', 'com', true], ['str', 'str'], ['cmd', 'cmd'], ['num', 'num'], ['id', null]],
    json: [['key', 'key'], ['str', 'str'], ['json', 'kw'], ['num', 'num']],
    yaml: [['hash', 'com', true], ['str', 'str'], ['ykey', 'key'], ['num', 'num'], ['id', null]],
    docker: [['hash', 'com', true], ['str', 'str'], ['dkw', 'kw'], ['num', 'num'], ['id', null]],
    nginx: [['hash', 'com', true], ['str', 'str'], ['nkw', 'kw'], ['num', 'num'], ['id', null]],
    text: [],
  }
  LANG.html = LANG.vue

  function tokenize(code, lang) {
    const rules = LANG[lang] || []
    const out = []
    let plain = ''
    let i = 0
    outer: while (i < code.length) {
      for (const [name, cls, needsSpace] of rules) {
        if (needsSpace && i > 0 && !/\s/.test(code[i - 1])) continue
        const rx = R[name]
        rx.lastIndex = i
        const m = rx.exec(code)
        if (m && m[0].length) {
          if (plain) { out.push([null, plain]); plain = '' }
          out.push([cls, m[0]])
          i += m[0].length
          continue outer
        }
      }
      plain += code[i++]
    }
    if (plain) out.push([null, plain])
    return out
  }

  function parseLines(spec) {
    const set = new Set()
    if (!spec) return set
    for (const part of spec.split(',')) {
      const [a, b] = part.split('-').map((n) => parseInt(n, 10))
      for (let n = a; n <= (b || a); n++) set.add(n)
    }
    return set
  }

  function dedent(text) {
    const lines = text.replace(/\t/g, '  ').split('\n')
    while (lines.length && !lines[0].trim()) lines.shift()
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop()
    const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length))
    return lines.map((l) => l.slice(indent)).join('\n')
  }

  // Alamat https://... dalam kod dijadikan pautan (teks sudah di-escape, tiada < atau >)
  function linkUrls(html) {
    return html.replace(/https?:\/\/[^\s'"`<>)$]+/g, (u) => `<a href="${u}">${u}</a>`)
  }

  function renderCode(src) {
    const lang = src.dataset.lang || 'text'
    const code = dedent(src.value)
    const hl = parseLines(src.dataset.hl)
    const lines = [[]]
    for (const [cls, text] of tokenize(code, lang)) {
      text.split('\n').forEach((part, k) => {
        if (k > 0) lines.push([])
        if (part) lines[lines.length - 1].push(cls ? `<span class="t-${cls}">${esc(part)}</span>` : esc(part))
      })
    }
    const box = el('div', src.className)
    if (hl.size) box.classList.add('has-hl')
    if (src.dataset.title) {
      // *perkataan* dalam tajuk = condong (contoh: "Konsol *browser* (F12)")
      const tajuk = esc(src.dataset.title).replace(/\*([^*]+)\*/g, '<em>$1</em>')
      box.appendChild(el('div', 'code-title', `<span>${tajuk}</span><span class="lang">${esc(lang)}</span>`))
    }
    const pre = el('pre')
    pre.innerHTML = lines.map((l, n) => `<span class="ln${hl.has(n + 1) ? ' hl' : ''}">${linkUrls(l.join('')) || ' '}</span>`).join('')
    box.appendChild(pre)
    // Butang Salin (muncul bila tetikus di atas blok kod)
    kodBlok.push(code)
    const copy = el('button', 'salin-kod', `${ikon.salin}<span class="label">Salin</span>`)
    copy.type = 'button'
    copy.title = 'Salin kod ini'
    copy.dataset.kod = kodBlok.length - 1
    box.appendChild(copy)
    if (src.getAttribute('style')) box.setAttribute('style', src.getAttribute('style'))
    src.replaceWith(box)
  }

  // ---------------------------------------------------------------------
  // 2. Demo hidup (Vue) — hanya jika vendor/vue.global.prod.js dimuatkan
  // ---------------------------------------------------------------------
  const demos = {
    counter: {
      setup() {
        const count = Vue.ref(0)
        return { count }
      },
      template: `
        <div class="row">
          <button @click="count++">Klik saya</button>
          <button class="ghost" @click="count = 0">Set semula</button>
        </div>
        <div class="out">count = <b>{{ count }}</b></div>
        <div class="out small muted">count × 2 = <b>{{ count * 2 }}</b></div>`,
    },
    binding: {
      setup() {
        const name = Vue.ref('')
        const show = Vue.ref(false)
        return { name, show }
      },
      template: `
        <input type="text" v-model="name" placeholder="Taip nama anda...">
        <div class="out">Hai, <b>{{ name || '...' }}</b>!</div>
        <label class="row mt" style="font-size:22px; gap:10px">
          <input type="checkbox" v-model="show"> Tunjuk mesej rahsia
        </label>
        <div v-if="show" class="secret">🎉 Elemen ini wujud kerana <code>show</code> = true</div>
        <div v-else class="muted small mt">(v-else: show = false)</div>`,
    },
    list: {
      setup() {
        let id = 0
        const newTodo = Vue.ref('')
        const todos = Vue.ref([
          { id: id++, text: 'Pasang Node.js', done: true },
          { id: id++, text: 'Siapkan tutorial Vue', done: false },
          { id: id++, text: 'Bina CRUD dengan Vuetify', done: false },
        ])
        const remaining = Vue.computed(() => todos.value.filter((t) => !t.done).length)
        function add() {
          if (!newTodo.value.trim()) return
          todos.value.push({ id: id++, text: newTodo.value, done: false })
          newTodo.value = ''
        }
        function remove(todo) {
          todos.value = todos.value.filter((t) => t !== todo)
        }
        return { newTodo, todos, remaining, add, remove }
      },
      template: `
        <form class="row" style="flex-wrap:nowrap" @submit.prevent="add">
          <input type="text" v-model="newTodo" placeholder="Tugasan baharu">
          <button>Tambah</button>
        </form>
        <ul>
          <li v-for="t in todos" :key="t.id">
            <label class="row" style="gap:10px">
              <input type="checkbox" v-model="t.done">
              <span :style="{ textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.5 : 1 }">{{ t.text }}</span>
            </label>
            <button class="ghost" @click="remove(t)">Padam</button>
          </li>
        </ul>
        <div class="out small">Belum selesai: <b>{{ remaining }}</b></div>`,
    },
  }

  function mountDemos(root) {
    if (!window.Vue) return
    root.querySelectorAll('.demo[data-demo]').forEach((box) => {
      const def = demos[box.dataset.demo]
      if (!def) return
      const target = el('div')
      box.appendChild(target)
      Vue.createApp(def).mount(target)
    })
  }

  // ---------------------------------------------------------------------
  // 3. Pemasa (slaid latihan & cabaran)  — klik: mula/jeda, klik dua kali: set semula
  //    Disegerakkan antara tetingkap: mula di tetingkap penceramah, projektor turut berjalan.
  // ---------------------------------------------------------------------
  const pemasa = [] // { apply, state, total } untuk setiap .timer, ikut susunan dalam slaid
  function setupTimers(root) {
    root.querySelectorAll('.timer[data-minutes]').forEach((t) => {
      const id = pemasa.length
      const total = Number(t.dataset.minutes) * 60
      let left = total  // saat yang tinggal semasa dijeda
      let endsAt = 0    // semasa berjalan: masa tamat (ms)
      let handle = null
      const secs = () => (handle ? Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)) : left)
      function draw() {
        const s = secs()
        if (handle && s === 0) { clearInterval(handle); handle = null; left = 0 }
        t.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
        t.classList.toggle('done', s === 0)
      }
      // state = { left } (dijeda) atau { left, endsAt } (sedang berjalan)
      function apply(state) {
        clearInterval(handle)
        handle = null
        left = Math.max(0, Math.min(total, Math.round(Number(state.left)) || 0))
        const end = Number(state.endsAt)
        if (Number.isFinite(end) && end > 0) { endsAt = end; handle = setInterval(draw, 250) }
        draw()
      }
      const state = () => (handle ? { left: secs(), endsAt } : { left })
      const share = () => post({ deck: 'pemasa', id, ...state() })
      t.addEventListener('click', () => {
        if (handle) apply({ left: secs() })
        else if (left > 0) apply({ left, endsAt: Date.now() + left * 1000 })
        share()
      })
      t.addEventListener('dblclick', () => { apply({ left: total }); share() })
      pemasa.push({ apply, state, total })
      draw()
    })
  }

  // ---------------------------------------------------------------------
  // 3b. Pautan, butang Salin dan Vue Playground
  // ---------------------------------------------------------------------
  // Pautan https://... dibuka dalam tab baharu, dengan ikon ↗ (termasuk dalam nota penceramah)
  function setupLinks(root) {
    root.querySelectorAll('a[href^="http"]').forEach((a) => {
      a.target = '_blank'
      a.rel = 'noopener'
      if (a.classList.contains('aksi')) {
        // Butang pautan biasa (contoh: Buka laman Vuetify) turut dapat ikon ↗; butang Playground tidak
        if (!a.dataset.playground) a.insertAdjacentHTML('beforeend', ikon.luar)
        return
      }
      if (!a.title) a.title = `Buka ${a.getAttribute('href')} dalam tab baharu`
      a.insertAdjacentHTML('beforeend', ikon.luar)
    })
  }

  // Vue Playground menerima kod dalam alamatnya: #base64(JSON { "App.vue": kod })
  function playgroundUrl(code) {
    let bin = ''
    new TextEncoder().encode(JSON.stringify({ 'App.vue': code })).forEach((b) => { bin += String.fromCharCode(b) })
    return `https://play.vuejs.org/#${btoa(bin)}`
  }

  // data-playground="todo-mula.vue" → buka di play.vuejs.org dengan kod itu sudah dimuatkan
  // data-salin="todo-mula.vue"      → salin kod itu
  function setupKodLatihan(root) {
    root.querySelectorAll('[data-playground], [data-salin]').forEach((b) => {
      const name = b.dataset.playground || b.dataset.salin
      if (kodLatihan[name] == null) { b.remove(); return } // kod-latihan.js tiada
      b.innerHTML = `${b.dataset.playground ? ikon.main : ikon.salin}<span class="label">${b.innerHTML}</span>`
      if (b.dataset.playground) {
        b.href = playgroundUrl(kodLatihan[name])
        b.title = `Buka ${name} di play.vuejs.org (tab baharu)`
      } else {
        b.type = 'button'
        b.title = `Salin kod ${name}`
      }
    })
  }

  async function salinTeks(text) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Cara lama, jika pelayar tidak membenarkan navigator.clipboard
      const ta = el('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
      document.body.appendChild(ta)
      ta.select()
      let ok = false
      try { ok = document.execCommand('copy') } catch { ok = false }
      ta.remove()
      return ok
    }
  }

  document.addEventListener('click', async (e) => {
    const b = e.target.closest('.salin-kod, button[data-salin]')
    if (!b) return
    const ok = await salinTeks(b.dataset.salin ? kodLatihan[b.dataset.salin] : kodBlok[b.dataset.kod])
    b.blur() // supaya Space terus ke slaid seterusnya
    say(ok ? '✓ Kod disalin. Tampal dengan Ctrl + V' : 'Tidak dapat menyalin. Pilih kod dan tekan Ctrl + C.', 2200)
    if (!ok) return
    const label = b.querySelector('.label')
    label.dataset.asal ??= label.textContent
    label.textContent = 'Disalin ✓'
    b.classList.add('done')
    clearTimeout(b._salinTimer)
    b._salinTimer = setTimeout(() => { label.textContent = label.dataset.asal; b.classList.remove('done') }, 1600)
  })

  // ---------------------------------------------------------------------
  // 4. Sediakan slaid
  // ---------------------------------------------------------------------
  const folderIcon = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>'
  const ikon = {
    luar: '<svg class="ikon-luar" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7zm5 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z"/></svg>',
    salin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg>',
    main: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
  }
  const kodBlok = [] // teks asal setiap blok kod, untuk butang Salin
  const kodLatihan = window.KOD_LATIHAN || {} // dari kod-latihan.js (npm run kod-latihan)
  let module = ''
  let accent = 'vue'
  const footerText = stage.dataset.footer || '' // nama bengkel + penganjur, dari index.html
  const footerEvent = footerText ? `<span class="event">${esc(footerText)}</span>` : ''
  slides.forEach((s, i) => {
    if (s.dataset.module != null) module = s.dataset.module
    else s.dataset.module = module
    if (s.dataset.accent) accent = s.dataset.accent
    else s.dataset.accent = accent
    if (!s.dataset.title) s.dataset.title = (s.querySelector('h1, h2')?.textContent || `Halaman ${i + 1}`).replace(/\s+/g, ' ').trim()
    if (s.dataset.cp) s.appendChild(el('div', 'cp-badge', `<span class="cp-top">${folderIcon}checkpoint ${esc(s.dataset.cp)}</span>${langkahBar(s.dataset.cp)}`))
  })

  // Bar kemajuan aplikasi peserta dalam lencana checkpoint: 14 langkah (01–14), yang siap berwarna
  function langkahBar(cp) {
    const n = Number(cp)
    if (!(n >= 1 && n <= LANGKAH)) return ''
    let html = ''
    for (let k = 1; k <= LANGKAH; k++) html += `<i class="${k < n ? 'siap' : k === n ? 'kini' : ''}"></i>`
    return `<span class="cp-bar" title="Deploy anda: langkah ${n} daripada ${LANGKAH}">${html}</span>`
  }

  // Kaki skrin "Giliran anda" pada halaman yang peserta menaip atau mencuba sendiri:
  //   data-giliran="apa yang perlu dibuat (boleh guna HTML)"  data-fail="src/App.vue"  data-minit="10"
  //   data-jenis="cuba"   eksperimen kecil, tiada checkpoint
  //   data-jenis="tunjuk" perhati sahaja, ikut jika sempat
  //   data-cp (sedia ada) → "Ambil fail: npm run checkpoint 05" (kecuali data-jenis="cuba", atau
  //   data-giliran sudah menyebut npm run checkpoint: arahan itu sudah di depan, jangan ulang di hujung)
  function giliranHtml(s) {
    const jenis = s.dataset.jenis || 'taip'
    const label = { taip: '✍ Giliran anda', cuba: '🧪 Cuba sendiri', tunjuk: '👀 Tunjuk cara' }[jenis] || '✍ Giliran anda'
    const fail = s.dataset.fail ? `<code>${esc(s.dataset.fail)}</code> · ` : ''
    const minit = s.dataset.minit ? `<span class="g-minit">⏱ ~${esc(s.dataset.minit)} minit</span>` : ''
    // Bengkel ini: fail deploy datang daripada checkpoint (peserta tidak menaip fail konfigurasi)
    const cp = s.dataset.cp && jenis !== 'cuba' && !s.dataset.giliran.includes('npm run checkpoint')
      ? `<span class="g-cp">Ambil fail: <b>npm run checkpoint ${esc(s.dataset.cp)}</b></span>`
      : ''
    return `<span class="g-label">${label}</span><span class="g-text">${fail}${s.dataset.giliran}</span>${minit}${cp}`
  }
  // Kaki slaid untuk cetakan/PDF (kaki skrin di bawah tidak dicetak)
  slides.forEach((s, i) => s.appendChild(el('div', 'print-foot',
    `<span class="module">${esc(s.dataset.module)}</span><span class="right">${footerEvent}<span class="count">${i + 1} / ${slides.length}</span></span>`)))
  stage.querySelectorAll('textarea.code').forEach(renderCode)
  setupKodLatihan(stage)
  setupLinks(stage)
  mountDemos(stage)
  setupTimers(stage)

  // Kaki slaid + bar kemajuan
  const footer = el('div', 'chrome-footer', `<span class="giliran"></span><span class="module"></span><span class="right">${footerEvent}<span class="count" title="Menu (M)"></span></span>`)
  const progress = el('div', 'progress')
  stage.append(footer, progress)
  footer.querySelector('.count').addEventListener('click', () => toggleMenu(true))

  // Lapisan: menu, bantuan, skrin hitam, toast
  const menuOverlay = el('div', 'overlay')
  const menu = el('nav', 'menu')
  menuOverlay.appendChild(menu)
  menuOverlay.addEventListener('click', (e) => { if (e.target === menuOverlay) toggleMenu(false) })

  const helpOverlay = el('div', 'overlay', `
    <div class="help">
      <h3>Kekunci pintas</h3>
      <table>
        <tr><td><span class="kbd">→</span> <span class="kbd">Space</span> <span class="kbd">PgDn</span></td><td>Seterusnya</td></tr>
        <tr><td><span class="kbd">←</span> <span class="kbd">PgUp</span></td><td>Sebelumnya</td></tr>
        <tr><td><span class="kbd">Home</span> <span class="kbd">End</span></td><td>Halaman pertama / akhir</td></tr>
        <tr><td><span class="kbd">12</span> <span class="kbd">Enter</span></td><td>Pergi ke halaman 12</td></tr>
        <tr><td><span class="kbd">M</span></td><td>Menu: lompat ke bahagian / halaman</td></tr>
        <tr><td><span class="kbd">P</span></td><td>Paparan penceramah (nota + jam)</td></tr>
        <tr><td><span class="kbd">Q</span></td><td>Kod QR (Google Form, Drive...)</td></tr>
        <tr><td><span class="kbd">F</span></td><td>Skrin penuh</td></tr>
        <tr><td><span class="kbd">B</span></td><td>Skrin hitam (semasa menaip kod)</td></tr>
        <tr><td><span class="kbd">D</span></td><td>Tema gelap / cerah</td></tr>
        <tr><td><span class="kbd">Ctrl</span> + <span class="kbd">P</span></td><td>Cetak / simpan PDF</td></tr>
        <tr><td>Tetikus atas kod</td><td>Butang <b>Salin</b> untuk menyalin kod</td></tr>
      </table>
    </div>`)
  helpOverlay.addEventListener('click', () => helpOverlay.classList.remove('open'))

  const blackout = el('div', 'blackout')
  blackout.addEventListener('click', () => setBlack(false))
  const toast = el('div', 'toast')
  document.body.append(menuOverlay, helpOverlay, blackout, toast)

  let toastTimer = null
  function say(text, ms = 1600) {
    toast.textContent = text
    toast.classList.add('show')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => toast.classList.remove('show'), ms)
  }

  function setBlack(on, fromPeer) {
    blackout.classList.toggle('on', on)
    if (!fromPeer) post({ deck: 'black', on })
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen()
    else document.documentElement.requestFullscreen?.()
  }

  function toggleTheme() {
    const dark = document.documentElement.dataset.theme !== 'dark'
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    store.set('slaid-theme', dark ? 'dark' : 'light')
    if (isPresenter) renderPresenter()
  }

  // ---------------------------------------------------------------------
  // 4b. Jadual hari ini — satu sumber untuk slaid agenda, slaid rehat,
  //     masa pada slaid modul dan menu. Perubahan disimpan untuk hari ini
  //     sahaja dan diselaraskan dengan tetingkap penceramah.
  // ---------------------------------------------------------------------
  const JADUAL_KEY = 'slaid-jadual'
  const agenda = (() => {
    try { return JSON.parse(document.getElementById('jadual')?.textContent || '[]') } catch { return [] }
  })()
  const toMin = (s) => { const [h, m] = String(s).split(':').map(Number); return h * 60 + m }
  const pad2 = (n) => String(n).padStart(2, '0')
  const hhmm = (m) => `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`
  const masaBM = (m) => {
    const h = Math.floor(m / 60)
    const bahagian = h < 12 ? 'pagi' : h < 14 ? 'tengah hari' : h < 19 ? 'petang' : 'malam'
    return `${((h + 11) % 12) + 1}:${pad2(m % 60)} ${bahagian}`
  }
  const durText = (n) => { n = Math.round(n); const h = Math.floor(n / 60), m = n % 60; return h && m ? `${h} jam ${m} minit` : h ? `${h} jam` : `${m} minit` }
  const durShort = (n) => (n === 90 ? '1½ jam' : n % 60 === 0 ? `${n / 60} jam` : `${n} min`)
  const fmtSecs = (s) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h ? `${h}:${pad2(m)}:${pad2(s % 60)}` : `${pad2(m)}:${pad2(s % 60)}` }
  const todayKey = () => new Date().toLocaleDateString('en-CA')
  const atToday = (m) => { const d = new Date(); d.setHours(Math.floor(m / 60), m % 60, 0, 0); return d.getTime() }

  const defaults = Object.fromEntries(agenda.map((a) => [a.id, toMin(a.masa)]))
  const agendaIndex = (id) => agenda.findIndex((a) => a.id === id)
  const agendaItem = (id) => agenda[agendaIndex(id)]
  const nextId = (id) => agenda[agendaIndex(id) + 1]?.id
  const endOf = (id) => { const n = nextId(id); return n ? times[n] : times[id] }
  const agendaLabel = (a) => (a.modul ? `<strong>${esc(a.modul)}</strong> · ${esc(a.tajuk)}` : esc(a.tajuk))

  function sanitizeTimes(obj) {
    const t = { ...defaults }
    for (const [id, v] of Object.entries(obj || {})) {
      const m = typeof v === 'number' ? v : toMin(v)
      if (id in t && Number.isFinite(m)) t[id] = clamp(Math.round(m), 0, 24 * 60 - 1)
    }
    return t
  }
  function loadTimes() {
    try {
      const saved = JSON.parse(store.get(JADUAL_KEY) || 'null')
      if (saved && saved.tarikh === todayKey()) return sanitizeTimes(saved.masa)
    } catch { /* abaikan */ }
    return { ...defaults }
  }
  let times = loadTimes()

  // Ubah satu atau lebih masa. Masa sentiasa mengikut turutan:
  // jika satu bahagian dianjak melepasi bahagian seterusnya, bahagian itu ikut dianjak.
  function changeTimes(changes) {
    const t = { ...times }
    changes.forEach(([id, m]) => { if (id in t) t[id] = clamp(Math.round(m), 0, 24 * 60 - 1) })
    for (let j = 1; j < agenda.length; j++) {
      if (t[agenda[j].id] < t[agenda[j - 1].id]) t[agenda[j].id] = t[agenda[j - 1].id]
    }
    applyTimes(t)
  }
  function applyTimes(t, fromPeer) {
    times = t
    if (!fromPeer) {
      const diff = {}
      agenda.forEach((a) => { if (times[a.id] !== defaults[a.id]) diff[a.id] = hhmm(times[a.id]) })
      store.set(JADUAL_KEY, JSON.stringify({ tarikh: todayKey(), masa: diff }))
      post({ deck: 'jadual', masa: times })
    }
    renderSchedule()
    if (menuOverlay.classList.contains('open')) buildMenu()
    if (isPresenter) renderPresenter()
  }

  function agendaRow(a, k, cur) {
    const ci = cur ? agendaIndex(cur) : -1
    const cls = ['item']
    if (a.rehat || a.tamat) cls.push('rest')
    if (ci >= 0 && k < ci) cls.push('done')
    if (k === ci) cls.push('now')
    const changed = times[a.id] !== defaults[a.id]
    const adj = ci >= 0
      ? `<span class="adj"><button data-act="adj" data-id="${esc(a.id)}" data-d="-5" title="5 minit lebih awal">−5</button><button data-act="adj" data-id="${esc(a.id)}" data-d="5" title="5 minit lewat">+5</button></span>`
      : ''
    return `<div class="${cls.join(' ')}"${a.warna ? ` style="--c: var(--${esc(a.warna)})"` : ''}>`
      + `<span class="time${changed ? ' changed' : ''}"${changed ? ` title="Asal: ${esc(a.masa)}"` : ''}>${hhmm(times[a.id])}</span>`
      + `<span class="dot"></span><span class="what">${agendaLabel(a)}</span>${adj}</div>`
  }

  function renderSchedule() {
    stage.querySelectorAll('[data-jadual-senarai]').forEach((box) => {
      const cur = box.dataset.jadualSenarai
      box.innerHTML = agenda.map((a, k) => agendaRow(a, k, cur)).join('')
      if (!cur) box.style.gridTemplateRows = `repeat(${Math.ceil(agenda.length / 2)}, auto)`
    })
    stage.querySelectorAll('[data-jadual-masa]').forEach((p) => {
      const ids = p.dataset.jadualMasa.trim().split(/\s+/)
      if (ids.every((id) => id in times)) p.textContent = `${hhmm(times[ids[0]])} – ${hhmm(endOf(ids[ids.length - 1]))}`
    })
    stage.querySelectorAll('.slide.break[data-rehat]').forEach((s) => {
      const back = s.querySelector('[data-r="back"]')
      if (back && s.dataset.rehat in times) back.textContent = masaBM(endOf(s.dataset.rehat))
    })
    updateCountdowns()
  }

  // Kira detik pada slaid rehat: sebelum rehat = tempoh; semasa = baki; selepas = 00:00
  function updateCountdowns() {
    const now = Date.now()
    document.querySelectorAll('[data-countdown]').forEach((cd) => {
      const id = cd.dataset.countdown
      if (!(id in times)) return
      const start = atToday(times[id])
      const end = atToday(endOf(id))
      let secs, state, label
      if (now < start) {
        secs = Math.round((end - start) / 1000); state = 'before'
        label = `Tempoh ${durText((end - start) / 60000)} · bermula ${masaBM(times[id])}`
      } else if (now < end) {
        secs = Math.ceil((end - now) / 1000); state = secs <= 60 ? 'soon' : 'running'
        label = 'lagi sebelum kita sambung'
      } else {
        secs = 0; state = 'done'; label = 'Masa untuk sambung!'
      }
      cd.textContent = fmtSecs(secs)
      cd.dataset.state = state
      const l = cd.parentElement.querySelector('[data-r="cdl"]')
      if (l && l.textContent !== label) l.textContent = label
    })
  }

  // Bina kawalan pada setiap slaid rehat
  stage.querySelectorAll('.slide.break[data-rehat]').forEach((s) => {
    const id = s.dataset.rehat
    const presets = (s.dataset.pilihan || '10,15,30,60').split(',').map(Number).filter((n) => n > 0)
    const main = el('div', 'break-main')
    const icon = s.querySelector(':scope > .icon')
    const h1 = s.querySelector(':scope > h1')
    if (icon) main.appendChild(icon)
    if (h1) main.appendChild(h1)
    main.insertAdjacentHTML('beforeend', `
      <p class="back">Kembali pada <strong data-r="back"></strong></p>
      <div class="ctl back-adj">
        <button data-act="back" data-d="-5" title="Sambung 5 minit lebih awal">−5 minit</button>
        <button data-act="back" data-d="5" title="Sambung 5 minit lewat">+5 minit</button>
      </div>
      <div class="countdown" data-countdown="${esc(id)}">--:--</div>
      <div class="cd-label" data-r="cdl"></div>
      <div class="ctl presets">
        <span>Mula rehat sekarang</span>
        ${presets.map((p) => `<button data-act="preset" data-min="${p}" title="Mula sekarang, kembali selepas ${durText(p)}">${durShort(p)}</button>`).join('')}
      </div>`)
    const side = el('div', 'break-agenda', `
      <h3>Agenda hari ini</h3>
      <div class="timeline single" data-jadual-senarai="${esc(id)}"></div>
      <button class="ctl reset" data-act="reset" title="Buang semua perubahan masa hari ini">↺ Set semula jadual asal</button>`)
    s.prepend(main, side)
  })

  // Butang pada slaid rehat (main & penceramah)
  stage.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-act]')
    if (!b) return
    const id = b.closest('.slide')?.dataset.rehat
    const act = b.dataset.act
    if (act === 'reset') {
      applyTimes({ ...defaults })
      say('Jadual asal dipulihkan')
    } else if (act === 'adj') {
      changeTimes([[b.dataset.id, times[b.dataset.id] + Number(b.dataset.d)]])
    } else if (act === 'back' && id && nextId(id)) {
      changeTimes([[nextId(id), Math.max(times[id], endOf(id) + Number(b.dataset.d))]])
    } else if (act === 'preset' && id && nextId(id)) {
      // Rehat bermula sekarang; kembali selepas tempoh dipilih (dibundarkan ke minit terdekat)
      const now = new Date()
      const nowMin = now.getHours() * 60 + now.getMinutes()
      const back = nowMin + Number(b.dataset.min) + (now.getSeconds() >= 30 ? 1 : 0)
      changeTimes([[id, nowMin], [nextId(id), back]])
      say(`Rehat ${durText(Number(b.dataset.min))} · kembali pada ${masaBM(times[nextId(id)])}`, 2600)
    }
    b.blur() // supaya Space/anak panah terus mengawal slaid
  })

  window.addEventListener('storage', (e) => { if (e.key === JADUAL_KEY) applyTimes(loadTimes(), true) })
  renderSchedule()
  setInterval(updateCountdowns, 1000)

  // ---------------------------------------------------------------------
  // 4c. Menu (kanan): butang besar setiap bahagian hari ini
  // ---------------------------------------------------------------------
  // Bahagian baharu bermula pada: modul baharu, slaid rehat, atau slaid dengan data-jadual
  const groups = []
  slides.forEach((s, i) => {
    const isBreak = s.classList.contains('break')
    const last = groups[groups.length - 1]
    const fresh = !last || isBreak || last.isBreak || s.dataset.jadual || s.dataset.module !== slides[last.from].dataset.module
    if (fresh) groups.push({ from: i, to: i, isBreak, id: s.dataset.rehat || s.dataset.jadual || null })
    else last.to = i
  })

  function buildMenu() {
    const cur = groups.findIndex((g) => index >= g.from && index <= g.to)
    menu.innerHTML = `
      <div class="menu-head">
        <div><h3>Menu</h3><span>Klik untuk terus ke bahagian · <span class="kbd">Esc</span> untuk tutup</span></div>
        <button class="menu-close" data-menu="close" title="Tutup (Esc)">✕</button>
      </div>
      <div class="menu-groups">${groups.map((g, gi) => {
        const s = slides[g.from]
        const a = g.id ? agendaItem(g.id) : null
        const many = g.to > g.from
        const icon = g.isBreak ? `<span class="t-icon">${esc(s.querySelector('.icon')?.textContent.trim() || '☕')}</span>` : ''
        const title = g.isBreak ? esc(s.querySelector('h1')?.textContent.trim() || s.dataset.title) : a ? agendaLabel(a) : esc(s.dataset.module || s.dataset.title)
        const range = many ? `Halaman ${g.from + 1}–${g.to + 1}` : `Halaman ${g.from + 1}`
        const sub = a && a.id in times ? `${range} · hingga ${hhmm(endOf(a.id))}` : range
        const color = g.isBreak ? 'var(--muted)' : `var(--${esc(s.dataset.accent || 'vue')})`
        const list = many
          ? `<div class="mslides">${slides.slice(g.from, g.to + 1).map((x, k) => {
              const i = g.from + k
              return `<button data-go="${i}"${i === index ? ' class="current"' : ''}><span>${i + 1}</span>${esc(x.dataset.title)}</button>`
            }).join('')}</div>`
          : ''
        return `<div class="mgroup${gi === cur ? ' current open' : ''}${g.isBreak ? ' is-break' : ''}" style="--c: ${color}">
          <div class="mrow">
            <button class="tile" data-go="${g.from}">
              <span class="t-time">${a && a.id in times ? hhmm(times[a.id]) : ''}</span>
              <span class="t-body"><span class="t-title">${icon}${title}</span><span class="t-sub">${sub}</span></span>
            </button>
            ${many ? `<button class="t-more" data-toggle title="Tunjuk / sembunyi halaman">▾</button>` : ''}
          </div>${list}
        </div>`
      }).join('')}</div>
      <div class="menu-actions">
        ${isPresenter ? '' : '<button data-menu="presenter">Penceramah <span class="kbd">P</span></button>'}
        <button data-menu="qr">Kod QR <span class="kbd">Q</span></button>
        <button data-menu="fullscreen">Skrin penuh <span class="kbd">F</span></button>
        <button data-menu="theme">Gelap / cerah <span class="kbd">D</span></button>
      </div>`
  }

  menu.addEventListener('click', (e) => {
    const b = e.target.closest('button')
    if (!b) return
    b.blur() // supaya Space/anak panah terus mengawal slaid selepas menu ditutup
    if (b.dataset.go != null) { toggleMenu(false); go(Number(b.dataset.go), 0); return }
    if (b.hasAttribute('data-toggle')) { b.closest('.mgroup').classList.toggle('open'); return }
    const act = b.dataset.menu
    if (act === 'close') toggleMenu(false)
    if (act === 'presenter') { toggleMenu(false); openPresenter() }
    if (act === 'qr') openQr()
    if (act === 'fullscreen') toggleFullscreen()
    if (act === 'theme') toggleTheme()
  })

  function toggleMenu(open) {
    const willOpen = open ?? !menuOverlay.classList.contains('open')
    if (willOpen) buildMenu()
    menuOverlay.classList.toggle('open', willOpen)
    if (willOpen) menu.querySelector('.mgroup.current')?.scrollIntoView({ block: 'center' })
  }

  // ---------------------------------------------------------------------
  // 4d. Kod QR (menu → Kod QR, atau kekunci Q)
  //     Untuk pautan Google Form, Google Drive dan lain-lain. Dijana dalam pelayar,
  //     tanpa internet (vendor/qrcode.js). Kod QR yang dijana di tetingkap penceramah
  //     turut dipaparkan pada projektor (tanpa borang). 6 kod terakhir diingat.
  // ---------------------------------------------------------------------
  const QR_KEY = 'slaid-qr'
  if (window.qrcode?.stringToBytesFuncs?.['UTF-8']) qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8']
  const escAttr = (s) => esc(s).replace(/"/g, '&quot;')
  const qrOverlay = el('div', 'overlay qr-overlay', `
    <button class="qr-close" type="button" data-qr="close">Tutup (Esc)</button>
    <div class="qr-wrap">
      <form class="qr-form" autocomplete="off">
        <label>Tajuk<input name="tajuk" type="text" maxlength="80" placeholder="cth. Borang maklum balas"></label>
        <label>Pautan<input name="pautan" type="text" inputmode="url" spellcheck="false" placeholder="https://..."></label>
        <button type="submit">Jana kod QR</button>
      </form>
      <div class="qr-terkini"></div>
      <div class="qr-title"></div>
      <div class="qr-box"></div>
      <a class="qr-link" target="_blank" rel="noopener"></a>
    </div>`)
  const qrForm = qrOverlay.querySelector('.qr-form')
  const qrInput = qrForm.elements
  let qrShown = null // { tajuk, pautan } yang sedang dipaparkan
  let qrState = {} // { tajuk, pautan, terkini: [{ tajuk, pautan }] }, dikongsi semua tetingkap melalui localStorage
  function loadQrState() {
    try { qrState = JSON.parse(store.get(QR_KEY)) || {} } catch { qrState = {} }
    qrState.terkini = Array.isArray(qrState.terkini) ? qrState.terkini.filter((x) => x && x.pautan).slice(0, 6) : []
  }

  // "forms.gle/abc" → "https://forms.gle/abc", supaya telefon membukanya sebagai pautan
  function normalUrl(s) {
    s = s.trim()
    if (s && !/^[a-z][a-z0-9+.-]*:/i.test(s) && /^[\w-]+(\.[\w-]+)+/.test(s)) s = `https://${s}`
    return s
  }

  function qrSvg(text) {
    const qr = qrcode(0, 'M') // saiz automatik, pembetulan ralat M (15%)
    qr.addData(text)
    qr.make()
    const n = qr.getModuleCount()
    const q = 4 // zon senyap: 4 modul putih di sekeliling
    let d = ''
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c + q} ${r + q}h1v1h-1z`
    }
    return `<svg viewBox="0 0 ${n + 2 * q} ${n + 2 * q}" shape-rendering="crispEdges" role="img" aria-label="Kod QR">` +
      `<rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#000"/></svg>`
  }

  function renderTerkini() {
    const box = qrOverlay.querySelector('.qr-terkini')
    box.innerHTML = qrState.terkini.length
      ? '<span>Terkini:</span>' + qrState.terkini.map((x, i) => `<span class="qr-chip">` +
        `<button type="button" data-qr-i="${i}" title="${escAttr(x.pautan)}">${esc(x.tajuk || x.pautan.replace(/^https?:\/\//, ''))}</button>` +
        `<button type="button" class="qr-del" data-qr-del="${i}" title="Buang daripada senarai" aria-label="Buang">×</button></span>`).join('')
      : ''
  }

  function renderQr(data) {
    try {
      qrOverlay.querySelector('.qr-box').innerHTML = qrSvg(data.pautan)
    } catch {
      say('Pautan terlalu panjang untuk kod QR.', 3000)
      return false
    }
    qrOverlay.querySelector('.qr-title').textContent = data.tajuk
    const link = qrOverlay.querySelector('.qr-link')
    link.textContent = data.pautan.replace(/^https?:\/\//, '')
    if (/^https?:\/\//i.test(data.pautan)) {
      link.href = data.pautan
      link.insertAdjacentHTML('beforeend', ikon.luar)
    } else {
      link.removeAttribute('href')
    }
    qrInput.tajuk.value = data.tajuk
    qrInput.pautan.value = data.pautan
    qrOverlay.classList.add('has-qr')
    qrShown = data
    return true
  }

  // Dari menu / kekunci Q: buka borang (diisi dengan kod QR terakhir)
  function openQr() {
    toggleMenu(false)
    helpOverlay.classList.remove('open')
    qrOverlay.classList.remove('remote')
    loadQrState()
    if (!qrShown) {
      qrInput.tajuk.value = qrState.tajuk || ''
      qrInput.pautan.value = qrState.pautan || ''
    }
    renderTerkini()
    qrOverlay.classList.add('open')
    ;(qrInput.tajuk.value ? qrInput.pautan : qrInput.tajuk).focus()
  }

  function janaQr(data) {
    if (!renderQr(data)) return
    qrOverlay.classList.remove('remote')
    qrOverlay.classList.add('open')
    loadQrState()
    qrState.tajuk = data.tajuk
    qrState.pautan = data.pautan
    qrState.terkini = [data, ...qrState.terkini.filter((x) => x.pautan !== data.pautan)].slice(0, 6)
    store.set(QR_KEY, JSON.stringify(qrState))
    renderTerkini()
    if (qrOverlay.contains(document.activeElement)) document.activeElement.blur()
    post({ deck: 'qr', data })
  }

  function closeQr(fromPeer) {
    qrOverlay.classList.remove('open', 'has-qr')
    qrOverlay.querySelector('.qr-box').innerHTML = ''
    qrShown = null
    if (qrOverlay.contains(document.activeElement)) document.activeElement.blur()
    if (!fromPeer) post({ deck: 'qr', data: null })
  }

  qrForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const pautan = normalUrl(qrInput.pautan.value)
    if (!pautan) { qrInput.pautan.focus(); say('Masukkan pautan dahulu', 1800); return }
    janaQr({ tajuk: qrInput.tajuk.value.trim(), pautan })
  })
  qrOverlay.addEventListener('click', (e) => {
    const b = e.target.closest('button')
    if (!b) return
    if (b.dataset.qr === 'close') closeQr()
    if (b.dataset.qrI != null) janaQr(qrState.terkini[Number(b.dataset.qrI)])
    if (b.dataset.qrDel != null) {
      const buang = qrState.terkini[Number(b.dataset.qrDel)]
      loadQrState()
      qrState.terkini = qrState.terkini.filter((x) => x.pautan !== buang?.pautan)
      store.set(QR_KEY, JSON.stringify(qrState))
      renderTerkini()
    }
  })
  document.body.appendChild(qrOverlay)

  // ---------------------------------------------------------------------
  // 5. Navigasi
  // ---------------------------------------------------------------------
  function stepsOf(i) { return Array.from(slides[i].querySelectorAll('.step')) }

  // Peralihan: slaid lama pudar keluar, slaid baharu pudar masuk (lihat deck.css)
  const ANIM_MS = 350
  let animTimer = null
  function finishTransition() {
    clearTimeout(animTimer)
    slides.forEach((x) => { x.classList.remove('leaving'); delete x.dataset.anim })
  }

  function go(i, step = 0, opts = {}) {
    i = clamp(i, 0, slides.length - 1)
    const from = index
    finishTransition()
    slides[from].classList.remove('active')
    index = i
    const s = slides[i]
    s.classList.add('active')
    if (i !== from && !opts.instant) {
      const dir = i > from ? 'next' : 'prev'
      void s.offsetWidth // mulakan semula animasi jika slaid ini baru sahaja beranimasi
      slides[from].classList.add('leaving')
      slides[from].dataset.anim = `out-${dir}`
      s.dataset.anim = `in-${dir}`
      animTimer = setTimeout(finishTransition, ANIM_MS + 30)
    }
    const steps = stepsOf(i)
    stepIndex = step === 'all' ? steps.length : clamp(step, 0, steps.length)
    steps.forEach((x, k) => x.classList.toggle('shown', k < stepIndex))

    stage.dataset.accent = s.dataset.accent
    stage.classList.toggle('no-footer', /\b(title-slide|section|break)\b/.test(s.className))
    stage.classList.toggle('ada-giliran', s.dataset.giliran != null)
    footer.querySelector('.giliran').innerHTML = s.dataset.giliran != null ? giliranHtml(s) : ''
    footer.querySelector('.module').textContent = s.dataset.module
    footer.querySelector('.count').textContent = `${i + 1} / ${slides.length}`
    progress.style.width = `${((i + 1) / slides.length) * 100}%`
    history.replaceState(null, '', `${location.pathname}${location.search}#${i + 1}`)

    if (!opts.silent) post({ deck: 'goto', i: index, step: stepIndex })
    if (isPresenter) renderPresenter()
  }

  function next() {
    const steps = stepsOf(index)
    if (stepIndex < steps.length) {
      steps[stepIndex].classList.add('shown')
      stepIndex++
      post({ deck: 'goto', i: index, step: stepIndex })
      if (isPresenter) renderPresenter()
    } else if (index < slides.length - 1) {
      go(index + 1, 0)
    }
  }

  function prev() {
    if (stepIndex > 0) {
      stepIndex--
      stepsOf(index)[stepIndex].classList.remove('shown')
      post({ deck: 'goto', i: index, step: stepIndex })
      if (isPresenter) renderPresenter()
    } else if (index > 0) {
      go(index - 1, 'all')
    }
  }

  // Penyegerakan antara tetingkap slaid:
  //  - postMessage: tetingkap penceramah yang dibuka dengan P (berfungsi juga dari fail, file://)
  //  - BroadcastChannel: semua tetingkap slaid pada alamat yang sama, walaupun dibuka
  //    secara berasingan (contoh: dari halaman mula aplikasi, http://localhost:...)
  const channel = (() => {
    try { return new BroadcastChannel('slaid-bengkel') } catch { return null }
  })()
  function post(msg) {
    if (peer && !peer.closed) {
      try { peer.postMessage(msg, '*') } catch { /* tetingkap ditutup */ }
    }
    if (channel) {
      try { channel.postMessage(msg) } catch { /* abaikan */ }
    }
  }
  function onSync(m, source) {
    if (!m || typeof m !== 'object' || !m.deck) return
    if (m.deck === 'hello') {
      if (source) peer = source
      post({ deck: 'goto', i: index, step: stepIndex })
      post({ deck: 'jadual', masa: times })
      if (qrShown) post({ deck: 'qr', data: qrShown })
      // Pemasa yang sudah dimulakan atau dijeda: tetingkap baharu menyambung dari situ
      pemasa.forEach((p, id) => {
        const s = p.state()
        if (s.endsAt || s.left !== p.total) post({ deck: 'pemasa', id, ...s })
      })
    }
    if (m.deck === 'pemasa' && Number.isInteger(m.id) && pemasa[m.id]) pemasa[m.id].apply(m)
    if (m.deck === 'goto') go(m.i, m.step, { silent: true })
    if (m.deck === 'black') setBlack(m.on, true)
    if (m.deck === 'jadual') applyTimes(sanitizeTimes(m.masa), true)
    if (m.deck === 'qr') {
      const d = m.data
      if (d && typeof d.pautan === 'string' && d.pautan) {
        const data = { tajuk: String(d.tajuk || '').slice(0, 120), pautan: d.pautan.slice(0, 3000) }
        // Tetingkap lain (contoh: projektor) memaparkan kod QR sahaja, tanpa borang
        if (!qrOverlay.classList.contains('open')) qrOverlay.classList.add('remote')
        if (renderQr(data)) { toggleMenu(false); qrOverlay.classList.add('open') }
      } else {
        closeQr(true)
      }
    }
  }
  window.addEventListener('message', (e) => onSync(e.data, e.source))
  if (channel) channel.addEventListener('message', (e) => onSync(e.data, null))

  function openPresenter() {
    if (isPresenter) return
    const url = `${location.pathname}?presenter#${index + 1}`
    peer = window.open(url, 'slaid-penceramah', 'width=1280,height=800')
    if (!peer) say('Tetingkap pop-up disekat. Benarkan pop-up untuk fail ini.', 3000)
  }

  // Kekunci
  let numBuf = ''
  document.addEventListener('keydown', (e) => {
    const t = e.target
    if (t.closest && t.closest('input, textarea, select, [contenteditable]')) {
      if (e.key === 'Escape') {
        if (qrOverlay.contains(t)) closeQr()
        else t.blur()
      }
      return
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (e.key === ' ' && document.activeElement?.tagName === 'BUTTON') return
    if (qrOverlay.classList.contains('open')) {
      if (e.key === 'Escape') closeQr()
      return
    }

    if (menuOverlay.classList.contains('open') || helpOverlay.classList.contains('open')) {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'm' || e.key === '?') {
        toggleMenu(false)
        helpOverlay.classList.remove('open')
      }
      return
    }

    if (/^\d$/.test(e.key)) { numBuf += e.key; say(`Pergi ke halaman ${numBuf}…`); return }
    if (e.key === 'Enter' && numBuf) { go(parseInt(numBuf, 10) - 1, 0); numBuf = ''; return }
    numBuf = ''

    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ': e.preventDefault(); next(); break
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace': e.preventDefault(); prev(); break
      case 'Home': go(0, 0); break
      case 'End': go(slides.length - 1, 'all'); break
      case 'm': case 'M': toggleMenu(true); break
      case 'p': case 'P': openPresenter(); break
      case 'q': case 'Q': e.preventDefault(); openQr(); break // preventDefault: huruf q tidak masuk ke kotak Tajuk
      case 'b': case 'B': case '.': setBlack(!blackout.classList.contains('on')); break
      case 'f': case 'F': toggleFullscreen(); break
      case 'd': case 'D': toggleTheme(); break
      case '?': case 'h': case 'H': helpOverlay.classList.add('open'); break
      case 'Escape': setBlack(false); break
    }
  })

  // Leret (skrin sentuh)
  let touchX = null
  stage.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') touchX = e.clientX })
  stage.addEventListener('pointerup', (e) => {
    if (touchX == null) return
    const dx = e.clientX - touchX
    touchX = null
    if (Math.abs(dx) > 60) (dx < 0 ? next : prev)()
  })

  window.addEventListener('hashchange', () => {
    const n = parseInt(location.hash.slice(1), 10)
    if (n && n - 1 !== index) go(n - 1, 0)
  })

  // ---------------------------------------------------------------------
  // 6. Skala pentas mengikut saiz skrin
  // ---------------------------------------------------------------------
  function fitStage(target, box) {
    const r = box ? box.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight }
    const s = Math.min(r.width / W, r.height / H) || 1
    target.style.position = 'absolute'
    target.style.left = '50%'
    target.style.top = '50%'
    target.style.transform = `translate(-50%, -50%) scale(${s})`
  }

  // ---------------------------------------------------------------------
  // 7. Paparan penceramah
  // ---------------------------------------------------------------------
  let pres = null
  if (isPresenter) {
    document.body.classList.add('presenter')
    document.title = `Penceramah · ${document.title}`
    pres = {
      layout: el('div', 'presenter-layout', `
        <div class="presenter-top">
          <div><span class="label">Jam</span><span class="clock"></span></div>
          <div><span class="label">Masa berlalu (klik: set semula)</span><span class="elapsed">00:00</span></div>
          <div class="sp"></div>
          <div style="text-align:right"><span class="label">Halaman</span><span class="pos"></span></div>
        </div>
        <div class="presenter-current"></div>
        <div class="presenter-side">
          <div class="presenter-next"><span class="presenter-next-label">Seterusnya</span></div>
          <div class="presenter-notes"></div>
        </div>`),
    }
    document.body.appendChild(pres.layout)
    pres.current = pres.layout.querySelector('.presenter-current')
    pres.next = pres.layout.querySelector('.presenter-next')
    pres.notes = pres.layout.querySelector('.presenter-notes')
    pres.current.appendChild(stage)
    document.querySelector('.viewport')?.remove()

    let start = Date.now()
    const elapsed = pres.layout.querySelector('.elapsed')
    elapsed.addEventListener('click', () => { start = Date.now() })
    const tick = () => {
      const now = new Date()
      pres.layout.querySelector('.clock').textContent = now.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
      const sec = Math.floor((Date.now() - start) / 1000)
      elapsed.textContent = `${String(Math.floor(sec / 3600)).padStart(1, '0')}:${String(Math.floor((sec % 3600) / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`
    }
    tick()
    setInterval(tick, 1000)
    if (window.opener) window.opener.postMessage({ deck: 'hello' }, '*')
  }
  // Tetingkap slaid lain sudah dibuka? Minta kedudukannya supaya kita bermula di slaid yang sama.
  if (channel) channel.postMessage({ deck: 'hello' })

  function renderPresenter() {
    const s = slides[index]
    const remainingSteps = stepsOf(index).length - stepIndex
    pres.layout.querySelector('.pos').textContent = `${index + 1} / ${slides.length}`

    const notes = s.querySelector('.notes')
    pres.notes.innerHTML = `<h5>Nota · ${esc(s.dataset.title)}</h5>` + (notes ? notes.innerHTML : '<p class="empty">Tiada nota untuk halaman ini.</p>')

    pres.next.querySelectorAll('.ghost-stage').forEach((g) => g.remove())
    const label = pres.next.querySelector('.presenter-next-label')
    if (remainingSteps > 0) {
      label.textContent = `Seterusnya: langkah ${stepIndex + 1} daripada ${stepsOf(index).length} pada halaman ini`
    } else if (index < slides.length - 1) {
      const nextSlide = slides[index + 1]
      label.textContent = `Seterusnya: ${nextSlide.dataset.title}`
      const ghost = el('div', 'stage ghost-stage')
      ghost.dataset.accent = nextSlide.dataset.accent
      const clone = nextSlide.cloneNode(true)
      clone.classList.remove('leaving') // slaid ini mungkin sedang beranimasi keluar
      delete clone.dataset.anim
      clone.classList.add('active')
      clone.querySelectorAll('.step').forEach((x) => x.classList.add('shown'))
      ghost.appendChild(clone)
      pres.next.appendChild(ghost)
      fitStage(ghost, pres.next)
    } else {
      label.textContent = 'Halaman terakhir'
    }
  }

  function fitAll() {
    if (isPresenter) {
      fitStage(stage, pres.current)
      const ghost = pres.next.querySelector('.ghost-stage')
      if (ghost) fitStage(ghost, pres.next)
    } else {
      fitStage(stage, null)
    }
  }
  window.addEventListener('resize', fitAll)
  window.addEventListener('load', fitAll)

  // PDF sentiasa dalam tema cerah, walaupun mod gelap sedang aktif
  let themeBeforePrint = null
  window.addEventListener('beforeprint', () => {
    themeBeforePrint = document.documentElement.dataset.theme || null
    document.documentElement.dataset.theme = 'light'
  })
  window.addEventListener('afterprint', () => {
    if (themeBeforePrint) document.documentElement.dataset.theme = themeBeforePrint
    else delete document.documentElement.dataset.theme
  })

  // ---------------------------------------------------------------------
  // 8. Mula
  // ---------------------------------------------------------------------
  const savedTheme = store.get('slaid-theme')
  if (savedTheme) document.documentElement.dataset.theme = savedTheme
  const startAt = parseInt(location.hash.slice(1), 10)
  go(startAt ? startAt - 1 : 0, 0, { silent: true, instant: true })
  fitAll()
  if (!isPresenter) say('Tekan ? untuk kekunci pintas · P untuk paparan penceramah', 3200)
})()
