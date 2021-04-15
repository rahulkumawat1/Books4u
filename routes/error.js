const router = require('express').Router();
const errorController = require('../controllers/404');

router.use(errorController);

module.exports = router;