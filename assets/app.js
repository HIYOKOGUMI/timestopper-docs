// ===== ドキュメント定義 =====
const DOCS = [
  {
    id: "concept",
    num: "ドキュメント 1",
    icon: "🧩",
    title: "製品コンセプト概要",
    desc: "第一弾モデルの製品像を確定した中核ドキュメント。何を作ろうとしているのかの決定版。",
    meta: "中核 / コンセプト確定",
    file: "docs/製品コンセプト概要.md",
  },
  {
    id: "oss",
    num: "ドキュメント 2",
    icon: "🔧",
    title: "OSS調査：ESP32 マルチカメラ同時シャッター",
    desc: "4眼/5眼を同時シャッターで撮るための既存OSS・先行プロジェクトの技術調査。",
    meta: "技術調査",
    file: "docs/OSS調査_ESP32マルチカメラ同時シャッター.md",
  },
  {
    id: "competitor",
    num: "ドキュメント 3",
    icon: "🗺️",
    title: "競合調査：多眼ウィグル・トイカメラ",
    desc: "国内外の競合・クラファン・OEMを調べ、狙うべき市場の空白を特定。",
    meta: "マーケティング調査",
    file: "docs/競合調査_ウィグルグラム・トイカメラ.md",
  },
];

const cache = {};

// ===== ナビ生成 =====
function buildNav() {
  const nav = document.getElementById("nav");
  let html = `<div class="nav-section">はじめに</div>`;
  html += `<a class="nav-link" data-id="home"><span class="ico">🏠</span><span>ホーム<span class="num">プロジェクト概要</span></span></a>`;
  html += `<div class="nav-section">ドキュメント（全${DOCS.length}件）</div>`;
  DOCS.forEach((d, i) => {
    html += `<a class="nav-link" data-id="${d.id}"><span class="ico">${d.icon}</span><span>${d.title}<span class="num">${d.num}</span></span></a>`;
  });
  nav.innerHTML = html;
  nav.querySelectorAll(".nav-link").forEach((el) => {
    el.addEventListener("click", () => {
      location.hash = el.dataset.id;
      closeNav();
    });
  });
}

function setActive(id) {
  document.querySelectorAll(".nav-link").forEach((el) => {
    el.classList.toggle("active", el.dataset.id === id);
  });
}

// ===== ホーム =====
function renderHome() {
  const cards = DOCS.map(
    (d) => `
    <a class="card" data-id="${d.id}">
      <div class="card-num">${d.num} · ${d.meta}</div>
      <div class="card-title">${d.icon} ${d.title}</div>
      <p class="card-desc">${d.desc}</p>
      <div class="card-go">開いて読む →</div>
    </a>`
  ).join("");

  return `
  <div class="hero">
    <div class="emoji">⏱️</div>
    <h1>TimeStopper</h1>
    <p class="tag">その瞬間の「時間を止める」、安くて小さい<br>デジタル多眼ウィグル・トイカメラ。</p>
    <div class="pills">
      <span class="pill">コンセプト確定</span>
      <span class="pill">第一市場：日本</span>
      <span class="pill">🐣 HIYOKOGUMI</span>
    </div>
  </div>

  <div class="lead">
    <p>横一列に並べた複数の小さなレンズで<strong>同時にシャッターを切り</strong>、撮れた数枚を <strong>0.5〜1秒で素早く連続再生</strong>。被写体は止まったまま視点だけが横にスッとずれる——「動く写真（ウィグルグラム）」を生み出すトイカメラです。</p>
    <p>撮った数枚はスマホアプリへ送られ、自動で <strong>位置合わせ → ウィグル化（GIF / 短尺動画） → SNS共有</strong> まで完結します。元ネタは映画『マトリックス』の<strong>バレットタイム</strong>を、手のひらサイズ・低価格にダウンスケールしたものです。</p>
  </div>

  <div class="home-h">📂 収録ドキュメント</div>
  <p style="color:var(--ink-soft);font-size:14px;margin:6px 0 0">それぞれ独立した1つのドキュメントです。カードまたは左メニューから開いてください。</p>
  <div class="cards">${cards}</div>

  <div class="home-foot">
    🐣 by HIYOKOGUMI（ひよこ組） — 小さく始めて、ちゃんと残す。<br>
    このサイトは TimeStopper のドキュメントを共有するために公開しています。
  </div>`;
}

// ===== ドキュメント表示 =====
async function loadDoc(doc) {
  if (cache[doc.id]) return cache[doc.id];
  const res = await fetch(doc.file);
  if (!res.ok) throw new Error("読み込み失敗: " + doc.file);
  let text = await res.text();
  cache[doc.id] = text;
  return text;
}

async function renderDoc(doc, index) {
  const content = document.getElementById("content");
  content.innerHTML = `<p style="color:var(--ink-soft)">読み込み中…</p>`;
  let md;
  try {
    md = await loadDoc(doc);
  } catch (e) {
    content.innerHTML = `<p>ドキュメントを読み込めませんでした。</p>`;
    return;
  }

  const bodyHtml = marked.parse(md);
  const next = DOCS[index + 1];
  const nextBtn = next
    ? `<a class="next" data-id="${next.id}">次のドキュメント：${next.icon} ${next.title} →</a>`
    : `<a class="next" data-id="home">🏠 ホームに戻る</a>`;

  content.innerHTML = `
    <div class="doc-banner">
      <div class="kicker">${doc.num} / 全${DOCS.length}件 · ${doc.meta}</div>
      <h1 class="dt">${doc.icon} ${doc.title}</h1>
      <p class="dd">${doc.desc}</p>
    </div>
    <div class="md">${bodyHtml}</div>
    <div class="doc-end">
      <div class="rule"><span class="badge">— 以上で「${doc.title}」は終わりです —</span></div>
      ${nextBtn}
    </div>`;

  // カード/ボタンのクリック委譲
  content.querySelectorAll("[data-id]").forEach((el) => {
    el.style.cursor = "pointer";
    el.addEventListener("click", () => (location.hash = el.dataset.id));
  });
}

function attachHomeLinks() {
  document.querySelectorAll("#content [data-id]").forEach((el) => {
    el.addEventListener("click", () => (location.hash = el.dataset.id));
  });
}

// ===== ルーティング =====
async function route() {
  const id = (location.hash || "#home").slice(1);
  const main = document.getElementById("main");
  const content = document.getElementById("content");

  if (id === "home" || id === "") {
    content.innerHTML = renderHome();
    attachHomeLinks();
    setActive("home");
  } else {
    const idx = DOCS.findIndex((d) => d.id === id);
    if (idx === -1) {
      location.hash = "home";
      return;
    }
    await renderDoc(DOCS[idx], idx);
    setActive(id);
  }
  main.scrollTop = 0;
  window.scrollTo(0, 0);
}

// ===== メニュー（モバイル） =====
function closeNav() { document.body.classList.remove("nav-open"); }
document.getElementById("menuToggle").addEventListener("click", () =>
  document.body.classList.toggle("nav-open")
);
document.getElementById("overlay").addEventListener("click", closeNav);

// ===== 起動 =====
buildNav();
window.addEventListener("hashchange", route);
route();
