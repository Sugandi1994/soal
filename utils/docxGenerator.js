const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, ImageRun } = require('docx');
const fs = require('fs');
const path = require('path');

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
        ...await generateMcQuestions(exam.mc),
        ...await generateShortQuestions(exam.shortAnswer),
        ...await generateEssayQuestions(exam.essay)
      ]
    }]
  });

  return Packer.toBuffer(doc);
}

async function generateMcQuestions(questions) {
  const elements = [];
  
  if (questions.length > 0) {
    elements.push(
      new Paragraph({
        text: "A. Soal Pilihan Ganda",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      })
    );
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      elements.push(
        new Paragraph({
          text: `${i + 1}. ${q.question}`,
          spacing: { after: 100 }
        })
      );
      if (q.questionImage) {
        const img = await loadImage(q.questionImage);
        if (img) {
          elements.push(new Paragraph({
            children: [img],
            spacing: { after: 100 }
          }));
        }
      }
      
      for (let j = 0; j < q.options.length; j++) {
        const opt = q.options[j];
        const optionText = typeof opt === 'object' && opt !== null ? opt.text : opt;
        const children = [new TextRun(`${String.fromCharCode(65 + j)}. ${optionText}`)];
        if (typeof opt === 'object' && opt !== null && opt.image) {
          const img = await loadImage(opt.image);
          if (img) {
            children.push(new Paragraph({ children: [img], indent: { left: 400 }, spacing: { after: 100 } }));
          }
        }
        elements.push(
          new Paragraph({
            children: children,
            indent: { left: 400 }
          })
        );
      }
      
      elements.push(
        new Paragraph({
          text: `Jawaban: ${q.answer}`,
          spacing: { before: 100, after: 200 }
        })
      );
    }
  }
  
  return elements;
}

async function generateShortQuestions(questions) {
  const elements = [];
  
  if (questions.length > 0) {
    elements.push(
      new Paragraph({
        text: "B. Soal Isian Singkat",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      })
    );
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      elements.push(
        new Paragraph({
          text: `${i + 1}. ${q.question}`,
          spacing: { after: 100 }
        })
      );
      if (q.questionImage) {
        const img = await loadImage(q.questionImage);
        if (img) {
          elements.push(new Paragraph({
            children: [img],
            spacing: { after: 100 }
          }));
        }
      }
      
      elements.push(
        new Paragraph({
          text: `Jawaban: ${q.answer}`,
          spacing: { before: 100, after: 200 }
        })
      );
      if (q.answerImage) {
        const img = await loadImage(q.answerImage);
        if (img) {
          elements.push(new Paragraph({
            children: [img],
            spacing: { after: 100 }
          }));
        }
      }
    }
  }
  
  return elements;
}

async function generateEssayQuestions(questions) {
  const elements = [];
  
  if (questions.length > 0) {
    elements.push(
      new Paragraph({
        text: "C. Soal Esai",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      })
    );
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      elements.push(
        new Paragraph({
          text: `${i + 1}. ${q.question}`,
          spacing: { after: 100 }
        })
      );
      if (q.questionImage) {
        const img = await loadImage(q.questionImage);
        if (img) {
          elements.push(new Paragraph({
            children: [img],
            spacing: { after: 100 }
          }));
        }
      }
      
      elements.push(
        new Paragraph({
          text: `Jawaban: ${q.answer}`,
          spacing: { before: 100, after: 200 }
        })
      );
      if (q.answerImage) {
        const img = await loadImage(q.answerImage);
        if (img) {
          elements.push(new Paragraph({
            children: [img],
            spacing: { after: 100 }
          }));
        }
      }
    }
  }
  
  return elements;
}

async function loadImage(imagePath) {
  try {
    // imagePath is expected to be like '/uploads/filename.ext'
    const filePath = path.join(__dirname, '..', 'public', imagePath);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const imageBuffer = fs.readFileSync(filePath);
    return new ImageRun({
      data: imageBuffer,
      transformation: {
        width: 300,
        height: 200,
      },
    });
  } catch (err) {
    console.error('Error loading image for docx:', err);
    return null;
  }
}

module.exports = { generateDocx };
