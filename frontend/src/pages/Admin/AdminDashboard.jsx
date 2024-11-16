import Chart from "react-apexcharts";
import { useGetUsersQuery, useGetAllOrdersQuery } from "../../redux/features/adminApiSlice";
import { useState, useEffect } from "react";
import AdminMenu from "./AdminMenu";
import OrderList from "./OrderList";
import Loader from "../../components/Loader";

const AdminDashboard = () => {
  const { data: customers, isLoading: loading } = useGetUsersQuery();
  const { data: orders, isLoading: loadingTwo } = useGetAllOrdersQuery();

  const [state, setState] = useState({
    options: {
      chart: {
        type: "line",
      },
      tooltip: {
        theme: "dark",
      },
      colors: ["#00E396"],
      dataLabels: {
        enabled: true,
      },
      stroke: {
        curve: "smooth",
      },
      title: {
        text: "Sales Trend",
        align: "left",
      },
      grid: {
        borderColor: "#ccc",
      },
      markers: {
        size: 1,
      },
      xaxis: {
        categories: [],
        title: {
          text: "Date",
        },
      },
      yaxis: {
        title: {
          text: "Sales",
        },
        min: 0,
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        floating: true,
        offsetY: -25,
        offsetX: -5,
      },
    },
    series: [{ name: "Sales", data: [] }],
  });

  useEffect(() => {
    if (salesDetail) {
      // console.log("salesDetail:", salesDetail);
      const formattedSalesDate = salesDetail.map((item) => ({
        x: item._id,
        // y: item.totalSales,
         y: parseFloat(item.totalSales.toString()) || 0,  // Conversion en nombre
      }));

      setState((prevState) => ({
        ...prevState,
        options: {
          ...prevState.options,
          xaxis: {
            categories: formattedSalesDate.map((item) => item.x),
          },
        },
        series: [
          { name: "Sales", data: formattedSalesDate.map((item) => item.y) },
        ],
      }));
    }
  }, [salesDetail]);

  return (
    <>
      <AdminMenu />

      <section className="admin-dashboard">
        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-card__currency">$</div>
            <p className="stat-card__label">Sales</p>
            <h1 className="stat-card__value">
              {isLoading ? <Loader /> : sales.totalSales.toFixed(2)}
            </h1>
          </div>

          <div className="stat-card">
            <div className="stat-card__currency">$</div>
            <p className="stat-card__label">Customers</p>
            <h1 className="stat-card__value">
              {isLoading ? <Loader /> : customers?.length}
            </h1>
          </div>

          <div className="stat-card">
            <div className="stat-card__currency">$</div>
            <p className="stat-card__label">All Orders</p>
            <h1 className="stat-card__value">
              {isLoading ? <Loader /> : orders?.totalOrders}
            </h1>
          </div>
        </div>

        <div className="chart-container">
          <Chart
            options={state.options}
            series={state.series}
            // type="bar"
            type="line"
            width="70%"
          />
        </div>

        <div className="order-list-container">
          <OrderList />
        </div>
      </section>
    </>
  );
};

export default AdminDashboard;
