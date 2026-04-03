import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {

  const authContext = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSucces] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await authContext?.login({ email, password });
      setEmail('');
      setPassword('');
      setLoading(false);
      setSucces(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
      setSucces(false);
      console.log(err);
    }
  };

  return (
    <>
      {success ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-400 via-cyan-400 to-green-400">
          <div className="bg-white rounded-2xl shadow-2xl px-10 py-10 w-full max-w-md flex flex-col items-center gap-4">
            <h1 className="text-2xl font-bold text-cyan-500 tracking-wide">
              Login Successful!
            </h1>
          </div>
        </div>
      ) : loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-400 via-cyan-400 to-green-400">
          <div className="bg-white rounded-2xl shadow-2xl px-10 py-10 w-full max-w-md flex flex-col items-center gap-6">
            <div className="w-14 h-14 rounded-full border-4 border-teal-200 border-t-cyan-500 animate-spin" />
            <p className="text-cyan-500 font-bold tracking-wide text-lg">
              Loading...
            </p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-400 via-cyan-400 to-green-400">
          <div className="bg-white rounded-2xl shadow-2xl px-10 py-10 w-full max-w-md relative">
            <form onSubmit={handleSubmit}>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-cyan-500 tracking-wide">
                  Login
                </h1>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block text-sm text-gray-500 mb-1"
                >
                  Email:
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={email}
                  placeholder="Enter email"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleEmailChange(e)
                  }
                  className="w-full border-0 border-b-2 border-teal-400 outline-none pb-1 text-gray-700 placeholder-gray-300 focus:border-cyan-500 transition-colors bg-transparent"
                />
              </div>

              <div className="mb-8">
                <label
                  htmlFor="password"
                  className="block text-sm text-gray-500 mb-1"
                >
                  Password:
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={password}
                  placeholder="Enter password"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handlePasswordChange(e)
                  }
                  className="w-full border-0 border-b-2 border-teal-400 outline-none pb-1 text-gray-700 placeholder-gray-300 focus:border-cyan-500 transition-colors bg-transparent"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 mb-4 text-center">{error}</p>
              )}

              <div className="mb-5">
                <button
                  type="submit"
                  disabled={!email || !password}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-bold tracking-widest uppercase text-sm hover:from-teal-500 hover:to-cyan-600 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  Login
                </button>
              </div>

              <p className="text-center text-sm text-gray-400">
                Don't have an account? 
                <a
                  href="/register"
                  className="text-cyan-500 font-medium hover:underline"
                >
                  Register
                </a>
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
export default Login;
