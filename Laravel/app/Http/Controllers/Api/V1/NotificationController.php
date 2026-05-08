<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product;
use App\Models\Message;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated admin user
     */
    public function index(Request $request)
    {
        try {
            $notifications = [];
            
            // Get new orders (last 24 hours)
            $newOrders = Order::where('created_at', '>=', now()->subDay())
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();
            
            foreach ($newOrders as $order) {
                $notifications[] = [
                    'id' => 'order-' . $order->id,
                    'type' => 'order',
                    'title' => 'New Order #' . $order->id,
                    'message' => 'New order received from ' . ($order->user->name ?? 'Guest'),
                    'time' => $this->getTimeAgo($order->created_at),
                    'read' => false,
                    'link' => '/admin/orders/' . $order->id,
                ];
            }
            
            // Get low stock products
            $lowStockProducts = Product::where('stock', '<=', 10)
                ->where('stock', '>', 0)
                ->orderBy('stock', 'asc')
                ->take(5)
                ->get();
            
            foreach ($lowStockProducts as $product) {
                $notifications[] = [
                    'id' => 'stock-' . $product->id,
                    'type' => 'stock',
                    'title' => 'Low Stock Alert',
                    'message' => $product->name . ' has only ' . $product->stock . ' items left',
                    'time' => 'Now',
                    'read' => false,
                    'link' => '/admin/products/' . $product->id . '/edit',
                ];
            }
            
            // Get unread messages (last 7 days)
            $unreadMessages = Message::where('status', 'Unread')
                ->where('created_at', '>=', now()->subDays(7))
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();
            
            foreach ($unreadMessages as $message) {
                $notifications[] = [
                    'id' => 'message-' . $message->id,
                    'type' => 'message',
                    'title' => 'New Message',
                    'message' => 'Message from ' . $message->name . ': ' . substr($message->message, 0, 50) . '...',
                    'time' => $this->getTimeAgo($message->created_at),
                    'read' => false,
                    'link' => '/admin/messages',
                ];
            }
            
            // Sort by time (most recent first)
            usort($notifications, function($a, $b) {
                return strcmp($b['time'], $a['time']);
            });
            
            // Limit to 10 notifications
            $notifications = array_slice($notifications, 0, 10);

            return response()->json([
                'success' => true,
                'notifications' => $notifications,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve notifications',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead(Request $request, $id)
    {
        try {
            // For now, just return success
            // In a real app, you'd store read status in database
            
            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as read',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        try {
            // For now, just return success
            // In a real app, you'd update all notifications in database
            
            return response()->json([
                'success' => true,
                'message' => 'All notifications marked as read',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark all notifications as read',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Helper function to get time ago string
     */
    private function getTimeAgo($datetime)
    {
        $now = now();
        $diffInSeconds = $now->diffInSeconds($datetime);
        $diffInMinutes = $now->diffInMinutes($datetime);
        $diffInHours = $now->diffInHours($datetime);
        $diffInDays = $now->diffInDays($datetime);

        if ($diffInSeconds < 60) {
            return 'Just now';
        } elseif ($diffInMinutes < 60) {
            return $diffInMinutes . ' minute' . ($diffInMinutes > 1 ? 's' : '') . ' ago';
        } elseif ($diffInHours < 24) {
            return $diffInHours . ' hour' . ($diffInHours > 1 ? 's' : '') . ' ago';
        } elseif ($diffInDays < 7) {
            return $diffInDays . ' day' . ($diffInDays > 1 ? 's' : '') . ' ago';
        } else {
            return $datetime->format('M d, Y');
        }
    }
}
