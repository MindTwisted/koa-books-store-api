const Cart = require('@models/cart');
const Order = require('@models/order');
const NotFoundError = require('@errors/NotFoundError');

const getCart = async user => {
    return Cart.find({ user: user._id })
        .populate({
            path: 'book',
            select: 'title price discount',
        })
        .select('count book')
        .lean();
};

const deleteCart = async user => {
    return Cart.deleteMany({ user: user._id });
};

const calculateTotals = (cart, user) => {
    const totals = { price: 0, discount: 0, details: { books: [] } };

    cart.map(item => {
        const booksCount = Number(item.count);
        const bookFullPrice = Number(item.book.price);
        const userDiscountPercent = Number(user.discount);
        const bookDiscountPercent = Number(item.book.discount);
        const totalDiscountPercent =
            userDiscountPercent + bookDiscountPercent > 50 ? 50 : userDiscountPercent + bookDiscountPercent;
        const bookDiscount = bookFullPrice * (totalDiscountPercent / 100);
        const bookPriceWithDiscount = bookFullPrice - bookDiscount;

        totals.price += Number((bookPriceWithDiscount * booksCount).toFixed(2));
        totals.discount += Number((bookDiscount * booksCount).toFixed(2));
        totals.details.books.push({
            title: item.book.title,
            price: item.book.price,
            discount: item.book.discount,
            count: booksCount,
        });
    });

    return totals;
};

class OrderService {
    constructor(user, paymentType) {
        this.user = user;
        this.paymentType = paymentType;
    }

    async save() {
        const user = this.user;
        const cart = await getCart(user);

        if (!cart.length) {
            throw new NotFoundError('There are no items in the cart.');
        }

        const totals = calculateTotals(cart, user);
        const order = await Order.create({
            totalDiscount: totals.discount,
            totalPrice: totals.price,
            user: user._id,
            paymentType: this.paymentType,
            details: {
                user: {
                    name: user.name,
                    email: user.email,
                    discount: user.discount,
                },
                books: totals.details.books,
            },
        });

        await deleteCart(user);

        return order;
    }
}

module.exports = OrderService;
