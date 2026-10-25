// Әліппе тренажёрі — таза JavaScript, фреймворксіз.

const state = {
  letters: [],
  activeLetter: null,
};

const audioCache = new Map(); // id -> HTMLAudioElement
const audioStatus = new Map(); // id -> "ok" | "missing" (белгілі болғаннан кейін)

const letterGridEl = document.getElementById("letter-grid");
const overlayEl = document.getElementById("overlay");
const cardDetailEl = document.getElementById("card-detail");
const detailLetterEl = document.getElementById("detail-letter");
const wordsGridEl = document.getElementById("words-grid");
const replayBtn = document.getElementById("replay-btn");
const closeBtn = document.getElementById("close-btn");

init();

async function init() {
  try {
    const res = await fetch("/data/content.json");
    state.letters = await res.json();
  } catch (err) {
    letterGridEl.innerHTML = `<p style="grid-column:1/-1;text-align:center">Мазмұнды жүктеу мүмкін болмады 😕</p>`;
    console.error(err);
    return;
  }

  renderLetterGrid();
  bindGlobalEvents();
}

function renderLetterGrid() {
  letterGridEl.innerHTML = "";
  for (const letter of state.letters) {
    const btn = document.createElement("button");
    btn.className = "letter-card";
    btn.type = "button";
    btn.setAttribute("aria-label", `${letter.text} әрпі`);
    btn.innerHTML = `
      <span>${letter.text}</span>
      <span class="mini-emoji">${letter.emoji ?? ""}</span>
    `;
    btn.addEventListener("click", () => openLetter(letter));
    letterGridEl.appendChild(btn);
  }
}

function openLetter(letter) {
  state.activeLetter = letter;
  detailLetterEl.textContent = letter.text;
  renderWordsGrid(letter.words ?? []);

  overlayEl.hidden = false;

  // Ашылған карточканың дыбыстарын алдын ала жүктеу (кідіріссіз ойнау үшін).
  preloadAudio(letter.id);
  for (const word of letter.words ?? []) preloadAudio(word.id);

  // Карточка ашылысымен әріпті дереу дыбыстап жіберу.
  playSound(letter.id);
}

function renderWordsGrid(words) {
  wordsGridEl.innerHTML = "";
  for (const word of words) {
    const btn = document.createElement("button");
    btn.className = "word-card";
    btn.type = "button";
    btn.dataset.id = word.id;
    btn.innerHTML = `
      <span class="word-emoji">${word.emoji ?? "🔤"}</span>
      <span class="word-text">${word.text}</span>
      <span class="word-sound">🔊</span>
    `;
    btn.addEventListener("click", () => playSound(word.id, btn));
    wordsGridEl.appendChild(btn);
  }
}

function closeOverlay() {
  overlayEl.hidden = true;
  state.activeLetter = null;
}

function bindGlobalEvents() {
  closeBtn.addEventListener("click", closeOverlay);

  overlayEl.addEventListener("click", (e) => {
    if (e.target === overlayEl) closeOverlay();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlayEl.hidden) closeOverlay();
  });

  replayBtn.addEventListener("click", () => {
    if (state.activeLetter) playSound(state.activeLetter.id);
  });
}

function getAudio(id) {
  let audio = audioCache.get(id);
  if (!audio) {
    audio = new Audio(`/audio/${id}.mp3`);
    audio.preload = "auto";
    audio.addEventListener("error", () => audioStatus.set(id, "missing"));
    audioCache.set(id, audio);
  }
  return audio;
}

function preloadAudio(id) {
  const audio = getAudio(id);
  try {
    audio.load();
  } catch {
    // Дыбыс жоқ болса да қолданба бұзылмайды.
  }
}

function playSound(id, cardEl) {
  // Егер дыбыс файлы жоқ екені бұрын анықталса, тырысып та қажеті жоқ.
  if (audioStatus.get(id) === "missing") {
    cardEl?.classList.add("no-audio");
    return;
  }

  const audio = getAudio(id);
  audio.currentTime = 0;

  cardEl?.classList.add("playing");
  audio.onended = () => cardEl?.classList.remove("playing");

  audio.play().catch(() => {
    // Файл табылмаса немесе ойнату қатесі болса — карточка бұзылмайды.
    audioStatus.set(id, "missing");
    cardEl?.classList.remove("playing");
    cardEl?.classList.add("no-audio");
  });
}
