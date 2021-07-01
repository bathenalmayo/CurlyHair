const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const  HairProductSchema = new Schema({
    name: String,
    imageUrl: String,
    price: Number,
    description: String,
    stock: Number,    //refer to stock available
    qty: Number,
    buyers: [
        {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
]
});



module.exports = mongoose.model('HairProduct',HairProductSchema);