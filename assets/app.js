// =========================================================
//  TimeStopper Docs — content + routing
// =========================================================

const DOCS = [
  {
    id: "concept",
    num: "01",
    tag: "中核 / コンセプト確定",
    title: "製品コンセプト概要",
    desc: "第一弾モデルの製品像を確定した中核ドキュメント。「何を作るのか」の決定版。",
    file: "docs/製品コンセプト概要.md",
    tldr:
      "横一列の複数レンズで<b>同時撮影</b>し、数枚を素早く連続再生して「動く写真（ウィグル）」を撮る、<b>安くて小さいトイカメラ</b>。本体は撮るだけ、重い処理はスマホアプリ。第一弾は<b>5眼目標・¥4,980〜7,980・日本先行</b>。",
    points: [
      "<b>作るもの</b>：デジタル多眼ウィグル・トイカメラ「TimeStopper」。被写体は止まり、視点だけが横にスッとずれる。",
      "<b>役割分担</b>：本体＝準同時シャッター＋保存＋Wi-Fi転送だけ。アプリ＝位置合わせ→GIF/MP4化→SNS共有。",
      "<b>品質の肝</b>：アプリ側の「位置合わせ（レジストレーション）」精度。精密同期は非要件にして原価を下げる。",
      "<b>狙うスペック</b>：5眼（原価次第で4眼）／Wi-Fi／内蔵LiPo＋USB-C／GIF基本＋MP4／¥4,980〜7,980。",
      "<b>売り方</b>：Z世代SNSユーザー向け・日本先行。クラファン→EC／雑貨店。",
      "<b>やらない</b>：レンズ装着型・フィルム式・高価格の愛好家路線・高速被写体（スポーツ等）。",
    ],
  },
  {
    id: "oss",
    num: "02",
    tag: "技術調査",
    title: "OSS調査：ESP32 同時シャッター",
    desc: "4眼/5眼を同時シャッターで撮るための既存OSS・先行プロジェクトの技術調査。",
    file: "docs/OSS調査_ESP32マルチカメラ同時シャッター.md",
    tldr:
      "ESP32で4眼同時撮影の先行事例は<b>ある</b>が、そのまま使える「同時シャッター完成OSS」は<b>無い</b>。OV2640のローリングシャッター＋独立クロックで露光が数〜数十msズレる。<b>静止〜低速被写体ならESP32-CAM＋シリアルトリガで素早く試作可能</b>。",
    points: [
      "<b>先行事例</b>：Hackaday 4眼ウィグル（コード非公開）／KameraflY（WiFi群れ・真の時刻同期は未実装）／公式 espressif/esp32-camera（Apache-2.0）。",
      "<b>核心課題</b>：露光タイミングの精密同期は未解決。「命令」は同期できても各センサの露光位相がバラバラ。",
      "<b>動体も止めたいなら</b>：共通XCLK配給／グローバルシャッターセンサ／MIPI束ね等の自社設計が必須。",
      "<b>結論</b>：トイ路線（静止〜低速）はOSS土台で素早く試作可。差別化を“動体”に置くなら自社開発が核心競争領域。",
    ],
  },
  {
    id: "competitor",
    num: "03",
    tag: "マーケティング調査",
    title: "競合調査：多眼ウィグル・トイカメラ",
    desc: "国内外の競合・クラファン・OEMを調べ、狙うべき市場の空白を特定。",
    file: "docs/競合調査_ウィグルグラム・トイカメラ.md",
    tldr:
      "「①デジタル ②多眼ウィグル ③チープな単体トイ ④日本流通」を<b>全部満たす製品は世界に存在しない＝市場の空白＝勝ち筋</b>。最接近はK4MERA（スイス・未発売・高価格）。日本で警戒すべきは<b>RETO 3D</b>と<b>ドンキ等の激安1眼トイ</b>。",
    points: [
      "<b>空白は確定</b>：国内クラファンも海外クラファンもAlibaba OEMも、単体デジタル多眼ウィグルのトイは無し。",
      "<b>最接近競合 K4MERA</b>：4眼デジタルウィグル／スイス／未発売waitlist／高機能・高価格／日本未流通＝層が違う。",
      "<b>日本で警戒</b>：RETO 3D（3眼フィルム¥6,980・日本正規流通）、ドンキ等の激安1眼トイデジ。",
      "<b>差別化の核</b>：安い・小さい・撮ってすぐ動く写真・時間を止めるエモさ・日本で先行。",
      "<b>知財</b>：基本原理は公知。販売時に同期/合成の実装を弁理士で先行調査。",
    ],
  },
];

const cache = {};

// ---------- nav ----------
function buildNav() {
  const nav = document.getElementById("nav");
  let html = `<div class="nav-label">START</div>`;
  html += `<a class="nav-link" data-id="home"><span class="nl-num">◎</span><span><span class="nl-title">ホーム</span><span class="nl-tag">OVERVIEW</span></span></a>`;
  html += `<div class="nav-label">DOCUMENTS — ${DOCS.length}</div>`;
  DOCS.forEach((d) => {
    html += `<a class="nav-link" data-id="${d.id}"><span class="nl-num">${d.num}</span><span><span class="nl-title">${d.title}</span><span class="nl-tag">${d.tag}</span></span></a>`;
  });
  nav.innerHTML = html;
}

function setActive(id) {
  document.querySelectorAll("[data-id]").forEach((el) => {
    if (el.classList.contains("nav-link") || el.classList.contains("brand"))
      el.classList.toggle("active", el.dataset.id === id && el.classList.contains("nav-link"));
  });
}

