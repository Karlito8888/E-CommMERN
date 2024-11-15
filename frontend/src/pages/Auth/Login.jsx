import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../../redux/features/usersApiSlice';
import { setCredentials } from '../../redux/features/auth/authSlice';
import { toast } from 'react-toastify';
import InputField from '../../components/auth/InputField';
import SubmitButton from '../../components/auth/SubmitButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
      toast.success('Connexion réussie');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <section className="login-section">
      <div className="login-container">
        <div className="login-content">
          <h1>Connexion</h1>
          
          <form onSubmit={handleSubmit} className="login-form">
            <InputField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email"
              ariaRequired={true}
              ariaInvalid={false}
            />

            <InputField
              id="password"
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              ariaRequired={true}
              ariaInvalid={false}
            />

            <SubmitButton 
              isLoading={isLoading} 
              text="Se connecter"
            />
          </form>

          <div className="login-links">
            <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} className="register-link">
              Pas encore de compte ? S'inscrire
            </Link>
            <Link to="/forgot-password" className="forgot-password-link">
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        <div className="login-image">
          <img
            src="/images/login-image.jpg"
            alt="Connexion"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

export default Login;
