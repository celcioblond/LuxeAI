import useProducts from "../../hooks/useProducts";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

const ProductDetails = () => {

  const {getProduct, product, loadingProduct} = useProducts();

  const productId = useParams();

  useEffect(()=> {
    getProduct(productId.id);
  }, [productId.id, getProduct]);

  return loadingProduct ? (
    <div className="loading">
      <p>Loading product</p>
    </div>
  ) : (
    <div>
      <h1>ProductDetails</h1>
      <div>
        <h1>
          {product.name}
        </h1>
      </div>
    </div>
  );
}

export default ProductDetails;