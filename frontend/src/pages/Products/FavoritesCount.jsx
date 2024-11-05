import { useSelector } from "react-redux";

const CompteurFavoris = () => {
  // Récupération de la liste des favoris depuis le store Redux
  const favoris = useSelector((state) => state.favorites);
  const nombreDeFavoris = favoris.length;

  return (
    <div className="compteur-favoris-container">
      {nombreDeFavoris > 0 && (
        <span className="compteur-favoris">{nombreDeFavoris}</span>
      )}
    </div>
  );
};

export default CompteurFavoris;
