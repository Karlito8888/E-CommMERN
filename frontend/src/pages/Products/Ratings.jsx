const Ratings = ({ value, text, color }) => {
  // Validation de la valeur pour s'assurer qu'elle est dans l'intervalle [0, 5]
  const validatedValue = Math.max(0, Math.min(value, 5));

  const fullStars = Math.floor(validatedValue);
  const halfStars = validatedValue - fullStars > 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStars;

  return (
    <div className="flex items-center">
      {/* Affichage des étoiles pleines */}
      {[...Array(fullStars)].map((_, index) => (
        <FaStar key={index} className={`text-${color} ml-1`} />
      ))}

      {/* Affichage de l'étoile demi */}
      {halfStars === 1 && <FaStarHalfAlt className={`text-${color} ml-1`} />}

      {/* Affichage des étoiles vides */}
      {[...Array(emptyStars)].map((_, index) => (
        <FaRegStar key={index} className={`text-${color} ml-1`} />
      ))}

      {/* Affichage du texte d'évaluation */}
      <span className={`rating-text ml-2 text-${color}`}>{text}</span>
    </div>
  );
};

Ratings.defaultProps = {
  color: "yellow-500",
};

export default Ratings;
