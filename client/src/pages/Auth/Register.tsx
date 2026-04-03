import { useState } from 'react';
import { validateEmail, validatePassword } from '../../utils/formValidations';
import { useAuth } from '../../hooks/useAuth';


const Register = () => {
  const authContext = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isValidEmail = validateEmail(email);
  const isValidPassword = validatePassword(password);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

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
      await authContext?.register({name, email, password})
      setName('');
      setEmail('');
      setPassword('');
      setLoading(false);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <>
      {success ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-400 via-cyan-400 to-green-400">
          <div className="bg-white rounded-2xl shadow-2xl px-10 py-10 w-full max-w-md flex flex-col items-center gap-4">
            <h1 className="text-2xl font-bold text-cyan-500 tracking-wide">
              Registered Successfully!
            </h1>
            <a
              href="/login"
              className="text-cyan-500 font-medium hover:underline"
            >Login</a>
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
                  Register
                </h1>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block text-sm text-gray-500 mb-1"
                >
                  Name:
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={name}
                  placeholder="Enter name"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleNameChange(e)
                  }
                  className="w-full border-0 border-b-2 border-teal-400 outline-none pb-1 text-gray-700 placeholder-gray-300 focus:border-cyan-500 transition-colors bg-transparent"
                />
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
                <p
                  className={`text-xs text-red-400 mt-2 ${email && !isValidEmail ? '' : 'hidden'}`}
                >
                  Email requirements:
                  <ul className="list-disc ml-5 mt-1">
                    <li>Must start with a letter or number</li>
                    <li>Can include . _ % + - in the middle</li>
                    <li>Must contain @</li>
                  </ul>
                </p>
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
                <p
                  className={`text-xs text-red-400 mt-2 ${password && !isValidPassword ? '' : 'hidden'}`}
                >
                  Password requirements:
                  <ul className="list-disc ml-5 mt-1">
                    <li>Minimum 8 characters</li>
                    <li>At least one lowercase letter (a–z)</li>
                    <li>At least one uppercase letter (A–Z)</li>
                    <li>At least one number (0–9)</li>
                    <li>At least one special character: @ $ ! % * ? &</li>
                  </ul>
                </p>
              </div>

              {error && (
                <p className="text-xs text-red-400 mb-4 text-center">{error}</p>
              )}

              <div className="mb-5">
                <button
                  type="submit"
                  disabled={!isValidEmail || !isValidPassword}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-bold tracking-widest uppercase text-sm hover:from-teal-500 hover:to-cyan-600 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  Register
                </button>
              </div>

              <p className="text-center text-sm text-gray-400">
                Already registered?
                <a
                  href="/login"
                  className="text-cyan-500 font-medium hover:underline"
                >
                  Log in
                </a>
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
export default Register;
