import { useState, useEffect } from 'react';

const ValidatedImage = ({ src, alt, onValidation, className = '', loadingClassName = 'loading', loadedClassName = 'loaded' }) => {
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      setIsValid(true);
      setIsLoading(false);
      if (onValidation) onValidation(true);
    };
    
    img.onerror = () => {
      setIsValid(false);
      setIsLoading(false);
      if (onValidation) onValidation(false);
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onValidation]);

  if (!isValid && !isLoading) return null;

  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${className} ${isLoading ? loadingClassName : loadedClassName}`}
      loading="lazy"
    />
  );
};

export default ValidatedImage;
