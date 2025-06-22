const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } = require('docx');

async function generateDocx(exam) {
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          text: "SOAL UJIAN",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        ...generateMcQuestions(exam.mc),
        ...generateShortQuestions(exam.shortAnswer),
        ...generateEssayQuestions(exam.essay)
      ]
    }]
  });

  return Packer.toBuffer(doc);
}

function generateMcQuestions(questions) {
  const elements = [];
  
  if (questions.length > 0) {
    elements.push(
      new Paragraph({
        text: "A. Soal Pilihan Ganda",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      })
    );
    
    questions.forEach((q, i) => {
      elements.push(
        new Paragraph({
          text: `${i + 1}. ${q.question}`,
          spacing: { after: 100 }
        })
      );
      
      q.options.forEach((opt, j) => {
        const optionText = typeof opt === 'object' && opt !== null ? opt.text : opt;
        elements.push(
          new Paragraph({
            text: `${String.fromCharCode(65 + j)}. ${optionText}`,
            indent: { left: 400 }
          })
        );
      });
      
      elements.push(
        new Paragraph({
          text: `Jawaban: ${q.answer}`,
          spacing: { before: 100, after: 200 }
        })
      );
    });
  }
  
  return elements;
}

function generateShortQuestions(questions) {
  const elements = [];
  
  if (questions.length > 0) {
    elements.push(
      new Paragraph({
        text: "B. Soal Isian Singkat",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      })
    );
    
    questions.forEach((q, i) => {
      elements.push(
        new Paragraph({
          text: `${i + 1}. ${q.question}`,
          spacing: { after: 100 }
        })
      );
      
      elements.push(
        new Paragraph({
          text: `Jawaban: ${q.answer}`,
          spacing: { before: 100, after: 200 }
        })
      );
    });
  }
  
  return elements;
}

function generateEssayQuestions(questions) {
  const elements = [];
  
  if (questions.length > 0) {
    elements.push(
      new Paragraph({
        text: "C. Soal Esai",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      })
    );
    
    questions.forEach((q, i) => {
      elements.push(
        new Paragraph({
          text: `${i + 1}. ${q.question}`,
          spacing: { after: 100 }
        })
      );
      
      elements.push(
        new Paragraph({
          text: `Jawaban: ${q.answer}`,
          spacing: { before: 100, after: 200 }
        })
      );
    });
  }
  
  return elements;
}

module.exports = { generateDocx };