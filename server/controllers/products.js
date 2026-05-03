import Product from "../models/productModel.js";
import HttpError from "../models/http-error.js";
import { productSchema } from "../schemas/productSchema.js";
import {ZodError} from 'zod';
import Cart from "../models/cartModel.js";

export const getAllProducts = async(req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      products
    })
  } catch(error){
    return next(new HttpError("Error getting all products"), 500);
  }
}

export const getProductById = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return next(new HttpError("Product not found. ", 404));
    }
    res.status(200).json({
      product
    });
  } catch(error) {
    return next(new HttpError("Invalid id", 400))
  }
}

export const addProduct = async (req, res, next) => {
  try {
    const {name, price, description, stock, imageUrl} = productSchema.parse(req.body);
    const product = await Product.create({name, price, description, stock, imageUrl});
    res.status(201).json({
      product
    });
  } catch (error) {
    if(error instanceof ZodError) {
      return res.status(400)
      .json(error.issues.map((issue) => ({message: issue.message})))
    }
    return next(new HttpError(`Error message:  ${error.message}`), 500);
  }
}

export const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const updatedProduct = productSchema.partial().parse(req.body);

    const product = await Product.findByIdAndUpdate(productId, updatedProduct,
       {new: true,
        runValidators: true
      });
      
    if(!product){
      return next(new HttpError("Product not found", 404));
    }
    res.status(200).json({
      product
    });
  } catch (error) {
    return next(new HttpError("Updating product failed", 400));
  }
}

export const deleteProduct = async(req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndDelete(productId);
    if(!product) {
      return next(new HttpError("Product not found", 404));
    }
    res.status(200).json({
      product
    });
  } catch(error) {
    return next(new HttpError(`Error message: ${error}`, 400));
  }
}

export const clearCart = async(req, res, next) => {
  try {
    const {userId} = req.params;
    const {productId} = req.body;

    //Verificar usuario 
    if(!userId || !productId) {
      return next(new HttpError("User or product not found", 404));
    }

    const cart = await Cart.findOne({userId});
    if(!cart) {
      return next(new HttpError("Cart not found", 404));
    }
    cart.products = [];
    await cart.save();
    res.status(200).json({cart});

  } catch(error) {
    return next(new HttpError(`${error.message}`, 500));
  }
}

export const getCartTotal = async(req, res, next) => {
  try {
    const {userId} = req.params;
    if(!userId){
      return next(new HttpError("User not found", 500));
    }

    const cart = await Cart.findOne({userId});

    if(!cart) {
      return next (new HttpError("Cart not found", 404));
    }

    const total = cart.products.reduce((product, acc) => product.quantity + quantity);
    res.status(200).json({total});

  } catch(error) {
    return next(new HttpError(`${error.message}`, 500));
  }
}