import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API_ENDPOINTS, resolveImageUrl } from '../../../src/constant/api';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Hash,
  Mail,
  MapPin,
  Package,
  Phone,
  Printer,
  ReceiptText,
  Truck,
  User,
  XCircle,
} from 'lucide-react';
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import { useAlert } from '../../../context/AlertContext';

const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const statusStyles = {
  Pending: {
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    active: 'bg-amber-600 text-white shadow-amber-200 ring-amber-200',
    icon: Clock,
  },
  Processing: {
    badge: 'bg-blue-50 text-blue-700 ring-blue-200',
    active: 'bg-blue-600 text-white shadow-blue-200 ring-blue-200',
    icon: Package,
  },
  Shipped: {
    badge: 'bg-violet-50 text-violet-700 ring-violet-200',
    active: 'bg-violet-600 text-white shadow-violet-200 ring-violet-200',
    icon: Truck,
  },
  Delivered: {
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    active: 'bg-emerald-600 text-white shadow-emerald-200 ring-emerald-200',
    icon: CheckCircle,
  },
  Cancelled: {
    badge: 'bg-red-50 text-red-700 ring-red-200',
    active: 'bg-red-600 text-white shadow-red-200 ring-red-200',
    icon: XCircle,
  },
};

const formatCurrency = (amount) => `NPR ${Number(amount || 0).toLocaleString()}`;

