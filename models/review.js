const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    comment: { type: String, required: true },
    postedAt: { type: Date, default: Date.now } // Store the date when the review is posted
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
