// SubmitButton.jsx

const SubmitButton = ({ isLoading, text }) => (
  <button disabled={isLoading} type="submit" className="submit-button">
    {isLoading ? `${text}...` : text}
  </button>
);

export default SubmitButton;

