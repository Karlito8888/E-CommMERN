// SubmitButton.jsx

const SubmitButton = ({ isLoading, text }) => (
  <button type="submit" className="submit-button" disabled={isLoading}>
    {isLoading ? `${text}...` : text}
  </button>
);

export default SubmitButton;
