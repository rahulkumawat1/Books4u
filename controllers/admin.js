const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

// const transporter = nodemailer.createTransport(sendgridTransport({
//     auth: {
//         api_key: process.env.SENDGRID_API
//     }
// }))

exports.showProducts = (req, res, next) => {

    Product.find()
        .then(products => {
            res.render('home', {pageTitle: 'shop', path: "/admin/home", products: products});
        });

}

exports.getAddProduct = (req, res, next) => {
    res.render('admin/add-product', {pageTitle: 'add-product'});
};

exports.postAddProduct = (req, res, next) => {
    // parse info and save
    const product = new Product({
        title: req.body.title,
        author: req.body.author,
        url: req.body.img_url,
        desc: req.body.desc,
        price: req.body.price,
        userId: req.user._id
    });
    
    product
        .save()
        .then(result => {
            res.redirect('/admin/home');
        })
        .catch(err => console.log(err));
    
};

exports.getEditProduct = (req, res, next) => {
    const id = req.params.id;

    Product.findById(id)
        .then(product => {
            res.render('admin/edit-product.ejs', {pageTitle: 'Edit Product', product: product})
        })
        .catch(err => console.log(err))
}

exports.postEditProduct = (req, res, next) => {
    const id = req.params.id;

    Product.findById(id)
        .then(product => {
            product.title = req.body.title;
            product.author = req.body.author;
            product.url = req.body.img_url;
            product.desc = req.body.desc;
            product.price = req.body.price;

            return product.save();
        })
        .then(result => {
            res.redirect('/admin/home');
        })
}

exports.deleteProduct = (req, res, next) => {
    const id = req.params.id;

    Product.findByIdAndRemove(id)
        .then(result => res.redirect('/admin/home'))
        .catch(err => console.log("[controllers/admin.js]:", err));
}

exports.getRequests = (req, res, next) => {
    Order.find({status: {$ne: 4}})
        .then(orders => {
            res.render('customer/orders', {pageTitle: 'orders', path: "/admin/requests", orders: orders})
        })
}

exports.postRequests = (req, res, next) => {
    const orderId = req.params.id;
    const status = req.body.status;
    let userId;
    let price;

    Order.findById(orderId)
        .then(order => {
            userId = order.user.userId;
            price = order.order.totalPrice;
            order.status = parseInt(status);
            return order.save();
        })
        .then(result => {
            res.redirect('/admin/requests')
            // if(status == 3){
            //     User.findById(userId)
            //         .then(user => {
            //             transporter.sendMail({
            //                 to: user.email,
            //                 from: 'rahulkumawat96108@gmail.com',
            //                 subject: 'Product arriving by 9pm today.',
            //                 html: `
            //                     <h2>Hello, your product will be delivered by 9pm, today.</h2>
            //                     <p>orderId: ${orderId}</p>
            //                     <h3>Total amount to pay on delivery - ${price} rupees.</h3>
            //                     <p>Thank you.</p>
            //                   `
            //             });
            //         })
            // }
        })
        .catch(err => console.log(err))
}