// ================================
// CONFIGURAÇÃO DOS CAPÍTULOS
// Edite aqui para adicionar capítulos e tópicos
// ================================
const CHAPTERS = [
  {
    id: 1,
    title: "Título do Capítulo 1",
    desc: "Descrição breve do capítulo 1.",
    file: "cap1.html",
    topics: ["cap1-1", "cap1-2", "cap1-3"]
  },
  {
    id: 2,
    title: "Título do Capítulo 2",
    desc: "Descrição breve do capítulo 2.",
    file: "cap2.html",
    topics: ["cap2-1", "cap2-2", "cap2-3"]
  },
  {
    id: 3,
    title: "Título do Capítulo 3",
    desc: "Descrição breve do capítulo 3.",
    file: "cap3.html",
    topics: ["cap3-1", "cap3-2"]
  },
  {
    id: 4,
    title: "Título do Capítulo 4",
    desc: "Descrição breve do capítulo 4.",
    file: "cap4.html",
    topics: ["cap4-1", "cap4-2", "cap4-3"]
  },
  {
    id: 5,
    title: "Título do Capítulo 5",
    desc: "Descrição breve do capítulo 5.",
    file: "cap5.html",
    topics: ["cap5-1", "cap5-2"]
  },
  {
    id: 6,
    title: "Título do Capítulo 6",
    desc: "Descrição breve do capítulo 6.",
    file: "cap6.html",
    topics: ["cap6-1", "cap6-2", "cap6-3"]
  }
];

// ================================
// PROGRESSO — localStorage
// ================================
function getProgress() {
  return JSON.parse(localStorage.getItem('pef-progress') || '{}');
}

function saveProgress(data) {
  localStorage.setItem('pef-progress', JSON.stringify(data));
}

function isTopicDone(topicId) {
  return !!getProgress()[topicId];
}

function toggleTopic(topicId, btn) {
  const progress = getProgress();
  const done = !!progress[topicId];

  if (done) {
    delete progress[topicId];
  } else {
    progress[topicId] = true;
  }

  saveProgress(progress);
  updateTopicUI(topicId, btn, !done);
  updateAllProgressBars();

  // Mostrar botão de quiz ao concluir
  const topicEl = document.getElementById('topic-' + topicId);
  if (topicEl) {
    const quizBtn = topicEl.querySelector('.btn-quiz');
    if (quizBtn) quizBtn.style.display = !done ? 'inline-flex' : 'none';
    topicEl.classList.toggle('completed', !done);
  }
}

function updateTopicUI(topicId, btn, done) {
  if (!btn) {
    const topicEl = document.getElementById('topic-' + topicId);
    if (topicEl) btn = topicEl.querySelector('.btn-complete');
  }
  if (!btn) return;

  if (done) {
    btn.textContent = '✅ Concluído';
    btn.classList.add('done');
  } else {
    btn.textContent = '✅ Marcar como Concluído';
    btn.classList.remove('done');
  }
}

// ================================
// CÁLCULO DE PROGRESSO
// ================================
function getAllTopics() {
  return CHAPTERS.flatMap(c => c.topics);
}

function getGlobalStats() {
  const progress = getProgress();
  const all = getAllTopics();
  const done = all.filter(t => progress[t]).length;
  return { total: all.length, done, pct: all.length ? Math.round((done / all.length) * 100) : 0 };
}

function getChapterStats(chapter) {
  const progress = getProgress();
  const done = chapter.topics.filter(t => progress[t]).length;
  const pct = chapter.topics.length ? Math.round((done / chapter.topics.length) * 100) : 0;
  return { total: chapter.topics.length, done, pct };
}

// ================================
// ATUALIZA TODAS AS BARRAS
// ================================
function updateAllProgressBars() {
  const { total, done, pct } = getGlobalStats();

  // Barra global
  ['globalProgressBar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.width = pct + '%';
  });

  ['globalProgressPercent'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = pct + '%';
  });

  ['globalProgressLabel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = `${done} de ${total} tópicos concluídos`;
  });

  // Itens individuais na home
  CHAPTERS.forEach(ch => {
    const stats = getChapterStats(ch);
    const barEl = document.getElementById(`chBar-${ch.id}`);
    const pctEl = document.getElementById(`chPct-${ch.id}`);
    const iconEl = document.getElementById(`chIcon-${ch.id}`);
    if (barEl) barEl.style.width = stats.pct + '%';
    if (pctEl) pctEl.textContent = stats.pct + '%';
    if (iconEl) iconEl.textContent = stats.pct === 100 ? '✅' : stats.pct > 0 ? '📖' : '○';
  });
}

// ================================
// RENDERIZA ELEMENTOS NA HOME
// ================================
function renderHome() {
  // Sumário
  const grid = document.getElementById('chaptersGrid');
  if (grid) {
    grid.innerHTML = CHAPTERS.map(ch => {
      const stats = getChapterStats(ch);
      return `
        <a href="${ch.file}" class="chapter-card">
          <div class="chapter-card-num">Capítulo ${ch.id}</div>
          <div class="chapter-card-title">${ch.title}</div>
          <div class="chapter-card-desc">${ch.desc}</div>
        </a>`;
    }).join('');
  }

  // Dashboard de progresso
  const dashboard = document.getElementById('chaptersProgress');
  if (dashboard) {
    dashboard.innerHTML = CHAPTERS.map(ch => {
      const stats = getChapterStats(ch);
      return `
        <div class="chapter-progress-item">
          <a href="${ch.file}">Capítulo ${ch.id}</a>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" id="chBar-${ch.id}"></div>
          </div>
          <span class="chapter-pct" id="chPct-${ch.id}">0%</span>
          <span class="chapter-icon" id="chIcon-${ch.id}">○</span>
        </div>`;
    }).join('');
  }
}

// ================================
// RENDERIZA SIDEBAR DO CAPÍTULO
// ================================
function renderSidebar() {
  const list = document.getElementById('sidebarChapterList');
  if (!list) return;

  const currentFile = location.pathname.split('/').pop() || 'index.html';

  list.innerHTML = CHAPTERS.map(ch => {
    const stats = getChapterStats(ch);
    const isActive = ch.file === currentFile;
    const icon = stats.pct === 100 ? '✅' : stats.pct > 0 ? '📖' : '○';
    return `
      <li>
        <a href="${ch.file}" class="${isActive ? 'active' : ''}">
          <span>Cap. ${ch.id} — ${ch.title}</span>
          <span class="chapter-status">${icon}</span>
        </a>
      </li>`;
  }).join('');
}

// ================================
// BARRA DE LEITURA DA PÁGINA
// ================================
function initReadingBar() {
  const bar = document.getElementById('readingBar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (docH > 0 ? (scrollTop / docH) * 100 : 0) + '%';
  });
}

// ================================
// INICIALIZAÇÃO
// ================================
document.addEventListener('DOMContentLoaded', () => {
  renderHome();
  renderSidebar();
  updateAllProgressBars();
  initReadingBar();

  // Restaura estado dos tópicos na página
  const topics = document.querySelectorAll('.topic');
  topics.forEach(topic => {
    const id = topic.dataset.topicId;
    if (id && isTopicDone(id)) {
      topic.classList.add('completed');
      const btn = topic.querySelector('.btn-complete');
      if (btn) { btn.textContent = '✅ Concluído'; btn.classList.add('done'); }
      const quizBtn = topic.querySelector('.btn-quiz');
      if (quizBtn) quizBtn.style.display = 'inline-flex';
    }
  });
});
