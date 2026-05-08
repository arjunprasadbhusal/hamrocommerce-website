import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Package, Plus, Search, X, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { API_ENDPOINTS } from '../../../src/constant/api';

const initialNotification = { show: false, message: '', type: 'success' }
const initialDeleteState = { show: false, id: null, name: '' }

export default function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(initialNotification)
  const [deleteConfirm, setDeleteConfirm] = useState(initialDeleteState)
  const [filterText, setFilterText] = useState('')
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => setNotification(initialNotification), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification.show])

  useEffect(() => {
    if (location.state?.message) {
      setNotification({
        show: true,
        message: location.state.message,
        type: location.state.type || 'success',
      })
      navigate(location.pathname, { replace: true })
    }
  }, [location.pathname, location.state, navigate])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(API_ENDPOINTS.PRODUCTS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      })

      const data = await response.json()
      const sortedProducts = (data.data || []).sort((a, b) => a.id - b.id)
      setProducts(sortedProducts)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load products')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRequest = (id, name) => {
    setDeleteConfirm({ show: true, id, name })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(API_ENDPOINTS.PRODUCT_BY_ID(deleteConfirm.id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      })

      const data = await response.json()

      if (data.success) {
        setNotification({ show: true, message: 'Product deleted successfully!', type: 'success' })
        fetchProducts()
      } else {
        throw new Error(data.message || 'Failed to delete product')
      }
    } catch (err) {
      setNotification({
        show: true,
        message: err.message || 'Failed to delete product',
        type: 'error',
      })
      console.error('Error deleting product:', err)
    } finally {
      setDeleteConfirm(initialDeleteState)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm(initialDeleteState)
  }

  const handleAddNew = () => {
    navigate('/admin/products/add')
  }

  const handleEdit = (id) => {
    navigate(`/admin/products/${id}/edit`)
  }

  // Filter products based on search text
  const filteredProducts = useMemo(() => {
    if (!filterText) return products;
    
    return products.filter((product) => {
      const searchStr = filterText.toLowerCase();
      return (
        product.name?.toLowerCase().includes(searchStr) ||
        product.description?.toLowerCase().includes(searchStr) ||
        product.brand?.toLowerCase().includes(searchStr) ||
        product.category?.name?.toLowerCase().includes(searchStr) ||
        product.subcategory?.name?.toLowerCase().includes(searchStr) ||
        product.color?.toLowerCase().includes(searchStr) ||
        product.size?.toLowerCase().includes(searchStr) ||
        product.price?.toString().includes(searchStr)
      );
    });
  }, [products, filterText]);

  // Define columns for DataTable
  const columns = [
    {
      name: 'ID',
      selector: row => row.id,
      sortable: true,
      width: '70px',
    },
    {
      name: 'Image',
      cell: row => (
        row.photo_url ? (
          <img src={row.photo_url} alt={row.name} className="w-12 h-12 object-cover rounded my-1" />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center my-1">📦</div>
        )
      ),
      width: '90px',
    },
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      wrap: true,
      minWidth: '200px',
      cell: row => <div className="font-medium text-gray-900" title={row.name}>{row.name}</div>,
    },
    {
      name: 'Description',
      selector: row => row.description,
      wrap: true,
      minWidth: '250px',
      cell: row => (
        <div className="text-sm text-gray-600 py-2" title={row.description}>
          {row.description || '-'}
        </div>
      ),
    },
    {
      name: 'Price',
      selector: row => row.price,
      sortable: true,
      width: '120px',
      cell: row => <span className="text-gray-900">Rs. {parseFloat(row.price).toLocaleString()}</span>,
    },
    {
      name: 'Stock',
      selector: row => row.stock,
      sortable: true,
      width: '100px',
      cell: row => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          row.stock > 10 ? 'bg-green-100 text-green-800' :
          row.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.stock}
        </span>
      ),
    },
    {
      name: 'Color',
      selector: row => row.color || '-',
      sortable: true,
      width: '100px',
    },
    {
      name: 'Size',
      selector: row => row.size || '-',
      sortable: true,
      width: '100px',
    },
    {
      name: 'Brand',
      selector: row => row.brand || '-',
      sortable: true,
      width: '120px',
    },
    {
      name: 'Category',
      selector: row => row.category?.name || 'N/A',
      sortable: true,
      width: '130px',
    },
    {
      name: 'Subcategory',
      selector: row => row.subcategory?.name || 'N/A',
      sortable: true,
      width: '140px',
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="flex gap-2 py-2">
          <button 
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all" 
            onClick={() => handleEdit(row.id)}
            title="Edit product"
          >
            <Edit2 size={14} />
            Edit
          </button>
          <button 
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all" 
            onClick={() => handleDeleteRequest(row.id, row.name)}
            title="Delete product"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      ),
      width: '200px',
      right: true,
    },
  ];

  // Custom styles for DataTable
  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        minHeight: '48px',
      },
    },
    headCells: {
      style: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
    rows: {
      style: {
        minHeight: '64px',
        '&:hover': {
          backgroundColor: '#f9fafb',
        },
      },
    },
    cells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
  };

  const handleClearSearch = () => {
    if (filterText) {
      setResetPaginationToggle(!resetPaginationToggle);
      setFilterText('');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-2xl mx-auto mt-20">
              <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="text-red-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Products</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button 
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium shadow-lg"
                  onClick={fetchProducts}
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* Notification */}
            {notification.show && (
              <div className={`mb-4 p-4 rounded-lg border shadow-sm animate-fadeIn ${
                notification.type === 'success' 
                  ? 'bg-green-50 text-green-800 border-green-200' 
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {notification.type === 'success' ? (
                    <div className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">✓</div>
                  ) : (
                    <AlertTriangle size={20} className="text-red-600" />
                  )}
                  <span className="font-medium">{notification.message}</span>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Package className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Products</h1>
                  <p className="text-gray-500 text-sm">Manage your product inventory</p>
                </div>
              </div>
              <button 
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg shadow-blue-200"
                onClick={handleAddNew}
              >
                <Plus size={20} />
                Add Product
              </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by name, description, brand, category, color, size, or price..."
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                </div>
                {filterText && (
                  <button
                    onClick={handleClearSearch}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium border border-gray-300"
                  >
                    <X size={18} />
                    Clear
                  </button>
                )}
              </div>
              {filterText && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Found <span className="font-semibold text-blue-600">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>

            {/* DataTable */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <DataTable
                columns={columns}
                data={filteredProducts}
                pagination
                paginationResetDefaultPage={resetPaginationToggle}
                persistTableHead
                highlightOnHover
                customStyles={customStyles}
                noDataComponent={
                  <div className="py-16 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Package className="text-gray-400" size={32} />
                    </div>
                    <p className="text-gray-500 font-medium">No products found</p>
                    <p className="text-gray-400 text-sm mt-1">Start by adding your first product</p>
                  </div>
                }
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
              />
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm.show && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={cancelDelete}>
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <AlertTriangle className="text-red-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-800">Confirm Delete</h2>
                      <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={cancelDelete}>
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="mb-6 ml-16">
                    <p className="mb-2 text-gray-700">Are you sure you want to delete <strong className="text-gray-900">{deleteConfirm.name}</strong>?</p>
                    <p className="text-red-600 text-sm font-medium">⚠️ This action cannot be undone.</p>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button 
                      className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                      onClick={cancelDelete}
                    >
                      Cancel
                    </button>
                    <button 
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium shadow-lg"
                      onClick={confirmDelete}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
