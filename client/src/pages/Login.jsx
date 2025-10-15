import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { login, reset } from "../features/auth/authSlice";
import Spinner from "../components/Spinner";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) toast.error(message);
    if (isSuccess || user) navigate("/");

    return () => {
      dispatch(reset());
    };
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    let tempErrors = {};
    if (!email) tempErrors.email = "Email is required";
    if (!password) tempErrors.password = "Password is required";
    return tempErrors;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const tempErrors = validate();
    setErrors(tempErrors);
    if (Object.keys(tempErrors).length > 0) return;

    dispatch(login({ email, password }));
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Section - Dark Gray Gradient Branding */}
      <div className="flex-1 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white flex flex-col justify-center items-center p-8 md:p-16">
        <h1 className="text-5xl font-bold mb-6 text-center">Expense Tracker</h1>
        <p className="text-lg md:text-xl text-center max-w-md opacity-90">
          Log in to access your personalized dashboard and manage your expenses
          efficiently.
        </p>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 bg-white flex flex-col justify-center p-8 md:p-16">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Member Login
          </h2>
          <form onSubmit={onSubmit}>
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-gray-700 font-semibold mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-300 ${
                  errors.email ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-gray-700 font-semibold mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={onChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-300 ${
                  errors.password ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-white px-4 py-3 rounded-lg 
             hover:from-gray-800 hover:via-gray-700 hover:to-gray-600 
             focus:outline-none focus:ring-4 focus:ring-gray-400 
             transition-all duration-300 transform hover:scale-105 shadow-md"
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
