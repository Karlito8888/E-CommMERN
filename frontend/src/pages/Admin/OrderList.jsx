import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import { useGetOrdersQuery } from "../../redux/features/orderApiSlice";
import AdminMenu from "./AdminMenu";

const OrderList = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <div className="order-list">
          <AdminMenu />
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
                    <img
                      src={order.orderItems[0].image}
                      alt={order._id}
                      className="order-list__image-img"
                      loading="lazy"
                    />
                  </td>
                  <td>{order._id}</td>
                  <td>{order.user ? order.user.username : "N/A"}</td>
                  <td>
                    {order.createdAt ? order.createdAt.substring(0, 10) : "N/A"}
                  </td>
                  <td>$ {order.totalPrice}</td>
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
      )}
    </>
  );
};

export default OrderList;
