import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import HeartIcon from '../pages/Products/HeartIcon';
import CartIcon from '../pages/Auth/icons/cart.svg';
import { addToCart } from '../redux/features/cart/cartSlice';
import '../assets/styles/components/_heartAndCart.scss';

const HeartAndCart = ({ 
  product,
  className = "",
  withAnimation = true 
}) => {
  const dispatch = useDispatch();

  const handleAddToCart = useCallback((e) => {
    e.stopPropagation();
    dispatch(addToCart({ 
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      countInStock: product.countInStock,
      qty: 1
    }));
  }, [dispatch, product]);

  return (
    <div className={`heart-and-cart ${className}`}>
      <HeartIcon 
        product={product}
        withAnimation={withAnimation}
        className="me-2"
      />
      <button
        type="button"
        onClick={handleAddToCart}
        className={`cart-icon-btn ${withAnimation ? 'animated' : ''}`}
        disabled={!product.countInStock}
      >
        <img src={CartIcon} alt="Cart" className="cart-icon" />
      </button>
    </div>
  );
};

export default HeartAndCart;