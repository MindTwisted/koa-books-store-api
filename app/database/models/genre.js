const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const NotFoundError = require('@errors/NotFoundError');

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

genreSchema.pre(/^find/, async function(next) {
    const id = this.getQuery()._id;

    if (!id) {
        return next();
    }

    try {
        mongoose.Types.ObjectId(id);

        return next();
    } catch (error) {
        throw new NotFoundError('Not found.');
    }
});

const Genre = mongoose.model('genre', genreSchema);

module.exports = Genre;
