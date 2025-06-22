const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataFilePath = path.join(__dirname, 'data.json');

function loadData() {
  if (fs.existsSync(dataFilePath)) {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return data ? JSON.parse(data) : { mc: [], shortAnswer: [], essay: [] };
  }
  return { mc: [], shortAnswer: [], essay: [] };
}

function saveData(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

function addSampleQuestion() {
  const examData = loadData();

  const newQuestion = {
    id: uuidv4(),
    question: "Contoh soal pilihan ganda dari terminal",
    options: ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
    answer: "A"
  };

  examData.mc.push(newQuestion);

  saveData(examData);

  console.log("Soal berhasil ditambahkan ke data.json:");
  console.log(newQuestion);
}

addSampleQuestion();
