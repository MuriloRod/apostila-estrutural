// ================================
// CONFIGURAÇÃO DA API GEMINI
// ================================
const GEMINI_API_KEY = 'AQ.Ab8RN6L4fqfQGpouX8i5O4u_Wz35CQ9AClakEyhg2ULvZikCkQ';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;
//                  👆 Removido o ?key= da URL

// ================================
// GERA QUIZ VIA GEMINI
// ================================
async function generateQuiz(topicId) {
  const quizArea = document.getElementById('quiz-' + topicId);
  const topicEl  = document.getElementById('topic-' + topicId);
  if (!quizArea || !topicEl) return;

  // Captura o texto do tópico
  const topicText = topicEl.innerText.substring(0, 3000);

  // Loading
  quizArea.innerHTML = `
    <div class="quiz-container">
      <div class="quiz-loading">
        <div class="spinner"></div>
        <p>Gerando perguntas com IA...</p>
      </div>
    </div>`;

  const prompt = `
Você é um professor universitário de Educação Física da USP (PEF).
Com base no texto abaixo, crie EXATAMENTE 5 perguntas de múltipla escolha.

REGRAS:
- Cada pergunta deve ter 4 alternativas (A, B, C, D)
- Apenas 1 alternativa correta
- As perguntas devem testar compreensão real, não memorização
- Retorne SOMENTE um JSON válido, sem texto extra, sem markdown

FORMATO JSON:
{
  "questions": [
    {
      "question": "Texto da pergunta?",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct": 0,
      "explanation": "Explicação breve da resposta correta."
    }
  ]
}

TEXTO DO TÓPICO:
${topicText}
`;

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY   // 👆 Chave enviada no header
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 2048 }
      })
    });

    if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Limpa possíveis markdown blocks
    const jsonText = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(jsonText);

    renderQuiz(quizArea, parsed.questions);

  } catch (err) {
    console.error('Erro ao gerar quiz:', err);
    quizArea.innerHTML = `
      <div class="quiz-container">
        <p style="color:#c62828; font-family:var(--font-ui); font-size:0.875rem;">
          ⚠️ Não foi possível gerar o quiz. Verifique sua chave de API e tente novamente.
        </p>
      </div>`;
  }
}

// ================================
// RENDERIZA O QUIZ NA TELA
// ================================
function renderQuiz(container, questions) {
  const html = `
    <div class="quiz-container" id="quizBox">
      <div class="quiz-title">🧠 Quiz do Tópico</div>
      ${questions.map((q, qi) => `
        <div class="quiz-question" id="question-${qi}">
          <p>${qi + 1}. ${q.question}</p>
          <ul class="quiz-options">
            ${q.options.map((opt, oi) => `
              <li>
                <button onclick="answerQuestion(${qi}, ${oi}, ${q.correct}, '${escapeJs(q.explanation)}', ${questions.length})">
                  ${opt}
                </button>
              </li>
            `).join('')}
          </ul>
          <div class="quiz-feedback" id="feedback-${qi}" style="display:none;"></div>
        </div>
      `).join('')}
      <div class="quiz-score" id="quizScore" style="display:none;"></div>
    </div>`;

  container.innerHTML = html;

  // Variáveis globais do quiz atual
  window._quizState = { score: 0, answered: 0, total: questions.length };
}

function answerQuestion(qi, selected, correct, explanation, total) {
  const qEl = document.getElementById(`question-${qi}`);
  if (!qEl) return;

  const buttons = qEl.querySelectorAll('.quiz-options button');
  const feedback = document.getElementById(`feedback-${qi}`);

  // Desabilita todos os botões
  buttons.forEach(b => b.disabled = true);

  const isCorrect = selected === correct;

  buttons[selected].classList.add(isCorrect ? 'correct' : 'wrong');
  if (!isCorrect) buttons[correct].classList.add('correct');

  feedback.style.display = 'block';
  feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'wrong'}`;
  feedback.textContent = isCorrect
    ? `✅ Correto! ${explanation}`
    : `❌ Incorreto. ${explanation}`;

  // Atualiza estado
  if (isCorrect) window._quizState.score++;
  window._quizState.answered++;

  // Mostra score final
  if (window._quizState.answered === window._quizState.total) {
    showFinalScore();
  }
}

function showFinalScore() {
  const { score, total } = window._quizState;
  const pct = Math.round((score / total) * 100);
  const emoji = pct === 100 ? '🏆' : pct >= 60 ? '👍' : '📚';
  const msg   = pct === 100
    ? 'Excelente! Você domina este tópico!'
    : pct >= 60
    ? 'Bom trabalho! Continue estudando para fixar o conteúdo.'
    : 'Revise o tópico e tente novamente!';

  const scoreEl = document.getElementById('quizScore');
  if (scoreEl) {
    scoreEl.style.display = 'block';
    scoreEl.innerHTML = `
      <h4>${emoji} ${score} de ${total} corretas — ${pct}%</h4>
      <p>${msg}</p>`;
  }
}

function escapeJs(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, ' ');
}

