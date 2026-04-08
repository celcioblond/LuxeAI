import useProducts from "../../hooks/useProducts";

const Homepage = () => {

  const {products} = useProducts();

  console.log(products);
  return (
    <>
      <h1>Homepage</h1>
      <div>
        <ul>
          {products.map((product) => (
            <li key={product.id}>{product.name}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default Homepage;