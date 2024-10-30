const CategoryForm = ({
  value,
  setValue,
  handleSubmit,
  buttonText = "Submit",
  handleDelete,
}) => {
  return (
    <div className="category-form-container">
      <form onSubmit={handleSubmit} className="category-form">
        <input
          type="text"
          className="category-input"
          placeholder="Write category name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <div className="button-group">
          <button className="submit-button">{buttonText}</button>

          {handleDelete && (
            <button onClick={handleDelete} className="delete-button">
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
