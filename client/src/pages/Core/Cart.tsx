import { useCart } from '../../hooks/useCart';

const Cart = () => {
  const {
    cart,
    quantity,
    total,
    loading,
    addToCart,
    removeProductFromCart,
    updateQuantity,
    clearCart,
  } = useCart();


  return (
    <div className="flex mx-auto items-center justify-center min-h-screen bg-slate-100">
      <div className=''>
        <h1 className='text-5xl'>Your cart</h1>
      </div>
    </div>
  );
};

export default Cart;
