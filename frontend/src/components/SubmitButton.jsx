// SubmitButton.jsx

import PropTypes from 'prop-types';

const SubmitButton = ({ isLoading, text, className = '' }) => (
  <button
    type="submit"
    className={`submit-button ${className} ${isLoading ? 'loading' : ''}`}
    disabled={isLoading}
    aria-busy={isLoading}
    aria-label={text}
  >
    {isLoading ? (
      <span className="loading-spinner" role="status" aria-hidden="true" />
    ) : null}
    <span className="button-text">{text}</span>
  </button>
);

SubmitButton.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default SubmitButton;
