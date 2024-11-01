const CategoryForm = ({
  value,
  setValue,
  handleSubmit,
  buttonText = "Ajouter",
  handleDelete,
  isLoading,
}) => {
  return (
    <div className="category-form-container">
      <form onSubmit={handleSubmit} className="category-form">
        <label htmlFor="category-input" className="visually-hidden">
          Nom de la catégorie
        </label>
        <input
          id="category-input"
          type="text"
          className="category-input"
          placeholder="Ajouter une nouvelle catégorie..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-required="true" // Indique que le champ est requis
        />
        <div className="button-group">
          <button
            className="submit-button"
            disabled={isLoading}
            aria-live="polite"
          >
            {isLoading ? "Loading..." : buttonText}
          </button>
          {handleDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="delete-button"
              disabled={isLoading}
              aria-label="Supprimer cette catégorie" // Ajoute une description pour l'accessibilité
            >
              {isLoading ? "Loading..." : "Supprimer"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;

