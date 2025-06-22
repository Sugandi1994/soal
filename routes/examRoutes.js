const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const multer = require('multer');
const upload = multer();

router.get('/', examController.showForm);
router.post('/add', examController.addQuestion);
router.post('/import', upload.single('wordFile'), examController.importDocx);
router.get('/export', examController.exportDocx);

module.exports = router;