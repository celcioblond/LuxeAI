import Product from "../models/productModel.js";
import HttpError from "../models/http-error.js";

export const getAllProducts = async (req, res, next) => {
  const { category, minPrice, maxPrice, sort, page = 1, limit = 20 } = req.query;

  const filter = { isAvailable: true };
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    price_asc:  { price: 1 },
    price_desc: { price: -1 },
    newest:     { releaseDate: -1 },
    rating:     { averageRating: -1 },
  };
  const sortOption = sortMap[sort] || { createdAt: -1 };
  const skip = (Number(page) - 1) * Number(limit);

  let products, total;
  try {
    [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);
  } catch (err) {
    return next(new HttpError("Failed to fetch products.", 500));
  }

  res.json({ total, page: Number(page), pages: Math.ceil(total / limit), products });
};


export const getProductById = async (req, res, next) => {
  try {
    const {productId} = req.params.id;
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

export const searchProduct = async (req, res, next) => {
  const { q, category } = req.query;

  if (!q) {
    return next(new HttpError("Search query is required.", 400));
  }

  const filter = { $text: { $search: q }, isAvailable: true };
  if (category) filter.category = category;

  let products;
  try {
    products = await Product.find(filter, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(30);
  } catch (err) {
    return next(new HttpError("Search failed.", 500));
  }

  res.json({ results: products.length, products });
};

export const addProduct = async (req, res, next) => {
  try {
    const { name, description, price, discountPrice, category, tags, images, variants, stock} = req.body;
    const product = await Product.create({name, description, price, discountPrice, category, tags, images, variants, stock});
    res.status(201).json({
      message: "Product added",
      product
    });
  } catch (error) {
    return next(new HttpError(error.message), 500);
  }
}

// export const updateProduct = async (req, res, next) => {
//   let product;
//   try {
//     product = await Product.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//   } catch (err) {
//     return next(new HttpError(err.message || "Could not update product.", 500));
//   }

//   if (!product) {
//     return next(new HttpError("Product not found.", 404));
//   }

//   res.json({ product });
// };

export const updateProduct = async (req, res, next) => {
  try {
    const {productId} = req.params.body;
    const product = await Product.findByIdAndUpdate(productId);
    if(!product){
      return next(new HttpError("Product not found", 404));
    }
    res.status(200).json({
      message: "Post updated",
      product
    })
  } catch (error) {
    return next(new HttpError("Updating product failed", 500));
  }
}

export const deleteProduct = async (req, res, next) => {
  let product;
  try {
    product = await Product.findByIdAndDelete(req.params.id);
  } catch {
    return next(new HttpError("Invalid product ID.", 400));
  }

  if (!product) {
    return next(new HttpError("Product not found.", 404));
  }

  res.json({ message: "Product deleted." });
};
