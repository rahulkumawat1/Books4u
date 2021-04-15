const express = require('express');
const custCntrls = require('../controllers/customer');
const shopCntrls = require('../controllers/shop');

const router = express.Router();

router.get('/cart', custCntrls.cart);
router.get('/cart/:id', custCntrls.addToCart);

router.get('/delete/:id', custCntrls.deleteItem);

router.get('/buy', custCntrls.getAddress);

router.get('/orders', custCntrls.getOrders);

router.get('/order-cancel/:id', custCntrls.orderCancel);

router.post('/handle_qty/:id', custCntrls.handleQty);
router.post('/address', custCntrls.postAddress);

module.exports = router;