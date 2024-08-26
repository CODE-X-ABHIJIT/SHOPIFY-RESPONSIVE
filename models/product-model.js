const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    image: Buffer,
    name: String,
    price: Number,
    discount: {
        type: Number,
        default: 0
    },
    bgcolor: String,
    panelcolor: String,
    textcolor: String,
    description: {
        type: String,
        required: true,
        trim: true,
    },
    quantity: {
        type: Number,  // Added quantity field
        default: 1    // Set a default value if needed
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'owner',
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});




module.exports = mongoose.model('product', productSchema);
