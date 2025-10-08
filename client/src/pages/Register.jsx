import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { register, reset } from '../features/auth/authSlice';
import Spinner from '../components/Spinner';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
  });

  const { name, email, password, password2 } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess || user) {
      navigate('/');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (password !== password2) {
      toast.error('Passwords do not match');
    } else {
      const userData = {
        name,
        email,
        password,
      };

      dispatch(register(userData));
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl flex overflow-hidden">
        {/* Left Column: Branding */}
        <div className="w-1/2 bg-gradient-to-br from-blue-500 to-purple-600 p-12 text-white flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl font-bold mb-4">Create Your Account</h1>
          <p className="text-lg">Join us and start tracking your expenses with ease.</p>
        </div>

        {/* Right Column: Form */}
        <div className="w-1/2 p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Register</h2>
          <form onSubmit={onSubmit}>
            <div className="mb-6">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Name</label>
              <input 
                  type="text" 
                  id="name" 
                  name="name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-300" 
                  value={name} 
                  onChange={onChange} 
                  placeholder="John Doe"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">Email Address</label>
              <input 
                  type="email" 
                  id="email" 
                  name="email"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-300" 
                  value={email} 
                  onChange={onChange} 
                  placeholder="you@example.com"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">Password</label>
              <input 
                  type="password" 
                  id="password" 
                  name="password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-300" 
                  value={password} 
                  onChange={onChange} 
                  placeholder="••••••••"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password2" className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
              <input 
                  type="password" 
                  id="password2" 
                  name="password2"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-300" 
                  value={password2} 
                  onChange={onChange} 
                  placeholder="••••••••"
              />
            </div>
            <button 
                type="submit" 
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105"
            >
                Register
            </button>
          </form>
          <div className="mt-6 text-center">
              <p className="text-gray-600">Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
