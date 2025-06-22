const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // Adjust path if needed
const fs = require('fs');
const path = require('path');

const request = require('supertest');

chai.use(chaiHttp.default || chaiHttp);
const expect = chai.expect;

describe('Full API and UI Testing', function () {
  this.timeout(10000);

  it('should add a multiple choice question with images', (done) => {
    request(app)
      .post('/add')
      .field('type', 'mc')
      .field('question', 'What is the color of the sky?')
      .field('opt1', 'Red')
      .field('opt2', 'Blue')
      .field('opt3', 'Green')
      .field('opt4', 'Yellow')
      .field('answer', 'B')
      .field('questionImage', 'https://via.placeholder.com/150')
      .field('opt1Image', 'https://via.placeholder.com/100?text=A')
      .field('opt2Image', 'https://via.placeholder.com/100?text=B')
      .field('opt3Image', 'https://via.placeholder.com/100?text=C')
      .field('opt4Image', 'https://via.placeholder.com/100?text=D')
      .field('answerImage', 'https://via.placeholder.com/100?text=Answer')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('success', true);
        done();
      });
  });

  it('should reset all questions', (done) => {
    request(app)
      .post('/reset')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('success', true);
        done();
      });
  });

  it('should import questions from a docx file', (done) => {
    request(app)
      .post('/import')
      .attach('wordFile', fs.readFileSync(path.join(__dirname, 'sample.docx')), 'sample.docx')
      .end((err, res) => {
        expect(res).to.have.status(302); // Assuming redirect on success
        done();
      });
  });

  it('should export questions to a docx file', (done) => {
    request(app)
      .get('/export')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.have.header('content-type', /application\/vnd.openxmlformats-officedocument.wordprocessingml.document/);
        done();
      });
  });
});
