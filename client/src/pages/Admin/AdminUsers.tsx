import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAllUsers, updateUser, deleteUser } from '../../services/adminService';

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  address: Address;
  createdAt: string;
}

interface EditForm {
  name: string;
  email: string;
  role: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: '', email: '', role: 'user' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const openEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role });
  };

  const closeEdit = () => setEditingUser(null);

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const updated = await updateUser(editingUser._id, editForm);
      setUsers(prev => prev.map(u => u._id === editingUser._id ? { ...u, ...updated } : u));
      toast.success('User updated');
      closeEdit();
    } catch {
      toast.error('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setDeletingId(id);
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold tracking-tight mb-8">Users</h2>

      <div className="flex flex-col p-6 shadow-2xl bg-white rounded-2xl">
        {loading ? (
          <p className="text-gray-400 text-center py-8">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No users found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-gray-500 font-medium uppercase tracking-widest text-xs">Name</th>
                <th className="text-left py-3 text-gray-500 font-medium uppercase tracking-widest text-xs">Email</th>
                <th className="text-left py-3 text-gray-500 font-medium uppercase tracking-widest text-xs">Role</th>
                <th className="text-left py-3 text-gray-500 font-medium uppercase tracking-widest text-xs">Joined</th>
                <th className="text-right py-3 text-gray-500 font-medium uppercase tracking-widest text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                  <td className="py-4 font-medium">{user.name}</td>
                  <td className="py-4 text-gray-600">{user.email}</td>
                  <td className="py-4">
                    <span className={`inline-block px-3 py-0.5 rounded-2xl text-xs font-semibold ${
                      user.role === 'admin' ? 'bg-amber-300' : 'bg-slate-100 text-gray-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-right space-x-2">
                    <button
                      onClick={() => openEdit(user)}
                      className="px-3 py-1.5 text-xs font-bold bg-black text-white rounded-2xl hover:bg-amber-300 hover:text-black transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      disabled={deletingId === user._id}
                      className="px-3 py-1.5 text-xs font-bold bg-black text-white rounded-2xl hover:bg-red-500 transition-colors duration-200 disabled:opacity-40"
                    >
                      {deletingId === user._id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="flex flex-col p-8 space-y-6 shadow-2xl bg-white rounded-2xl w-full max-w-md">
            <h3 className="text-lg font-bold tracking-tight">Edit User</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border-0 border-b-2 border-gray-300 outline-none pb-1 text-gray-700 focus:border-black transition-colors bg-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border-0 border-b-2 border-gray-300 outline-none pb-1 text-gray-700 focus:border-black transition-colors bg-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full border-0 border-b-2 border-gray-300 outline-none pb-1 text-gray-700 focus:border-black transition-colors bg-transparent"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={closeEdit}
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-bold bg-black text-white rounded-2xl hover:bg-amber-300 hover:text-black transition-colors duration-200 disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
