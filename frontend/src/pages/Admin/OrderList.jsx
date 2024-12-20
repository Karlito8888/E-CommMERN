import Message from "../../components/Message";
import { Link } from "react-router-dom";
import { useGetAllOrdersQuery } from "../../redux/features/adminApiSlice";
import AdminMenu from "./AdminMenu";

const OrderList = ({ orders: propOrders, hideMenu = false }) => {
  const { data: fetchedOrders, isLoading, error } = useGetAllOrdersQuery(undefined, {
    skip: !!propOrders // Skip the query if orders are provided via props
  });

  const orders = propOrders || (fetchedOrders?.orders || []);
  if (error) {
    return (
      <Message variant="danger">
        {error?.data?.message || error.error}
      </Message>
    );
  }

  return (
    <div className="order-list">
      {!hideMenu && <AdminMenu />}
      <table className="order-list__table">
        <thead>
          <tr>
            <th className="order-list__header">ITEMS</th>
            <th className="order-list__header">ID</th>
            <th className="order-list__header">USER</th>
            <th className="order-list__header">DATE</th>
            <th className="order-list__header">TOTAL</th>
            <th className="order-list__header">PAID</th>
            <th className="order-list__header">DELIVERED</th>
            <th className="order-list__header">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td className="order-list__image">
                {order.orderItems?.[0]?.image && (
                  <img
                    src={order.orderItems[0].image}
                    alt={order._id}
                    className="order-list__image-img"
                    loading="lazy"
                  />
                )}
              </td>
              <td>{order._id}</td>
              <td>{order.user ? order.user.name || order.user.username : "N/A"}</td>
              <td>
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
              </td>
              <td>$ {order.totalPrice.toFixed(2)}</td>
              <td className="order-list__status">
                {order.isPaid ? (
                  <span className="order-list__status--paid">
                    Completed
                  </span>
                ) : (
                  <span className="order-list__status--pending">
                    Pending
                  </span>
                )}
              </td>
              <td className="order-list__status">
                {order.isDelivered ? (
                  <span className="order-list__status--paid">
                    Completed
                  </span>
                ) : (
                  <span className="order-list__status--pending">
                    Pending
                  </span>
                )}
              </td>
              <td>
                <Link to={`/order/${order._id}`}>
                  <button className="order-list__btn">More</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderList;
