import useProducts from "../../hooks/useProducts";
import CardProduct from "../../components/CardProduct";

const Homepage = () => {

  const {products, loadingProducts } = useProducts();

  console.log(products);
  return (
    <div>
      <h1 className="text-4xl font-bold text-center mt-7 mb-2 text-purple uppercase">
        Homepage
      </h1>
      <p className="text-center mb-4">Elige tu product</p>
      <div>
        {loadingProducts ? (
          <div className="loading loading spinner">
            <p className="">Fetching products</p>
          </div>
        ) : 
          products.map((product)=> (
            <CardProduct key={product._id} product={product} />
          ))
      }
      </div>
    </div>
  );
}

export default Homepage;