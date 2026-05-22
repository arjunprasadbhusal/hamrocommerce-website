import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { API_ENDPOINTS } from '../../src/constant/api';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Rectangle
} from 'recharts';
import { 
  Package, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  FileText, 
  Image as ImageIcon, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  AlertTriangle,
  ChevronRight,
  Plus
} from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalBlogs: number;
  totalBanners: number;
  recentOrders: Array<{
    id: number;
    user_name: string;
    total: number;
    status: string;
    created_at: string;
  }>;
  lowStockProducts: Array<{
    id: number;
    name: string;
    stock: number;
  }>;
  topOrderedProducts: Array<{
    name: string;
    value: number;
  }>;
  ordersOverTime: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [minLoadingTime, setMinLoadingTime] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchDashboardData(token);
    
    const minTimer = setTimeout(() => {
      setMinLoadingTime(false);
    }, 1000);

    return () => clearTimeout(minTimer);
  }, [navigate]);

  const handleGenerateReport = () => {
    if (!stats) return;
    
    setIsGeneratingReport(true);
    
    // Simulate generation time for UX
    setTimeout(() => {
      try {
        // Create CSV content
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Dashboard Summary
        csvContent += "DASHBOARD SUMMARY\n";
        csvContent += `Report Generated,${new Date().toLocaleString()}\n`;
        csvContent += `Total Revenue,Rs. ${stats.totalRevenue}\n`;
        csvContent += `Total Orders,${stats.totalOrders}\n`;
        csvContent += `Total Products,${stats.totalProducts}\n`;
        csvContent += `Total Users,${stats.totalUsers}\n\n`;
        
        // Recent Orders Section
        csvContent += "RECENT ORDERS\n";
        csvContent += "Order ID,Customer,Amount,Status,Date\n";
        stats.recentOrders.forEach(order => {
          csvContent += `${order.id},"${order.user_name}",${order.total},${order.status},${new Date(order.created_at).toLocaleDateString()}\n`;
        });
        
        // Download logic
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `hamro_commerce_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
      } catch (error) {
        console.error("Report generation failed:", error);
        alert("Failed to generate report. Please try again.");
      } finally {
        setIsGeneratingReport(false);
      }
    }, 1500);
  };

  const fetchDashboardData = async (token: string) => {
    const maxLoadingTimer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    try {
      const response = await fetch(API_ENDPOINTS.DASHBOARD, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
        clearTimeout(maxLoadingTimer);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      clearTimeout(maxLoadingTimer);
      setLoading(false);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'processing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading || minLoadingTime) {
    return <LoadingSpinner />;
  }

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview Dashboard</h1>
              <div className="flex items-center gap-2 mt-1 text-slate-500">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{currentDate}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <button 
                onClick={() => navigate('/admin/products')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
               >
                 <Plus className="w-4 h-4" />
                 Add Product
               </button>
               <button 
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
               >
                 {isGeneratingReport ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 ) : (
                   <FileText className="w-4 h-4" />
                 )}
                 {isGeneratingReport ? 'Generating...' : 'Generate Report'}
               </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
            {/* Revenue Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">
                  <TrendingUp className="w-3 h-3" />
                  +12.5%
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Revenue</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-black text-slate-900">Rs. {stats?.totalRevenue?.toLocaleString() || 0}</h3>
                  <span className="text-slate-400 text-xs font-medium">this month</span>
                </div>
              </div>
            </div>

            {/* Orders Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-xs font-bold">
                  <ArrowUpRight className="w-3 h-3" />
                  +8.2%
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Orders</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-black text-slate-900">{stats?.totalOrders || 0}</h3>
                  <span className="text-slate-400 text-xs font-medium">completed</span>
                </div>
              </div>
            </div>

            {/* Products Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <Package className="w-6 h-6" />
                </div>
                <button onClick={() => navigate('/admin/products')} className="text-indigo-600 hover:underline text-xs font-bold flex items-center gap-1">
                  View All <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Active Products</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-black text-slate-900">{stats?.totalProducts || 0}</h3>
                  <span className="text-slate-400 text-xs font-medium">in catalog</span>
                </div>
              </div>
            </div>

            {/* Users Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded-lg text-xs font-bold">
                  <ArrowDownRight className="w-3 h-3" />
                  -2.4%
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Customers</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-black text-slate-900">{stats?.totalUsers || 0}</h3>
                  <span className="text-slate-400 text-xs font-medium">registered</span>
                </div>
              </div>
            </div>

            {/* Blogs Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors duration-300">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Blog Posts</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-black text-slate-900">{stats?.totalBlogs || 0}</h3>
                  <span className="text-slate-400 text-xs font-medium">published</span>
                </div>
              </div>
            </div>

            {/* Banners Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                  <ImageIcon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Active Banners</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-black text-slate-900">{stats?.totalBanners || 0}</h3>
                  <span className="text-slate-400 text-xs font-medium">promoting</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
            {/* Area Chart - Revenue Trend */}
            <div className="xl:col-span-8 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Revenue Analysis</h3>
                  <p className="text-slate-400 text-sm font-medium">Performance over the last 7 days</p>
                </div>
                <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-600 outline-none cursor-pointer">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
              
              <div className="h-[350px] w-full">
                {stats?.ordersOverTime && stats.ordersOverTime.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.ordersOverTime}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                        name="Revenue"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <TrendingUp className="w-16 h-16 mb-2 opacity-20" />
                    <p className="font-bold">No performance data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Popular Categories - Bar Chart */}
            <div className="xl:col-span-4 bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">Popular Categories</h3>
                <p className="text-slate-400 text-sm font-medium">Order volume by category</p>
              </div>
              
              <div className="flex-1 min-h-[300px] w-full">
                {stats?.topOrderedProducts && stats.topOrderedProducts.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.topOrderedProducts}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                        width={80}
                      />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar 
                        dataKey="value" 
                        radius={[0, 10, 10, 0]} 
                        barSize={20}
                      >
                        {stats.topOrderedProducts.map((entry, index) => {
                          const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];
                          return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <Package className="w-16 h-16 mb-2 opacity-20" />
                    <p className="font-bold">No category data</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Recent Orders Table */}
            <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Recent Transactions</h3>
                <button 
                  onClick={() => navigate('/admin/orders')}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700"
                >
                  View All Orders
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-50/50">
                      <th className="px-8 py-4">Customer</th>
                      <th className="px-8 py-4">Date</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                      stats.recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => navigate('/admin/orders')}>
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs uppercase">
                                {order.user_name.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-700 text-sm">{order.user_name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-4 text-slate-500 text-sm font-medium">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyles(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-right font-black text-slate-900 text-sm">
                            Rs. {order.total.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-8 py-10 text-center text-slate-400 font-bold italic">
                          No recent transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Low Stock Panel */}
            <div className="lg:col-span-4 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col">
              <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  <h3 className="text-xl font-bold text-slate-900">Inventory Alert</h3>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-auto">
                {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                  <div className="space-y-3">
                    {stats.lowStockProducts.map((product) => (
                      <div key={product.id} className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-between group hover:bg-rose-100 transition-colors cursor-pointer" onClick={() => navigate('/admin/products')}>
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-500 shadow-sm">
                              <Package className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="font-bold text-slate-800 text-sm line-clamp-1">{product.name}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ref ID: #{product.id}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className="block text-sm font-black text-rose-600">{product.stock} Units</span>
                           <span className="text-[10px] text-rose-400 font-bold uppercase tracking-tighter animate-pulse">Low Stock</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-500 mb-4">
                       <BadgeCheck className="w-8 h-8" />
                    </div>
                    <p className="font-bold text-slate-800">Inventory Secure</p>
                    <p className="text-slate-400 text-xs mt-1">All products are currently well-stocked.</p>
                  </div>
                )}
              </div>
              <div className="p-6 bg-slate-50/50 rounded-b-3xl">
                 <button 
                  onClick={() => navigate('/admin/products')}
                  className="w-full py-3 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                 >
                   Inventory Management
                   <ChevronRight className="w-4 h-4" />
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for empty state
const BadgeCheck = ({className}: {className?: string}) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default Dashboard;
