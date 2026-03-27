import { body, param, query, validationResult } from "express-validator";
import HttpError from "../models/http-error.js";

export const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  next();
};

export const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email").isEmail().withMessage("Enter a valid email.").normalizeEmail(),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters."),
];

export const loginRules = [
  body("email").isEmail().withMessage("Enter a valid email.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
];

export const updateProfileRules = [
  body("name")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Name cannot exceed 50 characters."),
  body("address.zip")
    .optional()
    .trim()
    .isPostalCode("any")
    .withMessage("Invalid zip/postal code."),
];

const VALID_CATEGORIES = ["clothing", "shoes", "accessories", "bags"];

export const createProductRules = [
  body("name").trim().notEmpty().withMessage("Product name is required."),
  body("description").trim().notEmpty().withMessage("Description is required."),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number."),
  body("discountPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount price must be a non-negative number."),
  body("category")
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(", ")}.`),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer."),
];

export const updateProductRules = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty."),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number."),
  body("discountPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount price must be a non-negative number."),
  body("category")
    .optional()
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(", ")}.`),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer."),
];

export const addToCartRules = [
  body("productId").isMongoId().withMessage("Invalid product ID."),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1."),
];

export const updateCartRules = [
  param("itemId").isMongoId().withMessage("Invalid item ID."),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1."),
];


const VALID_PAYMENT_METHODS = ["card", "paypal", "apple_pay", "google_pay"];

export const createOrderRules = [
  body("items").isArray({ min: 1 }).withMessage("Order must contain at least one item."),
  body("items.*.productId").isMongoId().withMessage("Each item must have a valid product ID."),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Each item quantity must be at least 1."),
  body("shippingAddress").notEmpty().withMessage("Shipping address is required."),
  body("shippingAddress.street").trim().notEmpty().withMessage("Street is required."),
  body("shippingAddress.city").trim().notEmpty().withMessage("City is required."),
  body("shippingAddress.zip").trim().notEmpty().withMessage("Zip code is required."),
  body("shippingAddress.country").trim().notEmpty().withMessage("Country is required."),
  body("paymentMethod")
    .isIn(VALID_PAYMENT_METHODS)
    .withMessage(`Payment method must be one of: ${VALID_PAYMENT_METHODS.join(", ")}.`),
];


export const createReviewRules = [
  param("productId").isMongoId().withMessage("Invalid product ID."),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5."),
  body("comment").trim().notEmpty().withMessage("Comment is required."),
  body("title")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters."),
];

export const updateReviewRules = [
  param("id").isMongoId().withMessage("Invalid review ID."),
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5."),
  body("comment")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Comment cannot be empty."),
  body("title")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters."),
];
