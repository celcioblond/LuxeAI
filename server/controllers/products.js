import Product from "../models/productModel.js";
import HttpError from "../models/http-error.js";
import { productSchema } from "../schemas/productSchema.js";
import {ZodError} from 'zod';

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
      .json(error.issues.map((issue) => ({messaage: issue.message})))
    }
    return next(new HttpError(`Error message:  ${error.message}`), 500);
  }
}

export const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const updatedProduct = req.body;
    const product = await Product.findByIdAndUpdate(productId, updatedProduct, {new: true, runValidators: true});
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

