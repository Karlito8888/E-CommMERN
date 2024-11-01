import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { checkExpiration, setCredentials } from "../../redux/features/auth/authSlice.js";
import { toast } from "react-toastify";
import { useLoginUserMutation } from "../../redux/features/usersApiSlice";
import InputField from "../../components/auth/InputField.jsx";
import SubmitButton from "../../components/auth/SubmitButton.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginUserMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const { search } = useLocation();
  // const sp = new URLSearchParams(search);
  // const redirect = sp.get("redirect") || "/";
  const redirect = new URLSearchParams(search).get("redirect") || "/";

  useEffect(() => {
    // Vérifie si la session de l'utilisateur est expirée
    dispatch(checkExpiration());

    if (userInfo) navigate(redirect);
  }, [navigate, redirect, userInfo, dispatch]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      console.log(res);
      dispatch(setCredentials({ ...res }));
      toast.success("Connexion réussie! 👌"); 
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <section className="signin-container">
        <div className="signin-form">
          <h1 className="title">Connectez-vous</h1>
          <form onSubmit={submitHandler} className="form" noValidate>
            <InputField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse email"
              ariaRequired="true"
              ariaInvalid={isLoading ? "false" : "true"}
            />
            <InputField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              ariaRequired="true"
            />
            <SubmitButton isLoading={isLoading} text="Ok!" />
            {isLoading && <Loader />}
          </form>

          <div className="register-link">
            <p>
              Pas de compte ?{" "}
              <a
                href={redirect ? `/register?redirect=${redirect}` : "/register"}
                className="link"
              >
                Créer un compte...
              </a>
            </p>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80"
          alt="Sign In"
          className="signin-image"
          aria-hidden="true"
        />
      </section>
    </>
  );
};

export default Login;

