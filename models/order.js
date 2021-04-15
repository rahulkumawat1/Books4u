const { Int32 } = require('bson');
const mongoose = require('mongoose');
const User = require('../models/user');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    order: {
        items: {type: Array},
        totalPrice: {type: Number},
        address: Object,
        date: String
    },
    user: {
        userId: {type: Schema.Types.ObjectId,ref: 'User'},
        name: {type: String}
    },
    status: Number
});

orderSchema.methods.addToOrders = function(user, address) {

    if(user.cart.totalPrice == 0){
        return new Promise((cb) => {
            cb();
        })
    }

    var currentdate = new Date(); 
    function formatAMPM(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }
    var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + formatAMPM(currentdate);

    

    return user.getCart()
        .then(order => {
            this.order = {...order, address: address, date: datetime};
            this.user = {
                userId: user._id, 
                name: user.name
            }

            return this.save()
                .then(result => {
                    user.cart = {items: [], totalPrice: 0};
                    user.save();
                    return result;
                });
        })
};


module.exports = mongoose.model('Order', orderSchema);