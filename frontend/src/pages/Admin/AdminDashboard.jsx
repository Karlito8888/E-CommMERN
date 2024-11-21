import Chart from "react-apexcharts";
import { useGetUsersQuery, useGetAllOrdersQuery } from "../../redux/features/adminApiSlice";
import { useState, useEffect } from "react";
import AdminMenu from "./AdminMenu";
import OrderList from "./OrderList";

const AdminDashboard = () => {
  const { data: customers, isLoading: loadingUsers } = useGetUsersQuery();
  const { data: ordersData, isLoading: loadingOrders } = useGetAllOrdersQuery();

  // État local pour les statistiques de vente
  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    salesByDate: []
  });

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
        formatter: function (val) {
          return `$${val.toFixed(2)}`;
        }
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
          text: "Sales ($)",
        },
        min: 0,
        labels: {
          formatter: function (val) {
            return `$${val.toFixed(2)}`;
          }
        }
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

  // Calcul des statistiques de vente quand les commandes sont chargées
  useEffect(() => {
    if (ordersData?.orders) {
      // Calculer le total des ventes
      const total = ordersData.orders.reduce((sum, order) => {
        const orderTotal = Number(order.totalPrice) || 0;
        return sum + orderTotal;
      }, 0);
      
      // Grouper les ventes par date
      const salesByDate = ordersData.orders.reduce((acc, order) => {
        const date = new Date(order.createdAt).toLocaleDateString();
        const orderTotal = Number(order.totalPrice) || 0;
        acc[date] = (acc[date] || 0) + orderTotal;
        return acc;
      }, {});

      // Convertir en format pour le graphique
      const formattedSales = Object.entries(salesByDate)
        .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
        .map(([date, total]) => ({
          x: date,
          y: Number(total.toFixed(2))
        }));

      setSalesStats({
        totalSales: Number(total.toFixed(2)),
        salesByDate: formattedSales
      });
    }
  }, [ordersData]);

  // Mise à jour du graphique quand les statistiques changent
  useEffect(() => {
    if (salesStats.salesByDate.length > 0) {
      setState(prevState => ({
        ...prevState,
        options: {
          ...prevState.options,
          xaxis: {
            ...prevState.options.xaxis,
            categories: salesStats.salesByDate.map(item => item.x),
          },
        },
        series: [{
          name: "Sales",
          data: salesStats.salesByDate.map(item => item.y)
        }],
      }));
    }
  }, [salesStats]);

  return (
    <>
      <AdminMenu />

      <section className="admin-dashboard">
        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-card__currency">$</div>
            <p className="stat-card__label">Total Sales</p>
            <h1 className="stat-card__value">
              {typeof salesStats.totalSales === 'number' ? salesStats.totalSales.toFixed(2) : '0.00'}
            </h1>
          </div>

          <div className="stat-card">
            <p className="stat-card__label">Customers</p>
            <h1 className="stat-card__value">
              {customers?.length || 0}
            </h1>
          </div>

          <div className="stat-card">
            <p className="stat-card__label">Orders</p>
            <h1 className="stat-card__value">
              {ordersData?.total || 0}
            </h1>
          </div>
        </div>

        <div className="sales-chart">
          <Chart
            options={state.options}
            series={state.series}
            type="line"
            height={350}
          />
        </div>

        <div className="recent-orders">
          <h2>Recent Orders</h2>
          <OrderList orders={ordersData?.orders?.slice(0, 5) || []} hideMenu={true} />
        </div>
      </section>
    </>
  );
};

export default AdminDashboard;
