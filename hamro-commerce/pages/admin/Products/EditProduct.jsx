import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package, DollarSign, Layers, Palette, Ruler, Tag, Image as ImageIcon, FileText, Save, X, AlertCircle, Edit } from 'lucide-react';
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useAlert } from '../../../context/AlertContext';
import { API_ENDPOINTS } from '../../../src/constant/api';

const initialFormData = {
  name: '',
  description: '',
  price: '',
  stock: '',
  color: '',
  size: '',
  category_id: '',
  subcategory_id: '',
  brand: '',
}

export default function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showAlert } = useAlert()

  const [formData, setFormData] = useState(initialFormData)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [filteredSubcategories, setFilteredSubcategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCategoriesAndSubcategories()
    loadProduct()
  }, [id])

  useEffect(() => {
    if (formData.category_id) {
      const filtered = subcategories.filter(sub => sub.category_id === parseInt(formData.category_id))
      console.log('Selected category:', formData.category_id)
      console.log('Filtered subcategories:', filtered)
      setFilteredSubcategories(filtered)
    } else {
      setFilteredSubcategories([])
    }
  }, [formData.category_id, subcategories])

  const fetchCategoriesAndSubcategories = async () => {
    try {
      const token = localStorage.getItem('token')
      const [catResponse, subCatResponse] = await Promise.all([
        fetch(API_ENDPOINTS.CATEGORIES, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        }),
        fetch(API_ENDPOINTS.SUBCATEGORIES, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        })
      ])
      const catData = await catResponse.json()
      const subCatData = await subCatResponse.json()
      console.log('Categories:', catData.data)
      console.log('Subcategories:', subCatData.data)
      setCategories(catData.data || [])
      setSubcategories(subCatData.data || [])
    } catch (err) {
      console.error('Failed to load categories/subcategories:', err)
    }
  }

  const loadProduct = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(API_ENDPOINTS.PRODUCT_BY_ID(id), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      })
      const data = await response.json()

      if (data.success) {
        const product = data.data
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || '',
          stock: product.stock || '',
          color: product.color || '',
          size: product.size || '',
          category_id: product.category_id || '',
          subcategory_id: product.subcategory_id || '',
          brand: product.brand || '',
        })
        setPhotoPreview(product.photo_url || '')
      } else {
        showAlert({ type: 'error', title: 'Error', message: 'Failed to load product' })
      }
    } catch (err) {
      showAlert({ type: 'error', title: 'Error', message: 'Failed to load product' })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === "category_id") {
      setFormData({ ...formData, category_id: value, subcategory_id: '' })
      return
    }
    
    setFormData({ ...formData, [name]: value })
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      return showAlert({ type: 'error', title: 'Invalid File', message: 'Please upload a valid image' })
    }

    if (file.size > 5 * 1024 * 1024 * 1024) {
      return showAlert({ type: 'error', title: 'File Too Large', message: 'Image must be smaller than 5GB' })
    }

    const url = URL.createObjectURL(file)
    setPhotoFile(file)
    setPhotoPreview(url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      return showAlert({ type: 'error', title: 'Validation Error', message: 'Product name is required' })
    }

    if (!formData.price || formData.price < 0) {
      return showAlert({ type: 'error', title: 'Validation Error', message: 'Valid price is required' })
    }

    if (!formData.stock || formData.stock < 0) {
      return showAlert({ type: 'error', title: 'Validation Error', message: 'Valid stock is required' })
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const form = new FormData()
      form.append('name', formData.name)
      form.append('description', formData.description || '')
      form.append('price', formData.price)
      form.append('stock', formData.stock)
      if (formData.color) form.append('color', formData.color)
      if (formData.size) form.append('size', formData.size)
      if (formData.category_id) form.append('category_id', formData.category_id)
      if (formData.subcategory_id) form.append('subcategory_id', formData.subcategory_id)
      if (formData.brand) form.append('brand', formData.brand)
      if (photoFile) form.append('photopath', photoFile)
      form.append('_method', 'PUT');

      const response = await fetch(API_ENDPOINTS.PRODUCT_BY_ID(id), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: form
      })

      const data = await response.json()

      if (data.success) {
        showAlert({ type: 'success', title: 'Success', message: 'Product updated successfully!' })
        navigate('/admin/products')
      } else {
        throw new Error(data.message || 'Failed to update product')
      }
    } catch (err) {
      showAlert({ type: 'error', title: 'Error', message: err.message || 'Failed to update product' })
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-600 rounded-lg">
                  <Edit className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Edit Product</h2>
                  <p className="text-gray-500 text-sm">Update product information</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-green-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Package size={16} className="text-gray-500" />
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required 
                      placeholder="Enter product name"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <DollarSign size={16} className="text-gray-500" />
                      Price (NPR) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      name="price" 
                      value={formData.price} 
                      onChange={handleChange} 
                      required 
                      min="0" 
                      step="0.01" 
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Layers size={16} className="text-gray-500" />
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      name="stock" 
                      value={formData.stock} 
                      onChange={handleChange} 
                      required 
                      min="0"
                      placeholder="0"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FileText size={16} className="text-gray-500" />
                      Description
                    </label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      rows="4" 
                      placeholder="Enter product description..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Variants & Details Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Palette size={20} className="text-green-600" />
                  Product Variants & Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Palette size={16} className="text-gray-500" />
                      Color
                    </label>
                    <input 
                      type="text" 
                      name="color" 
                      value={formData.color} 
                      onChange={handleChange} 
                      placeholder="e.g., Black, Blue, Red"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Ruler size={16} className="text-gray-500" />
                      Size
                    </label>
                    <input 
                      type="text" 
                      name="size" 
                      value={formData.size} 
                      onChange={handleChange} 
                      placeholder="e.g., XL, XXL, 64GB, 128GB"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Tag size={16} className="text-gray-500" />
                      Brand
                    </label>
                    <input 
                      type="text" 
                      name="brand" 
                      value={formData.brand} 
                      onChange={handleChange} 
                      placeholder="e.g., Nike, Apple, Samsung"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                    />
                  </div>
                </div>
              </div>

              {/* Category Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Layers size={20} className="text-green-600" />
                  Category & Classification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select 
                      name="category_id" 
                      value={formData.category_id} 
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                    <select 
                      name="subcategory_id" 
                      value={formData.subcategory_id} 
                      onChange={handleChange}
                      disabled={!formData.category_id}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">{formData.category_id ? 'Select Subcategory' : 'Select Category First'}</option>
                      {filteredSubcategories.map(subcat => <option key={subcat.id} value={subcat.id}>{subcat.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Image Upload Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <ImageIcon size={20} className="text-green-600" />
                  Product Image
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <ImageIcon size={16} className="text-gray-500" />
                    Upload New Image <span className="text-gray-400 text-xs">(Max 5GB, leave empty to keep current)</span>
                  </label>
                  <input 
                    type="file" 
                    name="photopath" 
                    accept="image/*" 
                    onChange={handlePhotoChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" 
                  />
                  {photoPreview && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Current/Preview:</p>
                      <img 
                        src={photoPreview} 
                        alt="Product" 
                        className="w-32 h-32 object-cover rounded-lg shadow-md border-2 border-gray-200" 
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => navigate('/admin/products')}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-green-200"
                >
                  <Save size={18} />
                  {submitting ? 'Updating Product...' : 'Update Product'}
                </button>
              </div>

              {/* Required Fields Note */}
              <div className="flex items-start gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <AlertCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-800">
                  <span className="font-semibold">Note:</span> Fields marked with <span className="text-red-500">*</span> are required.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
