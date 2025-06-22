const mammoth = require('mammoth');

async function parseDocx(buffer) {
  const { value } = await mammoth.extractRawText({ buffer });
  return parseText(value);
}

function parseText(text) {
  const exam = {
    mc: [],
    shortAnswer: [],
    essay: []
  };

  const lines = text.split('\n');
  let currentType = null;
  let currentQuestion = null;
  let questionCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Deteksi tipe soal
    if (trimmed.startsWith('[MC]')) {
      currentType = 'mc';
      currentQuestion = {
        id: `mc-${Date.now()}-${questionCount++}`,
        question: trimmed.substring(4).trim(),
        options: [],
        answer: ''
      };
    } else if (trimmed.startsWith('[SHORT]')) {
      currentType = 'short';
      currentQuestion = {
        id: `short-${Date.now()}-${questionCount++}`,
        question: trimmed.substring(7).trim(),
        answer: ''
      };
    } else if (trimmed.startsWith('[ESSAY]')) {
      currentType = 'essay';
      currentQuestion = {
        id: `essay-${Date.now()}-${questionCount++}`,
        question: trimmed.substring(7).trim(),
        answer: ''
      };
    }
    // Deteksi opsi jawaban untuk pilihan ganda
    else if (/^[A-D]\.\s/.test(trimmed)) {
      if (currentQuestion && currentType === 'mc') {
        const optionText = trimmed.substring(2).trim();
        currentQuestion.options.push(optionText);
      }
    }
    // Deteksi jawaban
    else if (trimmed.startsWith('Jawaban:')) {
      if (currentQuestion) {
        currentQuestion.answer = trimmed.substring(8).trim();
        
        // Simpan ke koleksi yang sesuai
        if (currentType === 'mc') exam.mc.push(currentQuestion);
        else if (currentType === 'short') exam.shortAnswer.push(currentQuestion);
        else if (currentType === 'essay') exam.essay.push(currentQuestion);
        
        currentQuestion = null;
      }
    }
    // Jika tidak ada kode, tambahkan ke pertanyaan
    else if (currentQuestion) {
      currentQuestion.question += '\n' + trimmed;
    }
  }

  return exam;
}

module.exports = { parseDocx };