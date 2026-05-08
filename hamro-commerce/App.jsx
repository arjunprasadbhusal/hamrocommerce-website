import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AlertProvider, useAlert } from './context/AlertContext';
import { LanguageProvider } from './context/LanguageContext';
import { Toast } from './components/alert';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load all pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const About = lazy(() => import('./pages/About'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Cart = lazy(() => import('./pages/Cart'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Contact = lazy(() => import('./pages/Contact'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const EsewaSuccess = lazy(() => import('./pages/EsewaSuccess'));
const EsewaFailure = lazy(() => import('./pages/EsewaFailure'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const Profile = lazy(() => import('./pages/admin/Profile'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const Notifications = lazy(() => import('./pages/admin/Notifications'));
const ProductList = lazy(() => import('./pages/admin/Products/ProductLIst'));
const AddProduct = lazy(() => import('./pages/admin/Products/AddProduct'));
const EditProduct = lazy(() => import('./pages/admin/Products/EditProduct'));
const EditCategory = lazy(() => import('./pages/admin/categories/EditCategory'));
const CategoryList = lazy(() => import('./pages/admin/categories/CategoryList'));
const AddCategory = lazy(() => import('./pages/admin/categories/AddCategory'));
const SubcategoryList = lazy(() => import('./pages/admin/subcategory/SubcategoryList'));
const AddSubcategory = lazy(() => import('./pages/admin/subcategory/AddSubcategory'));
const EditSubcategory = lazy(() => import('./pages/admin/subcategory/EditSubcategory'));
const OrderList = lazy(() => import('./pages/admin/orders/OrderList'));
const OrderInformation = lazy(() => import('./pages/admin/orders/OrderInformation'));
const VedioList = lazy(() => import('./pages/admin/vedios/VedioList'));
const AddVedio = lazy(() => import('./pages/admin/vedios/AddVedio'));
const EditVedio = lazy(() => import('./pages/admin/vedios/EditVedio'));
const BlogList = lazy(() => import('./pages/admin/blogs/Bloglist'));
const AddBlog = lazy(() => import('./pages/admin/blogs/Addblog'));
const EditBlog = lazy(() => import('./pages/admin/blogs/Editblog'));
const BannerList = lazy(() => import('./pages/admin/banners/Bannerlist'));
const AddBanner = lazy(() => import('./pages/admin/banners/Addbanner'));
const EditBanner = lazy(() => import('./pages/admin/banners/Editbanner'));
const UserList = lazy(() => import('./pages/admin/users/Userlist'));
const MessageList = lazy(() => import('./pages/admin/messages/Messagelist'));

const AppContent = () => {
  const { alerts, removeAlert } = useAlert();
  
  return (
    <>
      <Toast alerts={alerts} removeAlert={removeAlert} />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes with Layout */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/shop" element={<Layout><Shop /></Layout>} />
          <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/blog" element={<Layout><Blog /></Layout>} />
          <Route path="/blog/:id" element={<Layout><BlogDetail /></Layout>} />
          <Route path="/gallery" element={<Layout><Gallery /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/cart" element={<Layout><Cart /></Layout>} />
          <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
          <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
          <Route path="/order-success" element={<Layout><OrderSuccess /></Layout>} />
          
          {/* eSewa Payment Routes without Layout */}
          <Route path="/esewa/success" element={<EsewaSuccess />} />
          <Route path="/esewa/failure" element={<EsewaFailure />} />

          {/* Auth Routes with Layout */}
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/register" element={<Layout><Register /></Layout>} />

          {/* Admin Routes without Layout */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/profile" element={<Profile />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/notifications" element={<Notifications />} />
          <Route path="/admin/products" element={<ProductList />} />
          <Route path="/admin/products/add" element={<AddProduct />} />
          <Route path="/admin/products/:id/edit" element={<EditProduct />} />

          <Route path="/admin/categories" element={<CategoryList />} />
          <Route path="/admin/categories/add" element={<AddCategory />} />
          <Route path="/admin/categories/:id/edit" element={<EditCategory />} />

          <Route path="/admin/subcategories" element={<SubcategoryList />} />
          <Route path="/admin/subcategories/add" element={<AddSubcategory />} />
          <Route path="/admin/subcategories/:id/edit" element={<EditSubcategory />} />  

          <Route path="/admin/orders" element={<OrderList />} />
          <Route path="/admin/orders/:id" element={<OrderInformation />} />

          <Route path="/admin/vedios" element={<VedioList />} />
          <Route path="/admin/vedios/add" element={<AddVedio />} />
          <Route path="/admin/vedios/:id/edit" element={<EditVedio />} />

          <Route path="/admin/blogs" element={<BlogList />} />
          <Route path="/admin/blogs/add" element={<AddBlog />} />
          <Route path="/admin/blogs/:id/edit" element={<EditBlog />} />

          <Route path="/admin/banners" element={<BannerList />} />
          <Route path="/admin/banners/add" element={<AddBanner />} />
          <Route path="/admin/banners/:id/edit" element={<EditBanner />} />

          <Route path="/admin/users" element={<UserList />} />
          <Route path="/admin/messages" element={<MessageList />} />
        </Routes>
      </Suspense>
      </>
  );
};

const App = () => {
  return (
    <LanguageProvider>
      <AlertProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <ScrollToTop />
              <AppContent />
            </Router>
          </WishlistProvider>
        </CartProvider>
      </AlertProvider>
    </LanguageProvider>
  );
};

export default App;