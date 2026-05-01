import { Link } from "react-router-dom";

interface CardProductProps {
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
  }
}

const CardProduct = ({product: {_id, name, description, price, imageUrl, stock}} : CardProductProps) => {

  return (
    <Link to={`/product/${_id}`}>
      <div className="flex flex-col p-6 m-2 space-y-10 shadow-2xl bg-white rounded-2xl md:flex-row md:space-y-0 md:space-x-10
      hover:scale-105 duration-200">
        <div className="justify-center my-auto">
          <img
            className="w-80"
            src={imageUrl}
            alt={description}
          />
        </div>

        <div className="flex flex-col space-y-8">
          <h2 className="text-lg text-center">{name}</h2>
          <div className="text-center border-2 rounded-2xl bg-amber-300">{`$${price}`}</div>
          <div>
            {stock === 0 ? (
              <div>
                <button>Not available</button>
              </div>
            ) : (
              <div className="text-bold tracking-tight font-bold mt-2 text-center">Click to view details</div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default CardProduct;