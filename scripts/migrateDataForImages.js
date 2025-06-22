const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '../data.json');

function migrateData() {
  if (!fs.existsSync(dataFilePath)) {
    console.error('data.json not found');
    return;
  }

  const rawData = fs.readFileSync(dataFilePath, 'utf-8');
  let data;
  try {
    data = JSON.parse(rawData);
  } catch (err) {
    console.error('Error parsing data.json:', err);
    return;
  }

  // Migrate mc questions
  if (Array.isArray(data.mc)) {
    data.mc = data.mc.map((q) => {
      if (!q.questionImage) q.questionImage = null;
      if (Array.isArray(q.options)) {
        q.options = q.options.map((opt) => {
          if (typeof opt === 'string') {
            return { text: opt, image: null };
          } else {
            if (!opt.image) opt.image = null;
            if (!opt.text) opt.text = '';
            return opt;
          }
        });
      } else {
        q.options = [];
      }
      return q;
    });
  } else {
    data.mc = [];
  }

  // Migrate shortAnswer questions
  if (Array.isArray(data.shortAnswer)) {
    data.shortAnswer = data.shortAnswer.map((q) => {
      if (!q.questionImage) q.questionImage = null;
      if (!q.answerImage) q.answerImage = null;
      return q;
    });
  } else {
    data.shortAnswer = [];
  }

  // Migrate essay questions
  if (Array.isArray(data.essay)) {
    data.essay = data.essay.map((q) => {
      if (!q.questionImage) q.questionImage = null;
      if (!q.answerImage) q.answerImage = null;
      return q;
    });
  } else {
    data.essay = [];
  }

  // Write back migrated data
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('Data migration completed successfully.');
  } catch (err) {
    console.error('Error writing migrated data:', err);
  }
}

migrateData();
