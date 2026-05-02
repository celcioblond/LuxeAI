import useProducts from "../../hooks/useProducts";
import CardProduct from "../../components/CardProduct";
import MainNavigation from "../../components/Navbar/MainNavigation";

const Homepage = () => {

  const {products, loadingProducts } = useProducts();

  return (
    <MainNavigation>
      <div className="flex items-center justify-center min-h-screen bg-slate-200 gap-5 space-x-5">
        {loadingProducts ? (
          <div className="loading loading spinner">
            <p className="text-gray mt-15">Fetching products</p>
          </div>
        ) : (
          products.map((product) => (
            <CardProduct key={product._id} product={product} />
          ))
        )}
      </div>
    </MainNavigation>
  );
}

export default Homepage;