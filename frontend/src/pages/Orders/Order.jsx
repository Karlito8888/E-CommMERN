// frontend/src/pages/Order.jsx

import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
} from "../../redux/features/orderApiSlice";

const Order = () => {
  const { id: orderId } = useParams();
  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] =
    useDeliverOrderMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const deliverHandler = async () => {
    await deliverOrder(orderId);
    refetch();
  };

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant="danger">{error.data.message}</Message>
  ) : (
    <div className="order-container">
      <div className="order-details">
        <div className="order-items">
          {order.orderItems.length === 0 ? (
            <Message>Order is empty</Message>
          ) : (
            <table className="order-items-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Article</th>
                  <th className="text-center">Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="order-item-image"
                        loading="lazy"
                      />
                    </td>
                    <td>
                      <Link
                        to={`/product/${item.product}`}
                        className="order-item-name"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className="text-center">{item.qty}</td>
                    <td className="text-center">{item.price}</td>
                    <td className="text-center">
                      {(item.qty * item.price).toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="order-summary">
        <div className="shipping-info">
          <h2>Shipping</h2>
          <p>
            <strong>Order:</strong> {order._id}
          </p>
          <p>
            <strong>Name:</strong> {order.user.username}
          </p>
          <p>
            <strong>Email:</strong> {order.user.email}
          </p>
          <p>
            <strong>Address:</strong> {order.shippingAddress.address},{" "}
            {order.shippingAddress.city} {order.shippingAddress.postalCode},{" "}
            {order.shippingAddress.country}
          </p>
          <p>
            <strong>Method:</strong> {order.paymentMethod}
          </p>

          {order.isPaid ? (
            <Message variant="success">Paid on {order.paidAt}</Message>
          ) : (
            <Message variant="danger">Not paid</Message>
          )}
        </div>

        <h2 className="order-summary-title">Order Summary</h2>
        <div className="summary-details">
          <div className="summary-item">
            <span>Items</span>
            <span>{order.itemsPrice} €</span>
          </div>
          <div className="summary-item">
            <span>Shipping</span>
            <span>{order.shippingPrice} €</span>
          </div>
          <div className="summary-item">
            <span>Tax</span>
            <span>{order.taxPrice} €</span>
          </div>
          <div className="summary-item">
            <span>Total</span>
            <span>{order.totalPrice} €</span>
          </div>
        </div>

        {loadingDeliver && <Loader />}
        {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
          <button
            type="button"
            className="deliver-button"
            onClick={deliverHandler}
          >
            Mark As Delivered
          </button>
        )}
      </div>
    </div>
  );
};

export default Order;
