import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { login, reset } from '../features/auth/authSlice';
import Spinner from '../components/Spinner';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const { email, password } = formData;

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

    // Reset the auth state flags when the component unmounts
    return () => {
      dispatch(reset());
    }
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    let tempErrors = {};
    if (!email) tempErrors.email = 'Email is required';
    if (!password) tempErrors.password = 'Password is required';
    return tempErrors;
  }

  const onSubmit = (e) => {
    e.preventDefault();
    const tempErrors = validate();
    setErrors(tempErrors);

    if (Object.keys(tempErrors).length > 0) {
        return;
    }

    const userData = {
      email,
      password,
    };

    dispatch(login(userData));
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl flex overflow-hidden">
        {/* Left Column: Branding */}
        <div className="w-1/2 bg-gray-900 p-12 text-white flex flex-col justify-center items-center text-center">
            <h1 className="text-4xl font-bold mb-4">Expense Tracker</h1>
            <p className="text-lg">Log in to access your dashboard.</p>
        </div>

        {/* Right Column: Form */}
        <div className="w-1/2 p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Member Login</h2>
          <form onSubmit={onSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">Email Address</label>
              <input 
                  type="email" 
                  id="email" 
                  name="email"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-300 ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                  value={email} 
                  onChange={onChange} 
                  placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">Password</label>
              <input 
                  type="password" 
                  id="password" 
                  name="password"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-300 ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
                  value={password} 
                  onChange={onChange} 
                  placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            
            <button 
                type="submit" 
                className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105"
            >
                Login
            </button>
          </form>

            </div>
          </div>
        </div>
  );
}

export default Login;