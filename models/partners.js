const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
    path: {
        type: String,
        required: true
    },
    uploadedAt:{
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('partners', partnerSchema);