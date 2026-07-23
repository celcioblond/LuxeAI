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
    <Link to={`/product/${_id}`} className="block h-full">
      <div className="flex h-full flex-col rounded-2xl bg-white p-4 shadow-2xl hover:scale-[1.02] duration-200">
        {/* Fixed-size, contained image box keeps every card the same shape */}
        <div className="mb-3 flex h-[130px] w-full items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-slate-50">
          <img
            className="h-full w-full object-cover"
            src={imageUrl}
            alt={description}
          />
        </div>

        <h2 className="mb-2 truncate text-sm font-medium text-gray-700">{name}</h2>

        {/* Small price pill (keeps the amber accent) */}
        <div className="mb-2 self-start rounded-2xl bg-amber-300 px-3 py-0.5 text-xs font-semibold">
          {`$${price}`}
        </div>

        <p className="mt-auto text-xs font-bold tracking-tight text-gray-900">
          {stock === 0 ? "Not available" : "Click to view details"}
        </p>
      </div>
    </Link>
  );
}

export default CardProduct;
