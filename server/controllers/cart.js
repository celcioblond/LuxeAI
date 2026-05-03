import HttpError from "../models/http-error.js"
import Cart from "../models/cartModel.js"
import Product from "../models/productModel.js";

export const getCart = async(req, res, next) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId }).populate('products.productId');

    if (!cart) {
      return next(new HttpError(`Cart not found for user: ${userId}`, 404));
    }
    res.status(200).json({cart});
  } catch(error) {
    return next(new HttpError(`Failed to fetch cart: ${error.message}`, 500));
  }
}
export const addToCart = async (req, res, next) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || quantity <= 0) {
      return next(new HttpError(`UserId is required or quantity is invalid`, 400));
    }

    const product = await Product.findById(productId);
    if (!product) {
      return next(new HttpError(`Product does not exist`, 404));
    }

    if (product.stock === 0 || quantity > product.stock) {
      return next(new HttpError(`Only ${product.stock} available`, 400));
    }

    const cart = await Cart.findOne({ userId }).populate("products.productId");

    if (cart) {
      const existingProduct = cart.products.find(
        (p) => p.productId._id.toString() === productId.toString()
      );

      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.products.push({ productId, quantity });
      }

      await cart.save();
      res.status(200).json({ cart });
    } else {
      const newCart = new Cart({ userId, products: [{ productId, quantity }] });
      await newCart.save();
      res.status(201).json({ newCart });
    }
  } catch (error) {
    return next(new HttpError(`Failed to add to cart: ${error.message}`, 500));
  }
};

export const updateCart = async(req, res, next) => {
  try {
    const {userId} = req.params;
    const {productId, quantity} = req.body;
    if(!userId || !productId){
      return next(new HttpError("No user or product found", 400));
    }
    if(quantity < 0) {
      return next(new HttpError("Quantity cannot be negative", 400));
    }
    const product = await Product.findById(productId);
    if(!product) {
      return next(new HttpError("Product not found", 404));
    }
    const cart = await Cart.findOne({userId});
    if(!cart) {
      return next(new HttpError("Cart not found", 404));
    }

    const productInside = cart.products.find(p => p.productId.toString() === productId.toString());
    if(!productInside){
      return next(new HttpError("Product not in cart", 404));
    }
    if(product.stock === 0 || quantity > product.stock) {
      return next(new HttpError(`Only ${product.stock} is available`, 400));
    }
    if(quantity === 0){
      const productIndex = cart.products.findIndex(p => p.productId.toString() === productId.toString());
      cart.products.splice(productIndex, 1);
    } else {
      productInside.quantity = quantity;
    };
    await cart.save();
    res.status(200).json({cart})
  } catch(error) {
    return next(new HttpError(`${error.message}`, 500));
  }
}

export const deleteProduct = async(req, res, next) => {
  try {
    const {userId, productId} = req.params;
    if(!userId || !productId) {
      return next(new HttpError("User and product are required", 400));
    }
    const cart = await Cart.findOne({userId});
    if(!cart) {
      return next(new HttpError("Cart not found", 404));
    }
    const product = await Product.findById(productId);
    if(!product){
      return next(new HttpError("Product does not exist", 404));
    }
    const productIndex = cart.products.findIndex(p=> p.productId.toString() === productId.toString());
    if(productIndex === -1){
      return next(new HttpError("Product not found on cart", 404));
    }
    cart.products.splice(productIndex, 1);
    await cart.save();
    res.status(200).json({
      cart
    });
  } catch (error) {
    return next (new HttpError(`${error.message}`, 500));
  }
}

export const getCartTotal = async(req, res, next) => {
  try {
    const {userId} = req.params;
    const cart = await Cart.findOne({userId}).populate("products.productId");
    if(!cart) {
      return next(new HttpError("Cart was not found", 404));
    }

    const cartTotal = cart.products.reduce((total, p) => {
      return total + (p.productId.price*p.quantity);
    }, 0);

    res.status(200).json({cartTotal});
  } catch(error) {
    return next (new HttpError(`${error.message}`, 500));
  }
}

export const clearCart = async(req, res, next) => {
  try {
    connsole.log(req);
  } catch(error) {
    return next (new HttpError(`${error.message}`, 500));
  }
}