// ---------- home ----------
function renderHome() {
  const cards = DOCS.map(
    (d) => `
    <div class="card" data-id="${d.id}">
      <div class="c-num">${d.num}</div>
      <div>
        <div class="c-tag">${d.tag}</div>
        <div class="c-title">${d.title}</div>
        <div class="c-desc">${d.desc}</div>
      </div>
      <div class="c-go">→</div>
    </div>`
  ).join("");

  return `
  <div class="hero">
    <div class="hero-kicker">DIGITAL WIGGLEGRAM TOY CAMERA</div>
    <h1 class="wordmark" data-text="TimeStopper">TimeStopper</h1>
    <p class="hero-tag">その瞬間の「時間を止める」。<br>安くて小さい、デジタル多眼ウィグル・トイカメラ。</p>
    <div class="hero-chips">
      <span class="chip fill">⏱ コンセプト確定</span>
      <span class="chip">第一市場 : 日本</span>
      <span class="chip">🐣 HIYOKOGUMI</span>
    </div>
  </div>

  <div class="perf"></div>

  <div id="content-inner">
    <section class="section">
      <div class="keys">
        <div class="keys-label">▚ このプロジェクトの3行まとめ</div>
        <div class="tldr">横一列のレンズで<b>同時に撮った数枚</b>を素早く連続再生すると、被写体は止まったまま視点だけ横にずれる「<b>動く写真（ウィグル）</b>」になる。それを<b>安く・小さく・撮ってすぐSNS</b>に出せるトイカメラとして、<b>同種の先行者がいない日本で先行</b>する。</div>
        <ul>
          <li><b>体験</b>：誕生日や日常のエモい瞬間を、1枚写真ではなく“横に動く写真”で残す。Z世代×SNS。</li>
          <li><b>仕組み</b>：本体は同期撮影に特化した安い端末。位置合わせ・GIF化・共有は全部スマホアプリ。</li>
          <li><b>勝ち筋</b>：デジタル×多眼ウィグル×チープな単体トイ×日本流通、を全部満たす製品は現状ゼロ。</li>
        </ul>
      </div>
    </section>

    <section class="section">
      <div class="block-head">
        <span class="bh-num">[ DOCS ]</span>
        <span class="bh-title">収録ドキュメント</span>
      </div>
      <p style="color:var(--ink-2);font-size:14px;margin:-8px 0 18px">それぞれ独立した1ドキュメント。開くと先頭に「重要ポイント」、全文は折りたたみで読めます。</p>
      <div class="cards">${cards}</div>
    </section>

    <div class="home-foot">
      ⏱ THAT MOMENT, FROZEN.<br>
      🐣 by HIYOKOGUMI — 小さく始めて、ちゃんと残す。
    </div>
  </div>`;
}

// ---------- doc ----------
async function loadDoc(doc) {
  if (cache[doc.id]) return cache[doc.id];
  const res = await fetch(doc.file);
  if (!res.ok) throw new Error("load failed");
  const text = await res.text();
  cache[doc.id] = text;
  return text;
}

async function renderDoc(doc, index) {
  const content = document.getElementById("content");
  content.innerHTML = `<div class="doc-hero"><p class="mono" style="color:var(--ink-3);padding-top:60px">LOADING…</p></div>`;

  let md;
  try { md = await loadDoc(doc); }
  catch { content.innerHTML = `<div class="doc-hero"><p>ドキュメントを読み込めませんでした。</p></div>`; return; }

  const points = doc.points.map((p) => `<li>${p}</li>`).join("");
  const next = DOCS[index + 1];
  const nextBtn = next
    ? `<a class="next" data-id="${next.id}">NEXT → ${next.num} ${next.title}</a>`
    : `<a class="next" data-id="home">◎ ホームに戻る</a>`;

  content.innerHTML = `
    <div class="doc-hero">
      <div class="dh-meta">DOCUMENT ${doc.num} / ${String(DOCS.length).padStart(2,"0")} · ${doc.tag}</div>
      <div class="dh-num">${doc.num}</div>
      <h1 class="dh-title">${doc.title}</h1>
      <p class="dh-desc">${doc.desc}</p>
    </div>

    <section class="section" style="padding-top:36px">
      <div class="keys">
        <div class="keys-label">▚ 重要ポイントだけ</div>
        <div class="tldr">${doc.tldr}</div>
        <ul>${points}</ul>
      </div>

      <details class="fulltext">
        <summary>＋ 全文を読む（オリジナルのドキュメント）<span class="tw">＋</span></summary>
        <div class="md-wrap"><div class="md">${marked.parse(md)}</div></div>
      </details>
    </section>

    <div class="doc-end">
      <div class="badge">— 以上で「${doc.title}」は終わり —</div><br>
      ${nextBtn}
    </div>`;
}

// ---------- routing ----------
function go(id) { location.hash = id; }

async function route() {
  const id = (location.hash || "#home").slice(1) || "home";
  const content = document.getElementById("content");

  if (id === "home") {
    content.innerHTML = renderHome();
    setActive("home");
  } else {
    const idx = DOCS.findIndex((d) => d.id === id);
    if (idx === -1) { go("home"); return; }
    await renderDoc(DOCS[idx], idx);
    setActive(id);
  }
  window.scrollTo(0, 0);
  document.querySelector("#main").scrollTo?.(0, 0);
}

// delegated clicks for any [data-id]
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-id]");
  if (!t) return;
  go(t.dataset.id);
  document.body.classList.remove("nav-open");
});

// mobile menu
document.getElementById("menuToggle").addEventListener("click", () =>
  document.body.classList.toggle("nav-open")
);
document.getElementById("overlay").addEventListener("click", () =>
  document.body.classList.remove("nav-open")
);

// boot
buildNav();
window.addEventListener("hashchange", route);
route();
