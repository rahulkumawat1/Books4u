const mongoose = require('mongoose');
const Product = require('../models/product');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: String,
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiry: Date,
    cart: {
        items: [{
            prodId: {type: Schema.Types.ObjectId,ref: 'Product', required: true}, 
            quantity: {type: Number, required: true}
        }],
        totalPrice: {type: Number, required: true}
    },
})

userSchema.methods.addToCart = function(prodId) {
    const findIndex = this.cart.items.findIndex(product => product.prodId == prodId);

    const updatedCart = {...this.cart};
    if(findIndex >= 0){
        updatedCart.items[findIndex].quantity += 1;
    }
    else{
        updatedCart.items.push({prodId: prodId, quantity: 1});
    }

    return Product.findById(prodId)
        .then(product => {
            updatedCart.totalPrice += product.price;
            this.cart = updatedCart;
            
            return this.save();
        })
}

userSchema.methods.getCart = function() {

    return Product.find()
        .select('_id price')
        .then(prds => {
            const prod_ids = prds.map(prd => prd._id.toString());
            let price = 0;
            const prev_length = this.cart.items.length;
            
            this.cart.items = this.cart.items.filter(item => prod_ids.includes(item.prodId.toString()));

            if(prev_length != this.cart.items.length){
                this.cart.items.forEach(item => {
                    const i = prds.findIndex(prd => prd._id == item.prodId);
                    price += prds[i].price*item.quantity;
                });
                this.cart.totalPrice = price;
                return this.save();
            }
            else{
                return new Promise((cb) => {
                    cb();
                })
            }
        })
        .then(result => {
            return this
                .populate('cart.items.prodId')
                .execPopulate()
                .then(user => {
        
                    const cart = {items: [], totalPrice: user.cart.totalPrice};
                    cart.items = user.cart.items.map(item => {
                        return {...item.prodId._doc, quantity: item.quantity}
                    })
        
                    return cart;
                })
        })



}

userSchema.methods.deleteItem = function(id) {

    return Product.findById(id)
        .then(product => {
            const quantity = this.cart.items.find(item => item.prodId == id).quantity;
            const decPrice = product.price*quantity;

            const updatedCart = {
                items: this.cart.items.filter(item => item.prodId != id),
                totalPrice: this.cart.totalPrice - decPrice
            }
            this.cart = updatedCart;
            return this.save();
        })
}

userSchema.methods.handleQty = function(qty, id) {
    const cart = this.cart;
    const index = cart.items.findIndex(prod => prod.prodId == id);
    const productId = cart.items[index].prodId;

    return Product.findById(productId)
        .then(product => {
            const oldQty = cart.items[index].quantity;
            cart.items[index].quantity = qty;
            cart.totalPrice = cart.totalPrice + (qty - oldQty)*product.price;
            this.cart = cart;
            return this.save();
        })
        .catch(err => console.log(err));
}

module.exports = mongoose.model('User', userSchema);
