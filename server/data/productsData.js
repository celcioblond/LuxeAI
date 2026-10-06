//Seed product data

const imgUrl = (seed) => {
  return `https://picsum.photos/seed/${seed}/600/400`;
};

const products = [
  {
    name: 'Rayban sunglasses',
    price: 209.0,
    description: 'Black with dark shades sunglasses',
    category: 'Accessories',
    stock: 10,
    imageUrl: imgUrl('rayban-sunglasses'),
  },
  {
    name: 'Classic White Sneakers',
    price: 120.0,
    description: 'Minimalist white leather sneakers with a cushioned sole',
    category: 'Shoes',
    stock: 25,
    imageUrl: imgUrl('white-sneakers'),
  },
  {
    name: 'Slim Fit Denim Jacket',
    price: 135.5,
    description: 'Medium wash denim jacket with a slim modern fit',
    category: 'Clothing',
    stock: 18,
    imageUrl: imgUrl('denim-jacket'),
  },
  {
    name: 'Leather Crossbody Bag',
    price: 189.99,
    description: 'Genuine leather crossbody bag with adjustable strap',
    category: 'Bags',
    stock: 12,
    imageUrl: imgUrl('crossbody-bag'),
  },
  {
    name: 'Cotton Oversized Hoodie',
    price: 79.0,
    description: 'Heavyweight oversized hoodie in soft brushed cotton',
    category: 'Clothing',
    stock: 40,
    imageUrl: imgUrl('oversized-hoodie'),
  },
  {
    name: 'Minimalist Silver Watch',
    price: 249.0,
    description: 'Stainless steel watch with a slim silver dial and mesh band',
    category: 'Accessories',
    stock: 8,
    imageUrl: imgUrl('silver-watch'),
  },
  {
    name: 'Chelsea Leather Boots',
    price: 215.0,
    description: 'Black leather Chelsea boots with elastic side panels',
    category: 'Shoes',
    stock: 15,
    imageUrl: imgUrl('chelsea-boots'),
  },
  {
    name: 'Linen Button-Up Shirt',
    price: 64.9,
    description: 'Breathable beige linen shirt, perfect for warm weather',
    category: 'Clothing',
    stock: 30,
    imageUrl: imgUrl('linen-shirt'),
  },
  {
    name: 'Canvas Weekender Duffel',
    price: 145.0,
    description:
      'Durable canvas duffel bag with leather handles and shoulder strap',
    category: 'Bags',
    stock: 14,
    imageUrl: imgUrl('weekender-duffel'),
  },
  {
    name: 'Wool Blend Scarf',
    price: 55.0,
    description: 'Soft charcoal wool blend scarf with fringed edges',
    category: 'Accessories',
    stock: 22,
    imageUrl: imgUrl('wool-scarf'),
  },
];

export default products;
