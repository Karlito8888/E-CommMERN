import Message from "../../components/Message";
import { useGetMyOrdersQuery } from "../../redux/api/orderApiSlice";

const UserOrder = () => {
  const { data: orders, isLoading, error } = useGetMyOrdersQuery();

  return (
    <div className="user-order-container">
      <h2 className="user-order-title">My Orders</h2>

      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <Message variant="danger">{error?.data?.error || error.error}</Message>
      ) : (
        <table className="user-order-table">
          <thead>
            <tr>
              <td>IMAGE</td>
              <td>ID</td>
              <td>DATE</td>
              <td>TOTAL</td>
              <td>PAID</td>
              <td>DELIVERED</td>
              <td></td>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>
                  <img
                    src={order.orderItems[0].image}
                    alt={order.user}
                    className="order-image"
                    loading="lazy"
                  />
                </td>
                <td>{order._id}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>$ {order.totalPrice}</td>
                <td>
                  {order.isPaid ? (
                    <p className="status-completed">Completed</p>
                  ) : (
                    <p className="status-pending">Pending</p>
                  )}
                </td>
                <td>
                  {order.isDelivered ? (
                    <p className="status-completed">Completed</p>
                  ) : (
                    <p className="status-pending">Pending</p>
                  )}
                </td>
                <td>
                  <a href={`/order/${order._id}`}>
                    <button className="details-button">View Details</button>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserOrder;
