const express = require('express');
const adminCntrls = require('../controllers/admin');

const router = express.Router();

router.get('/home', adminCntrls.showProducts);

router.get('/add-product', adminCntrls.getAddProduct);

router.post('/add-product', adminCntrls.postAddProduct);

router.get('/edit-product/:id', adminCntrls.getEditProduct);

router.post('/edit-product/:id', adminCntrls.postEditProduct);

router.get('/delete-product/:id', adminCntrls.deleteProduct);

router.post('/requests/:id', adminCntrls.postRequests);
router.get('/requests', adminCntrls.getRequests);

module.exports = router;