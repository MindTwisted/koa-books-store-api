const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Book = require('@models/book');

const genreSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'This field is required.'],
            minlength: [6, 'This field should be at least 6 characters long.'],
            unique: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                delete ret.createdAt;
                delete ret.updatedAt;
                delete ret.__v;

                return ret;
            },
        },
    },
);

genreSchema.plugin(uniqueValidator, {
    message: 'This {PATH} is already exists.',
});

genreSchema.post('findOneAndRemove', async function(doc, next) {
    if (!doc) {
        return next();
    }

    const id = doc._id;

    await Book.updateMany({ genres: { $in: [id] } }, { $pull: { genres: id } });

    return next();
});

const Genre = mongoose.model('genre', genreSchema);

module.exports = Genre;
