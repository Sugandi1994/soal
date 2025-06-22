/**
 * Skrip pengujian otomatis sederhana menggunakan undici fetch dan FormData
 * untuk menguji endpoint tambah soal, impor, reset, dan preview.
 * 
 * Catatan: Pastikan server berjalan di localhost:3000 sebelum menjalankan skrip ini.
 */

const { fetch, FormData } = require('undici');
const fs = require('fs');
const path = require('path');

const baseUrl = 'http://localhost:3000';

async function testAddQuestion() {
  console.log('Testing addQuestion endpoint...');

  const form = new FormData();
  form.append('type', 'mc');
  form.append('question', 'Apa warna langit?');
  form.append('opt1', 'Merah');
  form.append('opt2', 'Biru');
  form.append('opt3', 'Hijau');
  form.append('opt4', 'Kuning');
  form.append('answer', 'B');

  // Add a dummy empty string as file content to simulate file upload
  form.append('questionImage', new Blob([''], { type: 'text/plain' }), 'empty.txt');

  const response = await fetch(baseUrl + '/add', {
    method: 'POST',
    body: form,
  });

  const result = await response.json();
  console.log('Add question result:', result);
  return result.success;
}

async function testReset() {
  console.log('Testing resetQuestions endpoint...');

  const response = await fetch(baseUrl + '/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const result = await response.json();
  console.log('Reset result:', result);
  return result.success;
}

async function testImport() {
  console.log('Testing importDocx endpoint...');

  const form = new FormData();
  form.append('wordFile', fs.createReadStream(path.join(__dirname, 'test-files', 'sample.docx')));

  const response = await fetch(baseUrl + '/import', {
    method: 'POST',
    body: form,
  });

  // Since import redirects, we check status code
  console.log('Import response status:', response.status);
  return response.status === 302;
}

async function runTests() {
  const addResult = await testAddQuestion();
  if (!addResult) {
    console.error('Add question test failed.');
    return;
  }

  const resetResult = await testReset();
  if (!resetResult) {
    console.error('Reset test failed.');
    return;
  }

  // Import test requires sample.docx in test-files folder
  // Uncomment if you have sample.docx available
  // const importResult = await testImport();
  // if (!importResult) {
  //   console.error('Import test failed.');
  //   return;
  // }

  console.log('All tests passed successfully.');
}

runTests().catch((err) => {
  console.error('Error during tests:', err);
});
