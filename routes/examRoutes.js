const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extMatch = file.originalname.match(/\\.[0-9a-z]+$/i);
    const ext = extMatch ? extMatch[0] : '';
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

router.get('/', examController.showForm);

router.post('/add', upload.fields([
  { name: 'questionImage', maxCount: 1 },
  { name: 'opt1Image', maxCount: 1 },
  { name: 'opt2Image', maxCount: 1 },
  { name: 'opt3Image', maxCount: 1 },
  { name: 'opt4Image', maxCount: 1 },
  { name: 'answerImage', maxCount: 1 }
]), examController.addQuestion);

router.post('/import', upload.single('wordFile'), examController.importDocx);
router.get('/export', examController.exportDocx);
router.post('/reset', examController.resetQuestions);

module.exports = router;
