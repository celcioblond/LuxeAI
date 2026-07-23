import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { addProduct, updateProduct, deleteProduct } from '../../services/adminService';
import { getProducts } from '../../services/productService';
import useProducts from '../../hooks/useProducts';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  imageUrl: string;
}

type ProductForm = Omit<Product, '_id'>;

// Predefined categories keep the recommendation clusters clean and consistent.
const CATEGORIES = [
  'Fitness',
  'Apparel',
  'Kitchen',
  'Tech',
  'Skincare',
  'Accessories',
] as const;

const emptyForm: ProductForm = {
  name: '',
  price: 0,
  description: '',
  category: '',
  stock: 0,
  imageUrl: '',
};

const AdminProducts = () => {
  const { getProducts: syncProductContext } = useProducts();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getProducts()
      .then(data => setProducts(data.products))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({ name: product.name, price: product.price, description: product.description, category: product.category ?? '', stock: product.stock, imageUrl: product.imageUrl });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingProduct) {
        const updated = await updateProduct(editingProduct._id, form);
        setProducts(prev => prev.map(p => p._id === editingProduct._id ? { ...p, ...updated } : p));
        toast.success('Product updated');
      } else {
        const created = await addProduct(form);
        setProducts(prev => [...prev, created]);
        toast.success('Product added');
      }
      syncProductContext();
      closeModal();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : (editingProduct ? 'Failed to update product' : 'Failed to add product'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      syncProductContext();
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const setField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Products</h2>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-black text-white text-sm font-bold rounded-2xl hover:bg-amber-300 hover:text-black transition-colors duration-200"
        >
          + Add Product
        </button>
      </div>

      <div className="flex flex-col p-6 shadow-2xl bg-white rounded-2xl">
        {loading ? (
          <p className="text-gray-400 text-center py-8">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No products yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-gray-500 font-medium uppercase tracking-widest text-xs">Product</th>
                <th className="text-left py-3 text-gray-500 font-medium uppercase tracking-widest text-xs">Price</th>
                <th className="text-left py-3 text-gray-500 font-medium uppercase tracking-widest text-xs hidden sm:table-cell">Category</th>
                <th className="text-left py-3 text-gray-500 font-medium uppercase tracking-widest text-xs">Stock</th>
                <th className="text-left py-3 text-gray-500 font-medium uppercase tracking-widest text-xs hidden md:table-cell">Description</th>
                <th className="text-right py-3 text-gray-500 font-medium uppercase tracking-widest text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-10 h-10 rounded-2xl object-cover bg-slate-100"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="inline-block px-3 py-0.5 bg-amber-300 rounded-2xl text-sm font-semibold">
                      ${product.price.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 text-gray-600 hidden sm:table-cell">
                    {product.category ? (
                      <span className="inline-block px-3 py-0.5 bg-slate-100 rounded-2xl text-xs font-medium">
                        {product.category}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-4 text-gray-600">
                    {product.stock === 0 ? (
                      <span className="text-red-500 font-semibold">Out of stock</span>
                    ) : (
                      `${product.stock} left`
                    )}
                  </td>
                  <td className="py-4 text-gray-500 hidden md:table-cell max-w-xs truncate">
                    {product.description}
                  </td>
                  <td className="py-4 text-right space-x-2">
                    <button
                      onClick={() => openEdit(product)}
                      className="px-3 py-1.5 text-xs font-bold bg-black text-white rounded-2xl hover:bg-amber-300 hover:text-black transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      disabled={deletingId === product._id}
                      className="px-3 py-1.5 text-xs font-bold bg-black text-white rounded-2xl hover:bg-red-500 transition-colors duration-200 disabled:opacity-40"
                    >
                      {deletingId === product._id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="flex flex-col p-8 shadow-2xl bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto space-y-6">
            <h3 className="text-lg font-bold tracking-tight">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h3>

            <div className="space-y-4">
              {([
                { key: 'name', label: 'Name', type: 'text', placeholder: 'Min 5 characters' },
                { key: 'description', label: 'Description', type: 'text', placeholder: 'Min 5 characters' },
                { key: 'imageUrl', label: 'Image URL', type: 'url', placeholder: 'https://example.com/image.jpg' },
              ] as const).map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => setField(key, e.target.value)}
                    placeholder={placeholder}
                    className="w-full border-0 border-b-2 border-gray-300 outline-none pb-1 text-gray-700 focus:border-black transition-colors bg-transparent"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={e => setField('category', e.target.value)}
                  className="w-full border-0 border-b-2 border-gray-300 outline-none pb-1 text-gray-700 focus:border-black transition-colors bg-transparent"
                >
                  <option value="" disabled>Select a category</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              {([
                { key: 'price', label: 'Price', step: '0.01' },
                { key: 'stock', label: 'Stock', step: '1' },
              ] as const).map(({ key, label, step }) => (
                <div key={key}>
                  <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">{label}</label>
                  <input
                    type="number"
                    min={0}
                    step={step}
                    value={form[key]}
                    onChange={e => setField(key, parseFloat(e.target.value) || 0)}
                    className="w-full border-0 border-b-2 border-gray-300 outline-none pb-1 text-gray-700 focus:border-black transition-colors bg-transparent"
                  />
                </div>
              ))}
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded-2xl border border-gray-200"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={closeModal}
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-bold bg-black text-white rounded-2xl hover:bg-amber-300 hover:text-black transition-colors duration-200 disabled:opacity-40"
              >
                {saving ? 'Saving…' : editingProduct ? 'Save changes' : 'Add product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
