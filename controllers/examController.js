const Exam = require('../models/questionModel');
const { parseDocx } = require('../utils/wordParser');
const { generateDocx } = require('../utils/docxGenerator');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const dataFilePath = path.join(__dirname, '../data.json');

const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

let currentExam = new Exam();

// Fungsi untuk load data dari file JSON
function loadData() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf-8');
      if (data) {
        currentExam = Object.assign(new Exam(), JSON.parse(data));
      }
    }
  } catch (err) {
    console.error('Error loading data:', err);
  }
}

// Fungsi untuk simpan data ke file JSON
function saveData() {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(currentExam, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving data:', err);
  }
}

// Load data saat modul di-load
loadData();

exports.showForm = (req, res) => {
  const errors = req.flash('error');
  const success = req.flash('success');
  
  res.render('exam-form', { 
    exam: currentExam,
    errors: errors,
    success: success
  });
};

exports.addQuestion = (req, res) => {
  console.log('Received form data:', req.body);
  console.log('Files:', req.files);
  console.log('Headers:', req.headers);
  console.log('Request method:', req.method);
  console.log('Request URL:', req.originalUrl);

  const { type, question, opt1, opt2, opt3, opt4, answer } = req.body;

  // Safely handle req.files possibly being null
  const files = req.files || {};

  try {
    if (!question || !answer) {
      throw new Error('Pertanyaan dan jawaban harus diisi');
    }

    if (type === 'mc') {
      if (currentExam.mc.length >= 50) {
        throw new Error('Maksimal 50 soal pilihan ganda');
      }

      if (!opt1 || !opt2 || !opt3 || !opt4) {
        throw new Error('Semua opsi harus diisi untuk soal pilihan ganda');
      }

      // Accept image URL from body if no file uploaded
      const questionImage = files['questionImage'] && files['questionImage'][0]
        ? '/uploads/' + files['questionImage'][0].filename
        : (req.body.questionImage || null);

      const opt1Image = files['opt1Image'] && files['opt1Image'][0]
        ? '/uploads/' + files['opt1Image'][0].filename
        : (req.body.opt1Image || null);

      const opt2Image = files['opt2Image'] && files['opt2Image'][0]
        ? '/uploads/' + files['opt2Image'][0].filename
        : (req.body.opt2Image || null);

      const opt3Image = files['opt3Image'] && files['opt3Image'][0]
        ? '/uploads/' + files['opt3Image'][0].filename
        : (req.body.opt3Image || null);

      const opt4Image = files['opt4Image'] && files['opt4Image'][0]
        ? '/uploads/' + files['opt4Image'][0].filename
        : (req.body.opt4Image || null);

      currentExam.mc.push({
        id: uuidv4(),
        question,
        questionImage,
        options: [
          { text: opt1, image: opt1Image },
          { text: opt2, image: opt2Image },
          { text: opt3, image: opt3Image },
          { text: opt4, image: opt4Image },
        ],
        answer,
      });
    } else if (type === 'short') {
      if (currentExam.shortAnswer.length >= 10) {
        throw new Error('Maksimal 10 soal isian');
      }

      const questionImage = files['questionImage'] && files['questionImage'][0]
        ? '/uploads/' + files['questionImage'][0].filename
        : (req.body.questionImage || null);

      const answerImage = files['answerImage'] && files['answerImage'][0]
        ? '/uploads/' + files['answerImage'][0].filename
        : (req.body.answerImage || null);

      currentExam.shortAnswer.push({
        id: uuidv4(),
        question,
        questionImage,
        answer,
        answerImage,
      });
    } else if (type === 'essay') {
      if (currentExam.essay.length >= 10) {
        throw new Error('Maksimal 10 soal esai');
      }

      const questionImage = files['questionImage'] && files['questionImage'][0]
        ? '/uploads/' + files['questionImage'][0].filename
        : (req.body.questionImage || null);

      const answerImage = files['answerImage'] && files['answerImage'][0]
        ? '/uploads/' + files['answerImage'][0].filename
        : (req.body.answerImage || null);

      currentExam.essay.push({
        id: uuidv4(),
        question,
        questionImage,
        answer,
        answerImage,
      });
    }

    saveData();

    req.flash('success', 'Soal berhasil ditambahkan!');

    // Kirim respons JSON untuk AJAX
    res.json({
      success: true,
      exam: currentExam,
      message: 'Soal berhasil ditambahkan!',
    });
  } catch (err) {
    console.error('Error adding question:', err);
    console.error('Stack trace:', err.stack);

    // Kirim respons error untuk AJAX
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.resetQuestions = (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const uploadDir = path.join(__dirname, '../public/uploads');

    // Delete all files in uploads folder
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      for (const file of files) {
        const filePath = path.join(uploadDir, file);
        fs.unlinkSync(filePath);
      }
    }

    currentExam = new Exam();
    saveData();
    req.flash('success', 'Soal berhasil direset!');
    res.json({
      success: true,
      exam: currentExam,
      message: 'Soal berhasil direset!'
    });
  } catch (err) {
    console.error('Error resetting questions:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal mereset soal'
    });
  }
};

exports.importDocx = async (req, res) => {
  if (!req.file) {
    req.flash('error', 'Tidak ada file yang diunggah');
    return res.redirect('/');
  }

  try {
    const examData = await parseDocx(req.file.buffer);

    // Validasi hasil parsing
    if (
      !examData ||
      !Array.isArray(examData.mc) ||
      !Array.isArray(examData.shortAnswer) ||
      !Array.isArray(examData.essay)
    ) {
      throw new Error('Format file tidak sesuai atau tidak ada soal yang ditemukan');
    }

    currentExam = examData;
    saveData();
    req.flash('success', 'Soal berhasil diimpor dari Word!');
    res.redirect('/');
  } catch (err) {
    console.error('Error saat impor file:', err);
    console.error('Stack trace:', err.stack);
    req.flash('error', 'Gagal mengimpor file: ' + err.message);
    res.redirect('/');
  }
};

exports.exportDocx = async (req, res) => {
  try {
    const buffer = await generateDocx(currentExam);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=soal-ujian.docx');
    res.end(buffer);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal mengekspor soal: ' + err.message);
    res.redirect('/');
  }
};
