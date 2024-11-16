import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useRegisterMutation } from "../../redux/features/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice.js";
import InputField from "../../components/auth/InputField.jsx";
import SubmitButton from "../../components/auth/SubmitButton.jsx";
// import Loader from "../../components/Loader";

const Register = () => {
  // État du formulaire
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  // État des erreurs de validation
  const [validationErrors, setValidationErrors] = useState({});
  
  // Hooks Redux et Router
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const { search } = useLocation();
  const redirect = new URLSearchParams(search).get("redirect") || "/";

  // Redirection si déjà connecté
  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  // Gestion des changements de champs
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Effacer l'erreur lors de la modification
    if (validationErrors[id]) {
      setValidationErrors(prev => ({
        ...prev,
        [id]: ""
      }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = {};
    const { username, email, password, confirmPassword } = formData;

    // Validation du nom d'utilisateur
    if (!username.trim()) {
      errors.username = "Le nom d'utilisateur est requis";
    } else if (username.length < 3) {
      errors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = "L'email est requis";
    } else if (!emailRegex.test(email)) {
      errors.email = "Format d'email invalide";
    }

    // Validation du mot de passe
    if (!password) {
      errors.password = "Le mot de passe est requis";
    } else if (password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    // Validation de la confirmation du mot de passe
    if (!confirmPassword) {
      errors.confirmPassword = "La confirmation du mot de passe est requise";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    return errors;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const { username, email, password } = formData;
      const res = await register({ username, email, password }).unwrap();
      
      // Mise à jour du state Redux
      dispatch(setCredentials({ ...res }));
      
      // Notification et redirection
      toast.success("Compte créé avec succès! ");
      navigate(redirect);
    } catch (err) {
      const message = err?.data?.message || "Une erreur est survenue";
      toast.error(`Erreur d'inscription: ${message} `);
      
      // Gestion des erreurs spécifiques
      if (err?.data?.field) {
        setValidationErrors(prev => ({
          ...prev,
          [err.data.field]: err.data.message
        }));
      }
    }
  };

  return (
    <section className="register-section">
      <div className="register-container">
        <h1 className="register-title">Créez un compte</h1>
        
        <form onSubmit={handleSubmit} className="register-form" noValidate>
          <InputField
            id="username"
            label="Nom d'utilisateur"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="Votre nom d'utilisateur"
            ariaRequired={true}
            ariaInvalid={!!validationErrors.username}
          />
          {validationErrors.username && (
            <p className="error-message">{validationErrors.username}</p>
          )}

          <InputField
            id="email"
            label="Adresse email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="votre@email.com"
            ariaRequired={true}
            ariaInvalid={!!validationErrors.email}
          />
          {validationErrors.email && (
            <p className="error-message">{validationErrors.email}</p>
          )}

          <InputField
            id="password"
            label="Mot de passe"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Choisissez un mot de passe"
            ariaRequired={true}
            ariaInvalid={!!validationErrors.password}
          />
          {validationErrors.password && (
            <p className="error-message">{validationErrors.password}</p>
          )}

          <InputField
            id="confirmPassword"
            label="Confirmation du mot de passe"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmez votre mot de passe"
            ariaRequired={true}
            ariaInvalid={!!validationErrors.confirmPassword}
          />
          {validationErrors.confirmPassword && (
            <p className="error-message">{validationErrors.confirmPassword}</p>
          )}

          <SubmitButton 
            isLoading={isLoading} 
            text={isLoading ? "Création en cours..." : "Créer mon compte"} 
          />
        </form>

        <div className="login-link">
          <p>
            Déjà un compte ?{" "}
            <a
              href={redirect ? `/login?redirect=${redirect}` : "/login"}
              className="login-link-text"
            >
              Connectez-vous
            </a>
          </p>
        </div>
      </div>
      
      <img
        src="https://images.unsplash.com/photo-1576502200916-3808e07386a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2065&q=80"
        alt="Décoration"
        className="register-image"
      />
    </section>
  );
};

export default Register;
