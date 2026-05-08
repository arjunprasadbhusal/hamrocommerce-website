import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, DollarSign, Layers, Palette, Ruler, Tag, Image as ImageIcon, FileText, Save, X, AlertCircle } from 'lucide-react'
import Sidebar from '../Sidebar'
import Topbar from '../Topbar'
import { useAlert } from '../../../context/AlertContext'
import { API_ENDPOINTS } from '../../../src/constant/api'

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
  photopath: null,
}

export default function AddProduct() {
  const { showAlert } = useAlert()
  const [formData, setFormData] = useState(initialFormData)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [filteredSubcategories, setFilteredSubcategories] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    fetchCategoriesAndSubcategories()
  }, [])

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

  const handleChange = (event) => {
    const { name, value, files } = event.target

    if (name === "photopath") {
      const file = files[0]
      if (file && file.size > 5 * 1024 * 1024 * 1024) {
        showAlert({ type: 'error', title: 'Invalid File', message: 'Image must be less than 5GB' })
        return
      }
      setFormData((prev) => ({ ...prev, photopath: file }))
      setPhotoPreview(file ? URL.createObjectURL(file) : null)
      return
    }

    if (name === "category_id") {
      setFormData((prev) => ({ ...prev, category_id: value, subcategory_id: '' }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.name.trim()) {
      showAlert({ type: 'error', title: 'Validation Error', message: 'Product name is required' })
      return
    }

    if (!formData.price || formData.price < 0) {
      showAlert({ type: 'error', title: 'Validation Error', message: 'Valid price is required' })
      return
    }

    if (!formData.stock || formData.stock < 0) {
      showAlert({ type: 'error', title: 'Validation Error', message: 'Valid stock is required' })
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const form = new FormData()
      form.append("name", formData.name)
      form.append("description", formData.description || '')
      form.append("price", formData.price)
      form.append("stock", formData.stock)
      if (formData.color) form.append("color", formData.color)
      if (formData.size) form.append("size", formData.size)
      if (formData.category_id) form.append("category_id", formData.category_id)
      if (formData.subcategory_id) form.append("subcategory_id", formData.subcategory_id)
      if (formData.brand) form.append("brand", formData.brand)
      if (formData.photopath) form.append("photopath", formData.photopath)

      const response = await fetch(API_ENDPOINTS.PRODUCTS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: form
      })

      const data = await response.json()

      if (data.success) {
        showAlert({ type: 'success', title: 'Success', message: 'Product added successfully!' })
        navigate('/admin/products')
      } else {
        throw new Error(data.message || 'Failed to add product')
      }
    } catch (err) {
      showAlert({ type: 'error', title: 'Error', message: err.message || 'Failed to add product' })
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => navigate('/admin/products')

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
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Package className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Add New Product</h2>
                  <p className="text-gray-500 text-sm">Create a new product listing</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Variants & Details Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Palette size={20} className="text-blue-600" />
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    />
                  </div>
                </div>
              </div>

              {/* Category Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Layers size={20} className="text-blue-600" />
                  Category & Classification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select 
                      name="category_id" 
                      value={formData.category_id} 
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  <ImageIcon size={20} className="text-blue-600" />
                  Product Image
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <ImageIcon size={16} className="text-gray-500" />
                    Upload Image <span className="text-gray-400 text-xs">(Max 5GB)</span>
                  </label>
                  <input 
                    type="file" 
                    name="photopath" 
                    accept="image/*" 
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                  />
                  {photoPreview && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
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
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-blue-200"
                >
                  <Save size={18} />
                  {submitting ? 'Adding Product...' : 'Add Product'}
                </button>
              </div>

              {/* Required Fields Note */}
              <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
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
