import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import { useAlert } from '../../../context/AlertContext';
import { LEADERSHIP_ENDPOINTS } from '../../../src/constants/api/leadership.js';

const getImageUrl = (imagePath) => {
	if (!imagePath) return null;
	return imagePath.startsWith('http')
		? imagePath
		: `http://192.168.1.64:8000/storage/${imagePath}`;
};

export default function Leadershiplist() {
	const { showAlert } = useAlert();
	const [leaders, setLeaders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [deleting, setDeleting] = useState(null);

	useEffect(() => {
		loadLeaderships();
	}, []);

	const buildHeaders = () => {
		const token = localStorage.getItem('token');
		return token
			? { Accept: 'application/json', Authorization: `Bearer ${token}` }
			: { Accept: 'application/json' };
	};

	const loadLeaderships = async () => {
		try {
			setLoading(true);
			const response = await fetch(LEADERSHIP_ENDPOINTS.GET_ALL, {
				headers: buildHeaders(),
			});
			const data = await response.json();
			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Failed to load leaderships');
			}
			const sorted = (data.data || []).sort((a, b) => a.id - b.id);
			setLeaders(sorted);
		} catch (err) {
			showAlert({ type: 'error', title: 'Error', message: err.message || 'Failed to load leaderships' });
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm('Are you sure you want to delete this leader?')) return;

		setDeleting(id);
		try {
			const response = await fetch(LEADERSHIP_ENDPOINTS.DELETE(id), {
				method: 'DELETE',
				headers: buildHeaders(),
			});
			const data = await response.json();
			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Failed to delete leader');
			}
			showAlert({ type: 'success', title: 'Success', message: 'Leader deleted successfully!' });
			await loadLeaderships();
		} catch (err) {
			showAlert({ type: 'error', title: 'Error', message: err.message || 'Failed to delete leader' });
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
								<div className="p-2 bg-emerald-600 rounded-lg">
									<ImageIcon className="text-white" size={28} />
								</div>
								<div>
									<h1 className="text-3xl font-bold text-gray-800">Leadership Management</h1>
									<p className="text-gray-500 text-sm">Manage leadership team entries</p>
								</div>
							</div>
							<Link
								to="/admin/leaderships/add"
								className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all font-medium shadow-lg shadow-emerald-200"
							>
								<Plus size={20} />
								Add Leader
							</Link>
						</div>

						<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
							{loading ? (
								<div className="text-center py-16">
									<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
									<p className="mt-4 text-gray-600 font-medium">Loading leaderships...</p>
								</div>
							) : leaders.length === 0 ? (
								<div className="text-center py-16">
									<ImageIcon size={48} className="mx-auto text-gray-400 mb-3" />
									<p className="text-gray-600 text-lg font-medium">No leaders found</p>
									<p className="text-gray-400 text-sm mt-1">Create your first leader to get started</p>
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
												<th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Created</th>
												<th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-200">
											{leaders.map((item) => (
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
																alt={item.name}
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
													<td className="px-4 py-4 text-center">
														<span className="text-sm text-gray-500">
															{new Date(item.created_at).toLocaleDateString()}
														</span>
													</td>
													<td className="px-4 py-4">
														<div className="flex gap-2 justify-center">
															<Link
																to={`/admin/leaderships/${item.id}/edit`}
																className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
																title="Edit leader"
															>
																<Pencil size={18} />
															</Link>
															<button
																onClick={() => handleDelete(item.id)}
																disabled={deleting === item.id}
																className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
																title="Delete leader"
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
				</div>
			</div>
		</div>
	);
}
