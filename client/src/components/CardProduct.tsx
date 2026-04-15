import { Link } from "react-router-dom";

interface CardProductProps {
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    imageUrl: string;
  }
}

const CardProduct = ({product: {_id, name, description, price, imageUrl}} : CardProductProps) => {

  return (
    <Link to={`/product/${_id}`} className="card bg-base-100 w-80 shadow-lg">
    <div>
      <figure>
        <img
          className="aspect-[9/9] object-cover"
          src={imageUrl}
          alt={description}
        />
      </figure>

      <div className="card-body">
        <h2 className="card-title">{name}</h2>
        <div className="badge badge-warning">{`$${price}`}</div>
        <p>{description}</p>
        <div>
          <button className="border-amber-600">Add to cart</button>
        </div>
      </div>
    </div>
    </Link>

  );
}

export default CardProduct;