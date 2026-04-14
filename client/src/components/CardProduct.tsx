
interface CardProductProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    imageUrl: string;
  }
}

const CardProduct = ({product: {name, description, price, imageUrl}} : CardProductProps) => {

  return (
    <div className="card bg-base-100 w-80 shadow-lg">
      <figure>
        <img className="aspect-[9/9] object-cover"
         src={imageUrl}
        alt={description} />
      </figure>

      <div className="card-body">
        <h2 className="card-title">{name}</h2>
        <div className="badge badge-warning">
          {price}
        </div>
        <p>{description}</p>
      </div>
    </div>


  )
}

export default CardProduct;