const Exam = require('../models/questionModel');
const { parseDocx } = require('../utils/wordParser');
const { generateDocx } = require('../utils/docxGenerator');
const { v4: uuidv4 } = require('uuid');

let currentExam = new Exam();

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
  
  const { type, question, opt1, opt2, opt3, opt4, answer } = req.body;
  
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
      
      currentExam.mc.push({
        id: uuidv4(),
        question,
        options: [opt1, opt2, opt3, opt4],
        answer
      });
    } 
    else if (type === 'short') {
      if (currentExam.shortAnswer.length >= 10) {
        throw new Error('Maksimal 10 soal isian');
      }
      
      currentExam.shortAnswer.push({
        id: uuidv4(),
        question,
        answer
      });
    } 
    else if (type === 'essay') {
      if (currentExam.essay.length >= 10) {
        throw new Error('Maksimal 10 soal esai');
      }
      
      currentExam.essay.push({
        id: uuidv4(),
        question,
        answer
      });
    }
    
    req.flash('success', 'Soal berhasil ditambahkan!');
    
    // Kirim respons JSON untuk AJAX
    res.json({ 
      success: true,
      exam: currentExam,
      message: 'Soal berhasil ditambahkan!'
    });
  } catch (err) {
    console.error('Error adding question:', err);
    
    // Kirim respons error untuk AJAX
    res.status(400).json({
      success: false,
      message: err.message
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
    currentExam = examData;
    req.flash('success', 'Soal berhasil diimpor dari Word!');
    res.redirect('/');
  } catch (err) {
    console.error(err);
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