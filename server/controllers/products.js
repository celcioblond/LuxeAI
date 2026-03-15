import HttpError from "../models/http-error.js";
import uuid from "uuid/v4";

const dummy_products = [
  {
    id: 1,
    name: 'Hat',
    description: 'a cool ass hat',
    price: 29.99,
  },
];

export const getAllProducts = async (req, res) => {
  res.status(200).json({ dummy_products });
};

export const getProductById = async (req, res, next) => {
  const pid = parseInt(req.params.id);
  const product = dummy_products.find((p) => {
    return p.id === pid;
  });

  if (!product) {
    return next(
      new HttpError("Could not find a product with the provided id",404)
    );
  }

  res.status(200).json({product});
};

export const addProduct = async (req, res) => {
  const { name, description, quantity } = req.body;
  const product = {
    id: uuid(),
    name: name,
    description: description,
    quantity: quantity
  };

  dummy_products.push(product);

  res.status(201).json({product: product});
}
