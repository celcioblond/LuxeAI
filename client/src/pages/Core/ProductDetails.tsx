import useProducts from '../../hooks/useProducts';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

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
      <h1 className="text-7xl text-white bg-blue-900 p-8 text-center font-bold tracking-tight">
        {product.name}
      </h1>

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
        <div className="w-1/2 m-4 flex flex-col items-center justify-between gap-10">
          <p className="p-4 m-6 text-4xl">{product.description}</p>

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
