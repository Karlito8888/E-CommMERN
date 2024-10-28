const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error(error); // Logger l'erreur pour le débogage
    if (error.status) {
      // Si l'erreur a un code de statut, utilise-le
      return res.status(error.status).json({ message: error.message });
    }
    // Par défaut, renvoyer une erreur 500
    res.status(500).json({ message: "Internal Server Error" });
  });
};

export default asyncHandler;
