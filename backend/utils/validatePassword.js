// backend/utils/validatePassword.js

const isValidPassword = (password) => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Le mot de passe doit contenir au moins 8 caractères.",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Le mot de passe doit contenir au moins une lettre majuscule.",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Le mot de passe doit contenir au moins une lettre minuscule.",
    };
  }
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: "Le mot de passe doit contenir au moins un chiffre.",
    };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: "Le mot de passe doit contenir au moins un caractère spécial.",
    };
  }

  // Si tous les critères sont remplis
  return { isValid: true, message: "Le mot de passe est valide." };
};

export default isValidPassword;

