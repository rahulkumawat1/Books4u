const Product = require('../models/product');
const User = require('../models/user');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
let OTP;

// const transporter = nodemailer.createTransport(sendgridTransport({
//     auth: {
//         api_key: process.env.SENDGRID_KEY
//     }
// }))

exports.detailProduct = (req, res, next) => {
    const prodId = req.params.productId;

    Product.findById(prodId)
        .then(product => {
            res.render('detail-product', {pageTitle: product.title, product: product});
        })
        .catch(err => {
            res.redirect('/404')
        })
}

exports.getSignUp = (req, res, next) => {
    const errFlash = req.flash('error');
    const errorMessage = errFlash.length>0 ? errFlash[0]: null;
    res.render('signup', {pageTitle: "SignUp", errorMessage: errorMessage});
}

exports.postSignUp = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirm_password = req.body.confirm_password;

    User.findOne({email: email})
        .then(user => {
            if(user){
                req.flash('error', 'User with this email already exist.');
                return res.redirect('/signup');
            }

            if(password !== confirm_password) {
                req.flash('error', 'Passwords aren\'t same.');
                return res.redirect('/signup');
            };

            bcrypt.hash(password, 12)
                .then(hashPassword => {
                    const new_user = new User({
                        name: name, 
                        email: email, 
                        password: hashPassword, 
                        cart: {items: [], totalPrice: 0}});
                    
                    new_user.save()
                        .then(result => {
                            res.redirect('/login');
                    
                            // return transporter.sendMail({
                            //     to: email,
                            //     from: 'rahulkumawat96108@gmail.com',
                            //     subject: 'SignUp succesfully',
                            //     html: `
                            //         <h1>Congrats you succesfully signed up!</h1>
                            //       `
                            // });
                        })
                        .catch(err => console.log(err));
            })
            


            // OTP = Math.floor(100000 + Math.random() * 900000);
        
            // transporter.sendMail({
            //     to: email,
            //     from: 'rahulkumawat96108@gmail.com',
            //     subject: 'OTP verification',
            //     html: `
            //         <p>Your OTP is ${OTP}</p>
            //     `
            // });
        
            // const errFlash = req.flash('error');
            // const errorMessage = errFlash.length>0 ? errFlash[0]: null;
        
            // res.render('otp-verification', {
            //     name : name,
            //     email : email,
            //     password : password,
            //     errorMessage: errorMessage
            // })
        })


}

exports.postOTPverfication = (req, res, next) => {
    const otp = req.body.otp;
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    if(otp != OTP) {
        const errorMessage = 'Incorrect OTP.';
        return res.render('otp-verification', {
            name : name,
            email : email,
            password : password,
            errorMessage: errorMessage
        })
    };

    User.findOne({email: email})
        .then(user => {
            if(user) {
                req.flash('error', 'User with this email already exist.');
                return res.redirect('/signup');};

            bcrypt.hash(password, 12)
                .then(hashPassword => {
                    const new_user = new User({
                        name: name, 
                        email: email, 
                        password: hashPassword, 
                        cart: {items: [], totalPrice: 0}});
                    
                    new_user.save()
                        .then(result => {
                            res.redirect('/login');
                    
                            return transporter.sendMail({
                                to: email,
                                from: 'rahulkumawat96108@gmail.com',
                                subject: 'SignUp succesfully',
                                html: `
                                    <h1>Congrats you succesfully signed up!</h1>
                                  `
                            });
                        })
                        .catch(err => console.log(err));
                })

        })
}

exports.getLogin = (req, res, next) => {

    const errFlash = req.flash('error');
    const errorMessage = errFlash.length>0 ? errFlash[0]: null;
    res.render('login', {pageTitle: "Login", errorMessage: errorMessage});
}

exports.postLogin = (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email: email})
        .then(user => {
            if(!user) {
                req.flash('error', 'email is incorrect.');
                return res.redirect('/login');
            };


            bcrypt.compare(password, user.password)
                .then(isCorrect => {
                    if(!isCorrect)
                        {
                            req.flash('error', 'password is incorrect.');
                            return res.redirect('/login');
                        };

                        req.session.userId = user._id;
                        req.session.loggedIn = true;
                        req.session.user_t = user.type === 'admin' ? 'admin' : 'customer';

                        req.session.save((err) => {
                            console.log(err);
                            res.redirect('/');
                        })                    
                })
        })
        .catch(err => console.log(err));

}

exports.logout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });

}

exports.getReset = (req, res, next) => {
    const errFlash = req.flash('error');
    const errorMessage = errFlash.length>0 ? errFlash[0]: null;
    res.render('reset', {errorMessage: errorMessage});
}

exports.postReset = (req, res, next) => {
    const email = req.body.email;

    User.findOne({email: email})
        .then(user => {
            if(!user){
                req.flash('error', 'User doesn\'t exist.');
                return res.redirect('/reset');
            }
            return user;
        })
        .then(user => {
            return crypto.randomBytes(32, (err, buffer) => {
                if(err) {
                    console.log(err);
                    return res.redirect('/reset');
                }

                const token = buffer.toString('hex');
                const tokenExpiryTime = Date.now() + 600000;    //for 10min
                
                user.resetToken = token;
                user.resetTokenExpiry = tokenExpiryTime;
                return user.save()
                    .then(result => {
                        res.redirect('/');
                        return transporter.sendMail({
                            to: email,
                            from: 'rahulkumawat96108@gmail.com',
                            subject: 'Reset Password',
                            html: `
                                <p>This email is regarding your request to reset your password.</p>
                                <p>Kindly click on the below link.</p>
                                ${'https://books4u-shop.herokuapp.com/reset/' + token}
                                <p>Expiry time is 10min.</p>
                            `
                        });
                    })
            })
        })
}

exports.getResetTokenValidate = (req, res, next) => {
    const token = req.params.token;

    User.findOne({resetToken: token, resetTokenExpiry: {$gt: Date.now()}})
        .then(user => {
            if(!user){
                req.flash('error', 'Token Expired.');
                return res.redirect('/reset');
            }
            const errFlash = req.flash('error');
            const errorMessage = errFlash.length>0 ? errFlash[0]: null;

            res.render('new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                errorMessage: errorMessage,
                userId: user._id.toString(),
                passwordResetToken: token
            })
        })
        .catch(err => console.log(err))
}

exports.postNewPassword = (req, res, next) => {
    const password = req.body.password;
    const confirm_password = req.body.confirm_password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    if(password !== confirm_password){
        req.flash('error', 'Passwords aren\'t same.');
        const redirectPath = '/reset' + passwordToken;
        return res.redirect(redirectPath);
    }

    User.findOne({_id: userId, resetToken: passwordToken, resetTokenExpiry: {$gt: Date.now()}})
        .then(user => {
            resetUser = user;
            return bcrypt.hash(password, 12)
        })
        .then(hashPassword => {
            resetUser.password = hashPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiry = undefined;
            return resetUser.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch(err => console.log(err));
}

exports.showProducts = (req, res, next) => {

    Product.find()
        .then(products => {
            res.render('home', {pageTitle: 'shop', path: "/", products: products});
        });

};

exports.getSearch = (req, res, next) => {
    const search_str = req.body.search;
    Product.find()
        .then(products => {
            products = products.filter(prod => prod.title.toLowerCase().includes(search_str.toLowerCase()) || prod.author.toLowerCase().includes(search_str.toLowerCase()));
            res.render('home', {pageTitle: 'shop', path: "/", products: products});
        });

};