const Product = require('../models/product');
const Order = require('../models/order');

exports.cart = (req, res, next) => {

    req.user
        .getCart()
        .then(cart => {
            // res.redirect('/');
            res.render('customer/cart', {pageTitle: 'cart', path: '/cart', products: cart.items, TtlPrice: cart.totalPrice});
        })
        .catch(err => console.log(err));
};

exports.addToCart = (req, res, next) => {
    const id = req.params.id;

    req.user
        .addToCart(id)
        .then(result => res.redirect('/'))
        .catch(err => console.log(err));
}

exports.deleteItem = (req, res, next) => {
    const id = req.params.id;

    req.user
        .deleteItem(id)
        .then(result => res.redirect('/cart'));
}

exports.getAddress = (req, res, next) => {
    req.user
        .getCart()
        .then(cart => {
            res.render('customer/address',{errorMessage: undefined, cart: cart});
        });
}

exports.postAddress = (req, res, next) => {
    const address = {};
    address.name = req.body.name;
    address.phone = req.body.phone;
    address.pincode = req.body.pincode;
    address.houseinfo = req.body.houseinfo;
    address.city = req.body.city;
    address.state = req.body.state;

    const order = new Order({order: {}, user: {}, status: 0});

    order
        .addToOrders(req.user, address)
        .then(result => res.redirect('/orders'));
}

exports.getOrders = (req, res, next) => {
 
    Order.find({'user.userId': req.user._id})
        .then(orders => {
            res.render('customer/orders', {pageTitle: 'orders', path: "/orders", orders: orders})
        });
}

exports.handleQty = (req, res, next) => {
    const qty = parseInt(req.body.qty);
    const id = req.params.id;
    req.user
        .handleQty(qty, id)
        .then(result => res.redirect('/cart'));
    
}

exports.orderCancel = (req, res, next) => {
    const id = req.params.id;
    Order.findByIdAndRemove(id)
        .then(result => res.redirect('/orders'));
    
}