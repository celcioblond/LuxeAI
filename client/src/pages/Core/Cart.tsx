import { useCart } from '../../hooks/useCart';

const Cart = () => {
  const { cart, loading } = useCart();
  

  return (
    <div className="flex flex-col mx-auto min-h-screen bg-slate-100">
      <div className="flex justify-between items-center mb-4 pt-2">
        <h3 className="text-2xl font-bold">Cart</h3>
      </div>

      {loading ? (
        <div>
          <h3 className="text-gray-500 mt-3">Cart loading...</h3>
        </div>
      ) : cart?.products.length === 0 ? (
        <div className="text-gray-500 mt-3">Your cart is empty</div>
      ) : (
        <>
          <div className='flex flex-col max-h space-y-3 gap-4'>
            Your cart has products
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
