import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, Image as ImageIcon, AlertTriangle, X } from 'lucide-react';
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import { useAlert } from '../../../context/AlertContext';
import { TESTIMONIAL_ENDPOINTS } from '../../../src/constants/api/testimonial.js';
import { BASE_URL } from '../../../src/constant/api';

const getImageUrl = (imagePath) => {
	if (!imagePath) return null;
	return imagePath.startsWith('http')
		? imagePath
		: `${BASE_URL}/storage/${imagePath}`;
};

export default function Testimoniallist() {
	const { showAlert } = useAlert();
	const [testimonials, setTestimonials] = useState([]);
	const [loading, setLoading] = useState(true);
	const [deleting, setDeleting] = useState(null);
	const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: '' });

	useEffect(() => {
		loadTestimonials();
	}, []);

	const buildHeaders = () => {
		const token = localStorage.getItem('token');
		return token
			? { Accept: 'application/json', Authorization: `Bearer ${token}` }
			: { Accept: 'application/json' };
	};

	const loadTestimonials = async () => {
		try {
			setLoading(true);
			const response = await fetch(TESTIMONIAL_ENDPOINTS.GET_ALL, {
				headers: buildHeaders(),
			});
			const data = await response.json();
			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Failed to load testimonials');
			}
			const sorted = (data.data || []).sort((a, b) => a.id - b.id);
			setTestimonials(sorted);
		} catch (err) {
			showAlert({ type: 'error', title: 'Error', message: err.message || 'Failed to load testimonials' });
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteRequest = (id, name) => {
		setDeleteConfirm({ show: true, id, name });
	};

	const confirmDelete = async () => {
		if (!deleteConfirm.id) return;

		setDeleting(deleteConfirm.id);
		try {
			const response = await fetch(TESTIMONIAL_ENDPOINTS.DELETE(deleteConfirm.id), {
				method: 'DELETE',
				headers: buildHeaders(),
			});
			const data = await response.json();
			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Failed to delete testimonial');
			}
			showAlert({ type: 'success', title: 'Success', message: 'Testimonial deleted successfully!' });
			setDeleteConfirm({ show: false, id: null, name: '' });
			await loadTestimonials();
		} catch (err) {
			showAlert({ type: 'error', title: 'Error', message: err.message || 'Failed to delete testimonial' });
		} finally {
			setDeleting(null);
		}
	};

	return (
		<div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
			<Sidebar />
			<div className="flex-1 flex flex-col overflow-hidden">
				<Topbar />
				<div className="flex-1 overflow-auto p-8">
					<div className="max-w-7xl mx-auto">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-indigo-600 rounded-lg">
									<ImageIcon className="text-white" size={28} />
								</div>
								<div>
									<h1 className="text-3xl font-bold text-gray-800">Testimonial Management</h1>
									<p className="text-gray-500 text-sm">Manage customer testimonials</p>
								</div>
							</div>
							<Link
								to="/admin/testimonials/add"
								className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all font-medium shadow-lg shadow-indigo-200"
							>
								<Plus size={20} />
								Add Testimonial
							</Link>
						</div>

						<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
							{loading ? (
								<div className="text-center py-16">
									<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
									<p className="mt-4 text-gray-600 font-medium">Loading testimonials...</p>
								</div>
							) : testimonials.length === 0 ? (
								<div className="text-center py-16">
									<ImageIcon size={48} className="mx-auto text-gray-400 mb-3" />
									<p className="text-gray-600 text-lg font-medium">No testimonials found</p>
									<p className="text-gray-400 text-sm mt-1">Create your first testimonial to get started</p>
								</div>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
											<tr>
												<th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
												<th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Photo</th>
												<th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
												<th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
												<th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
												<th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Created</th>
												<th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-200">
											{testimonials.map((item) => (
												<tr key={item.id} className="hover:bg-gray-50 transition-colors">
													<td className="px-4 py-4">
														<span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-semibold">
															#{item.id}
														</span>
													</td>
													<td className="px-4 py-4">
														{item.photopath ? (
															<img
																src={getImageUrl(item.photopath)}
																alt={item.title}
																className="w-24 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
															/>
														) : (
															<div className="w-24 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
																<ImageIcon size={20} className="text-gray-400" />
															</div>
														)}
													</td>
													<td className="px-4 py-4">
														<span className="text-sm font-semibold text-gray-800">{item.name}</span>
													</td>
													<td className="px-4 py-4">
														<span className="text-sm text-gray-700">{item.title}</span>
													</td>
													<td className="px-4 py-4">
														<span className="text-sm text-gray-600">
															{(item.description || '').length > 80
																? `${item.description.slice(0, 80)}...`
																: item.description}
														</span>
													</td>
													<td className="px-4 py-4 text-center">
														<span className="text-sm text-gray-500">
															{new Date(item.created_at).toLocaleDateString()}
														</span>
													</td>
													<td className="px-4 py-4">
														<div className="flex gap-2 justify-center">
															<Link
																to={`/admin/testimonials/${item.id}/edit`}
																className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
																title="Edit testimonial"
															>
																<Pencil size={18} />
															</Link>
															<button
																onClick={() => handleDeleteRequest(item.id, item.name)}
																disabled={deleting === item.id}
																className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
																title="Delete testimonial"
															>
																<Trash2 size={18} />
															</button>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</div>
					</div>
					{deleteConfirm.show && (
						<>
							<div
								className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
								onClick={() => setDeleteConfirm({ show: false, id: null, name: '' })}
							/>
							<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
								<div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slideIn">
									<button
										onClick={() => setDeleteConfirm({ show: false, id: null, name: '' })}
										className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
									>
										<X size={24} />
									</button>
									<div className="flex flex-col items-center text-center gap-3 mb-4">
										<div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
											<AlertTriangle className="text-red-600" size={24} />
										</div>
										<h3 className="text-xl font-bold text-gray-900">Confirm Delete</h3>
									</div>
									<div className="mb-6 text-center">
										<p className="text-gray-600 mb-2">
											Are you sure you want to delete <strong className="text-gray-900">{deleteConfirm.name}</strong>?
										</p>
										<p className="text-red-600 text-sm font-medium flex items-center justify-center gap-2">
											<AlertTriangle size={16} />
											This action cannot be undone.
										</p>
									</div>
									<div className="flex gap-3 justify-center">
										<button
											onClick={() => setDeleteConfirm({ show: false, id: null, name: '' })}
											className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
										>
											Cancel
										</button>
										<button
											onClick={confirmDelete}
											className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg shadow-red-200"
										>
											Delete
										</button>
									</div>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
