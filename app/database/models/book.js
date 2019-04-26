const fs = require('fs');
const faker = require('faker');
const mime = require('mime');
const validator = require('validator');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const FileStorage = require('@services/FileStorage');
const IMAGE_AVAILABLE_TYPES = ['image/jpeg'];
const IMAGE_MAX_SIZE = 5242880;

const bookSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'This field is required.'],
            minlength: [6, 'This field should be at least 6 characters long.'],
            unique: true,
        },
        description: {
            type: String,
            required: [true, 'This field is required.'],
            minlength: [20, 'This field should be at least 20 characters long.'],
        },
        image: {
            type: Object,
            default: null,
            validate: [
                {
                    validator(v) {
                        if (!v) {
                            return true;
                        }

                        if (!IMAGE_AVAILABLE_TYPES.includes(v.type)) {
                            return false;
                        }

                        return true;
                    },
                    message: () => `Image must be one of the next types: ${IMAGE_AVAILABLE_TYPES.join(', ')}.`,
                },
                {
                    validator(v) {
                        if (!v) {
                            return true;
                        }

                        if (v.size > IMAGE_MAX_SIZE) {
                            return false;
                        }

                        return true;
                    },
                    message: () => `Image size must be less than ${IMAGE_MAX_SIZE} bytes.`,
                },
            ],
        },
        price: {
            type: Number,
            required: [true, 'This field is required.'],
            min: [0, 'This field can not be less than 0.'],
        },
        discount: {
            type: Number,
            required: [true, 'This field is required.'],
            min: [0, 'This field can not be less than 0.'],
            max: [50, 'This field can not be greater than 50.'],
            validate: {
                validator(v) {
                    return validator.isInt(String(v));
                },
                message: 'This field should be a valid integer.',
            },
            default: 0,
        },
        authors: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'author',
                validate: {
                    async validator(v) {
                        const author = await mongoose.model('author').findById(v);

                        if (!author) {
                            return false;
                        }

                        return true;
                    },
                    message: props => `Author with id '${props.value}' does not exist.`,
                },
            },
        ],
        genres: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'genre',
                validate: {
                    async validator(v) {
                        const genre = await mongoose.model('genre').findById(v);

                        if (!genre) {
                            return false;
                        }

                        return true;
                    },
                    message: props => `Genre with id '${props.value}' does not exist.`,
                },
            },
        ],
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform(doc, ret) {
                delete ret.createdAt;
                delete ret.updatedAt;
                delete ret.__v;

                return ret;
            },
        },
    },
);

bookSchema.virtual('imagePath').get(function() {
    if (!this.image) {
        return null;
    }

    const bookImageStorage = FileStorage.getStorage('images/books');
    const imagePath = bookImageStorage.getPublicPath(this.image.name);

    return imagePath;
});

bookSchema.plugin(uniqueValidator, {
    message: 'This {PATH} is already exists.',
});
bookSchema.plugin(mongooseLeanVirtuals);

bookSchema.pre('save', async function() {
    const image = this.image;

    if (image) {
        const bookImageStorage = FileStorage.getStorage('images/books');
        const imageName = `${faker.random.alphaNumeric(20)}.${mime.getExtension(image.type)}`;

        await bookImageStorage.insert(imageName, fs.createReadStream(image.path));

        this.image = {
            name: imageName,
            type: image.type,
            size: image.size,
        };
    }
});

const Book = mongoose.model('book', bookSchema);

module.exports = Book;