const InfoTile = ({ icon: Icon, label, value, wide = false, mono = false }) => (
  <div className={`flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50/80 p-4 ${wide ? 'sm:col-span-2' : ''}`}>
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
      <Icon size={18} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 break-words font-semibold text-gray-900 ${mono ? 'font-mono text-sm' : 'text-sm'}`}>
        {value || 'N/A'}
      </p>
    </div>
  </div>
);

const SectionCard = ({ icon: Icon, title, children }) => (
  <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={20} />
      </div>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const OrderInformation = () => {
  const { id } = useParams();
  const { showAlert } = useAlert();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.ORDERS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        const foundOrder = data.orders.find((o) => o.id === parseInt(id, 10));
        setOrder(foundOrder);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order:', error);
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      setUpdating(true);

      const token = localStorage.getItem('token');

      if (!token) {
        showAlert({
          type: 'error',
          title: 'Authentication Required',
          message: 'Please login again.',
        });
        setUpdating(false);
        return;
      }

      const response = await fetch(API_ENDPOINTS.ORDER_STATUS(id, newStatus), {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
        showAlert({
          type: 'success',
          title: 'Status Updated',
          message: `Order status updated to ${newStatus}.`,
          duration: 3000,
        });
        fetchOrderDetails();
      } else {
        showAlert({
          type: 'error',
          title: 'Update Failed',
          message: data.message || 'Failed to update order status. Please try again.',
        });
      }
      setUpdating(false);
    } catch (error) {
      console.error('Error updating order:', error);
      showAlert({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update order status. Please check your connection and try again.',
      });
      setUpdating(false);
    }
  };

  const totalAmount = useMemo(() => {
    if (!order) return 0;
    return Number(order.price || 0) * Number(order.quantity || 0);
  }, [order]);

  const currentStatus = statuses.find((status) => status.toLowerCase() === String(order?.status || '').toLowerCase()) || order?.status || 'Pending';
  const StatusIcon = statusStyles[currentStatus]?.icon || Package;
  const productImage = resolveImageUrl(order?.product?.photo_url) || '/image/image.jpg';
  const placedDate = order?.created_at ? new Date(order.created_at) : null;
  const statusIndex = statuses.indexOf(currentStatus);

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="mt-4 text-sm font-semibold text-gray-600">Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <Package className="mx-auto mb-4 text-gray-300" size={48} />
              <h1 className="text-xl font-bold text-gray-900">Order not found</h1>
              <p className="mt-2 text-sm text-gray-500">This order may have been deleted or is unavailable.</p>
              <Link
                to="/admin/orders"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
              >
                <ArrowLeft size={16} />
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <Link
                  to="/admin/orders"
                  className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  aria-label="Back to orders"
                >
                  <ArrowLeft size={18} />
                </Link>
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">Order #{order.id}</span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusStyles[currentStatus]?.badge || 'bg-gray-100 text-gray-700 ring-gray-200'}`}>
                      <StatusIcon size={14} />
                      {currentStatus}
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">Order Details</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    {placedDate
                      ? `${placedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${placedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : 'Date unavailable'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="rounded-xl bg-blue-50 px-5 py-3 text-left sm:text-right">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Total Amount</p>
                  <p className="text-xl font-black text-blue-900">{formatCurrency(totalAmount)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Printer size={16} />
                  Print
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-6">
                <SectionCard icon={Package} title="Product Information">
                  <div className="flex flex-col gap-5 sm:flex-row">
                    <div className="h-36 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100 sm:h-32 sm:w-32 sm:flex-shrink-0">
                      <img
                        src={productImage}
                        alt={order.product?.name || 'Product'}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/image/image.jpg';
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-bold text-gray-900">{order.product?.name || 'N/A'}</h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                        {order.product?.description || 'No description available'}
                      </p>
                      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="rounded-xl bg-gray-50 p-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Price</p>
                          <p className="mt-1 font-bold text-gray-900">{formatCurrency(order.price)}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Quantity</p>
                          <p className="mt-1 font-bold text-gray-900">{order.quantity}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Color</p>
                          <p className="mt-1 font-bold text-gray-900">{order.color || 'N/A'}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Size</p>
                          <p className="mt-1 font-bold text-gray-900">{order.size || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard icon={User} title="Customer Information">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InfoTile icon={User} label="Full Name" value={order.name} />
                    <InfoTile icon={Phone} label="Phone Number" value={order.phone} />
                    <InfoTile icon={MapPin} label="Delivery Address" value={`${order.address || 'N/A'}${order.city ? `, ${order.city}` : ''}${order.district ? `, ${order.district}` : ''}`} wide />
                    {order.user?.email && <InfoTile icon={Mail} label="Email Address" value={order.user.email} wide />}
                  </div>
                </SectionCard>

                <SectionCard icon={CreditCard} title="Payment Information">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InfoTile icon={CreditCard} label="Payment Method" value={order.payment_method} />
                    <InfoTile icon={ReceiptText} label="Payment Status" value={order.payment_status || 'N/A'} />
                    {order.transaction_id && <InfoTile icon={Hash} label="Transaction ID" value={order.transaction_id} mono />}
                    {order.transaction_uuid && <InfoTile icon={Hash} label="Transaction UUID" value={order.transaction_uuid} wide mono />}
                  </div>
                </SectionCard>
              </div>

              <aside className="space-y-6">
                <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="text-base font-bold text-gray-900">Update Status</h2>
                  <p className="mt-1 text-sm text-gray-500">Choose the latest fulfillment stage.</p>

                  <div className="mt-5 space-y-2">
                    {statuses.map((status) => {
                      const Icon = statusStyles[status].icon;
                      const isActive = currentStatus === status;
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateOrderStatus(status)}
                          disabled={updating || isActive}
                          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-70 ${
                            isActive
                              ? `${statusStyles[status].active} shadow-lg ring-2`
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Icon size={17} />
                            {status}
                          </span>
                          {isActive && <CheckCircle size={17} />}
                        </button>
                      );
                    })}
                  </div>

                  {updating && <p className="mt-4 text-center text-sm font-semibold text-gray-500">Updating status...</p>}
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="text-base font-bold text-gray-900">Order Summary</h2>
                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="font-semibold text-emerald-600">Free</span>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between">
                        <span className="text-base font-bold text-gray-900">Total</span>
                        <span className="text-lg font-black text-blue-700">{formatCurrency(totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="text-base font-bold text-gray-900">Order Timeline</h2>
                  <div className="mt-5 space-y-4">
                    {statuses.slice(0, 4).map((status, index) => {
                      const Icon = statusStyles[status].icon;
                      const isComplete = currentStatus === 'Cancelled' ? index === 0 : index <= statusIndex;
                      const isCurrent = currentStatus === status;
                      return (
                        <div key={status} className="flex gap-3">
                          <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${isComplete ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className={`font-bold ${isComplete ? 'text-gray-900' : 'text-gray-400'}`}>{status}</p>
                            <p className="text-xs text-gray-500">
                              {index === 0 && placedDate ? placedDate.toLocaleString() : isCurrent ? 'Current status' : 'Waiting'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {currentStatus === 'Cancelled' && (
                      <div className="flex gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                          <XCircle size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Cancelled</p>
                          <p className="text-xs text-gray-500">Order was cancelled</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrderInformation;
