import { useCart } from '../../hooks/useCart';
import { Link, useNavigate } from 'react-router-dom';
import MainNavigation from '../../components/Navbar/MainNavigation';
import { FaShoppingCart, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Cart = () => {
  const {
    cart,
    loading,
    updating,
    total,
    quantity,
    removeProductFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  const handleRemove = async (productId: string, name: string) => {
    await removeProductFromCart(productId);
    toast.success(`${name} removed from cart`);
  };

  const handleClearCart = async () => {
    await clearCart();
    toast.success('Cart cleared');
  };

  const handleDecrement = async (
    productId: string,
    currentQty: number,
    name: string,
  ) => {
    if (currentQty === 1) {
      await removeProductFromCart(productId);
      toast.success(`${name} removed from cart`);
    } else {
      await updateQuantity(productId, currentQty - 1);
    }
  };

  const handleIncrement = async (
    productId: string,
    currentQty: number,
    stock: number,
  ) => {
    if (currentQty >= stock) {
      toast.error(`Only ${stock} in stock`);
      return;
    }
    await updateQuantity(productId, currentQty + 1);
  };

  return (
    <MainNavigation>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Shopping Cart
          </h1>
          <div className="flex items-center gap-2 text-gray-500">
            <FaShoppingCart size={18} />
            <span className="text-sm font-medium">{quantity} items</span>
          </div>
        </div>

        {/* Loading state */}
        {loading && !cart ? (
          <div className="flex flex-col items-center rounded-2xl bg-white p-8 shadow-2xl">
            <p className="text-gray-400">Loading cart...</p>
          </div>
        ) : !cart || cart.products.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center space-y-4 rounded-2xl bg-white p-8 shadow-2xl">
            <FaShoppingCart size={48} className="text-gray-300" />
            <p className="text-gray-500 text-lg">Your cart is empty</p>
            <Link
              to="/homepage"
              className="bg-black text-white px-5 py-2 rounded-2xl hover:bg-amber-500 transition-colors text-sm font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div
            className={`overflow-hidden rounded-2xl bg-white shadow-2xl transition-opacity duration-200 ${updating ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}
          >
            {/* Product rows */}
            <div className="divide-y divide-gray-100">
              {cart.products.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-4 px-6 py-4"
                >
                  {/* Image */}
                  <img
                    src={item.productId.imageUrl}
                    alt={item.productId.name}
                    className="w-16 h-16 object-cover rounded-2xl border border-gray-100 flex-shrink-0"
                  />

                  {/* Name + unit price */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {item.productId.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      ${item.productId.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleDecrement(
                          item.productId._id,
                          item.quantity,
                          item.productId.name,
                        )
                      }
                      disabled={updating}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors disabled:cursor-not-allowed"
                    >
                      <FaMinus size={9} />
                    </button>
                    <span className="w-6 text-center font-semibold text-gray-800 text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleIncrement(
                          item.productId._id,
                          item.quantity,
                          item.productId.stock,
                        )
                      }
                      disabled={updating}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors disabled:cursor-not-allowed"
                    >
                      <FaPlus size={9} />
                    </button>
                  </div>

                  {/* Line total */}
                  <p className="font-bold text-gray-800 w-24 text-right text-sm">
                    ${(item.productId.price * item.quantity).toLocaleString()}
                  </p>

                  {/* Delete button */}
                  <button
                    onClick={() =>
                      handleRemove(item.productId._id, item.productId.name)
                    }
                    disabled={updating}
                    className="text-gray-300 hover:text-red-500 transition-colors ml-1 flex-shrink-0 disabled:cursor-not-allowed"
                    aria-label={`Remove ${item.productId.name}`}
                  >
                    <FaTrash size={15} />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total items:</span>
                <span className="font-medium text-gray-800">{quantity}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total:</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={handleClearCart}
                disabled={updating}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-2xl transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear cart
              </button>
              <button
                onClick={() => navigate('/homepage')}
                disabled={updating}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue shopping
              </button>
              <button
                onClick={() => navigate('/checkout')}
                disabled={updating}
                className="ml-auto px-5 py-2 bg-black text-white rounded-2xl font-medium text-sm hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </MainNavigation>
  );
};

export default Cart;
