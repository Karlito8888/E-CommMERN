const Message = ({ variant, children }) => {
  return <div className={`message ${variant}`}>{children}</div>;
};

export default Message;
