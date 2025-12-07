import React, { useEffect, useState } from "react";
import { ordersPageStyles as styles } from "../assets/adminStyles";
import { FiCheck, FiPackage, FiTruck, FiUser } from "react-icons/fi";
import { BsCurrencyRupee } from "react-icons/bs";
import axios from "axios";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const statusOptions = [
    "All",
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("http://localhost:4000/api/orders");
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.log("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = [...orders];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();

      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(term) ||
          order.customer.name.toLowerCase().includes(term) ||
          order.customer.phone.includes(term) ||
          (order.customer.email &&
            order.customer.email.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((order) => order.status === statusFilter);
    }
    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  //UPDATE THE ORDERS USING ID
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:4000/api/orders/${orderId}`, {
        status: newStatus,
      });
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      setFilteredOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (error) {
      console.log("Error updating order status:", error);
    }
  };

  //CANCEL ORDERS
  const cancelOrder = (orderId) => {
    updateOrderDetails(orderId, "Cancelled");
  };

  //MODEL OPEN FOR MORE DETAIL OF ORDER
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  //CLOSE MODEL
  const closeModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.innerContainer}>
        {/* HEADER */}
        <div className={styles.headerContainer}>
          <h1 className={styles.headerTitle}>Order Management</h1>
          <p className={styles.headerSubtitle}>
            View, manage, and track customer orders
          </p>
        </div>

        {/* STATS CARDS */}
        <div className={styles.statsGrid}>
          <div className={styles.statsCard("border-blue-500")}>
            <div className={styles.statsCardInner}>
              <div className={styles.statsCardIconContainer("bg-blue-100")}>
                <FiPackage className={styles.statsCardIcon("text-blue-600")} />
              </div>
              <div>
                <p className={styles.statsCardLabel}>Track Orders</p>
                <p className={styles.statsCardValue}>{orders.length}</p>
              </div>
            </div>
          </div>

          <div className={styles.statsCard("border-amber-500")}>
            <div className={styles.statsCardInner}>
              <div className={styles.statsCardIconContainer("bg-amber-100")}>
                <FiTruck className={styles.statsCardIcon("text-amber-600")} />
              </div>
              <div>
                <p className={styles.statsCardLabel}>Processing</p>
                <p className={styles.statsCardValue}>
                  {orders.filter((o) => o.status === "Processing").length}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.statsCard("border-emerald-500")}>
            <div className={styles.statsCardInner}>
              <div className={styles.statsCardIconContainer("bg-emerald-100")}>
                <FiCheck className={styles.statsCardIcon("text-emerald-600")} />
              </div>
              <div>
                <p className={styles.statsCardLabel}>Delivered</p>
                <p className={styles.statsCardValue}>
                  {orders.filter((o) => o.status === "Delivered").length}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.statsCard("border-red-500")}>
            <div className={styles.statsCardInner}>
              <div className={styles.statsCardIconContainer("bg-red-100")}>
                <BsCurrencyRupee
                  className={styles.statsCardIcon("text-red-600")}
                />
              </div>
              <div>
                <p className={styles.statsCardLabel}>Pending Payment</p>
                <p className={styles.statsCardValue}>
                  {orders.filter((o) => o.paymentStatus === "Unpaid").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ORDERS TABLE */}
        <div className={styles.contentContainer}>
          <div className="overflow-x-auto">
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeaderCell}>Order ID</th>
                  <th className={styles.tableHeaderCell}>Customer</th>
                  <th className={styles.tableHeaderCell}>Date</th>
                  <th className={styles.tableHeaderCell}>Items</th>
                  <th className={styles.tableHeaderCell}>Total</th>
                  <th className={styles.tableHeaderCell}>Status</th>
                  <th className={styles.tableHeaderCell}>Payment</th>
                  <th className={styles.tableHeaderCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={styles.emptyStateCell}>
                      <div className={styles.emptyStateContainer}>
                        <FiPackage className={styles.emptyStateIcon} />
                        <h3 className={styles.emptyStateTitle}>
                          No orders Found
                        </h3>
                        <p className={styles.emptyStateTitle}>
                          Try Changing Your filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className={styles.tableRowHover}>
                      <td
                        className={`${styles.tableDataCell} ${styles.orderIdCell}`}
                      >
                        {order.orderId}
                      </td>
                      <td className={styles.tableDataCell}>
                        <div className="font-medium">{order.customer.name}</div>
                        <div className="text-sm text-gray-500">
                          {order.customer.phone}
                        </div>
                      </td>
                      <td
                        className={`${styles.tableDataCell} text-sm text-gray-500`}
                      >
                        {order.date}
                      </td>
                      <td
                        className={`${styles.tableDataCell} text-sm text-gray-500`}
                      >
                        {order.items.length} items
                      </td>
                      <td
                        className={`${styles.tableDataCell} text-sm text-gray-500`}
                      >
                        {order.total.toFixed(2)} INR
                      </td>
                      <td className={styles.tableDataCell}>
                        <span className={styles.statusBadge(order.status)}>
                          {order.status}
                        </span>
                      </td>
                      <td className={styles.tableDataCell}>
                        <span
                          className={styles.paymentBadge(order.paymentStatus)}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className={styles.tableDataCell}>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.viewButton}
                            onClick={() => viewOrderDetails(order)}
                          >
                            View
                          </button>
                          <button
                            className={styles.cancelButton}
                            disabled={
                              order.status === "Cancelled" ||
                              order.status === "Delivered"
                            }
                            onClick={() => cancelOrder(order._id)}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {isDetailModalOpen && selectedOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            // MODAL HEADER
            <div className={styles.modalHeader}>
              <div className="flex justify-between items-center">
                <h2 className={styles.modalHeaderTitle}>
                  Order Details: {selectedOrder._id}
                </h2>
                <button
                  onClick={closeModal}
                  className={styles.modalHeaderClose}
                >
                  <FIX size={24} />
                </button>
              </div>
              <p className="text-gray-600 mt-1">
                Ordered on {selectedOrder.date}
              </p>
            </div>
            // MODAL BODY
            <div className={styles.modalBody}>
              <div className={styles.modalGrid}>
                {/* LEFT SIDE */}
                <div>
                  <div className={styles.modalSection}>
                    <h3 className={styles.modalSection}>
                      <FiUser className={styles.modalIcon} />
                      Customer Information
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
