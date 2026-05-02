import useProducts from '../../hooks/useProducts';
import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { FaShoppingCart } from 'react-icons/fa';

const ProductDetails = () => {
  const { getProduct, product, loadingProduct } = useProducts();
  const { id } = useParams();

  useEffect(() => {
    getProduct(id);
  }, [id, getProduct]);

  if (loadingProduct || !product) {
    return (
      <div className="loading">
        <p>Loading product</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-300">
      <header className="flex bg-blue-900 justify-around items-center p-3">
        <button className="bg-black w-20 h-12 p-3 rounded-2xl shadow-2xl text-white hover:bg-amber-500">
          <Link to="/homepage">Home</Link>
        </button>
        <h1 className="text-7xl text-white p-8 text-center font-bold tracking-tight">
          {product.name}
        </h1>
        <div className="rounded-full w-12 h-12 bg-white flex items-center justify-center shadow-md transition-transform duration-300 hover:scale-110 hover:shadow-lg">
          <Link to="/cart">
            <FaShoppingCart size={24} />
          </Link>
        </div>
      </header>

      <div className="flex items-center justify-center space-x-4 m-4">
        {/* Image */}
        <div>
          <img
            className="m-4 py-0 shadow-2xl border-2 rounded-2xl w-1/2"
            src={product.imageUrl}
            alt={product.name}
          />
        </div>

        {/* Description + Button */}
        <div className="w-1/2 m-4 flex flex-col items-center justify-center gap-10">
          <p className="p-4 m-6 text-4xl">{product.description}</p>
          <p className="p-3 text-left text-3xl font-bold">{`$${product.price}`}</p>
          {product.stock === 0 ? (
            <p className="text-red-600 font-semibold">Out of stock</p>
          ) : (
            <button className="px-4 py-2 bg-blue-500 text-white font-bold hover:bg-blue-600 rounded">
              Add to cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
