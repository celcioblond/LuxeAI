import useProducts from "../../hooks/useProducts";
import CardProduct from "../../components/CardProduct";

const Homepage = () => {

  const {products, loadingProducts } = useProducts();

  return (
    <div>
      <div className="flex-1 pt-2 mb-1.5">
        <h1 className="text-4xl font-bold text-center mt-7 mb-2 text-purple uppercase">
          E-commerce
        </h1>
      </div>
      <p className="text-center mb-4">Shop below</p>
      <div className="flex items-center justify-center min-h-screen bg-slate-200 gap-5 space-x-5">
        {loadingProducts ? (
          <div className="loading loading spinner">
            <p className="">Fetching products</p>
          </div>
        ) : (
          products.map((product) => (
            <CardProduct key={product._id} product={product} />
          ))
        )}
      </div>
    </div>
  );
}

export default Homepage;