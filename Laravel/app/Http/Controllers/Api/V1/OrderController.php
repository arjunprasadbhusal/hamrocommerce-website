<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;

class OrderController extends Controller
{
    /**
     * Store a new order.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'price' => 'required|numeric',
            'quantity' => 'required|integer|min:1',
            'payment_method' => 'required|string',
            'name' => 'required|string',
            'phone' => 'required|string',
            'address' => 'required|string',
            'city' => 'nullable|string',
            'district' => 'nullable|string',
            'cart_id' => 'nullable|exists:carts,id',
            'transaction_id' => 'nullable|string',
            'transaction_uuid' => 'nullable|string',
            'payment_status' => 'nullable|string|in:pending,completed,failed',
            'color' => 'nullable|string',
            'size' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $data = $validator->validated();
        $data['user_id'] = auth()->user()->id;
        $data['status'] = 'Pending';
        
        // Set default payment status if not provided
        if (!isset($data['payment_status'])) {
            $data['payment_status'] = 'pending';
        }
        
        // Check stock availability
        $product = Product::find($data['product_id']);
        if ($product->stock < $data['quantity']) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient stock. Only ' . $product->stock . ' units available.'
            ], 400);
        }
        
        $order = Order::create($data);
        
        // Decrease product stock
        $product->stock -= $data['quantity'];
        $product->save();
        
        // Delete cart item if cart_id provided
        if ($request->cart_id) {
            Cart::find($request->cart_id)->delete();
        }
        
        // Load relationships for email
        $order->load(['product', 'user']);
        
        // Send order confirmation email to user
        try {
            Mail::send('emails.order-placed', ['order' => $order], function ($message) use ($order) {
                $message->to($order->user->email, $order->user->name)
                       ->subject('Order Confirmation - Hamro-commerce');
            });
        } catch (\Exception $e) {
            // Log error but don't fail the order
            Log::error('Failed to send order email: ' . $e->getMessage());
        }

        Cache::forget('orders_all_admin');
        Cache::forget('orders_overview');
        Cache::forget('dashboard_index');
        Cache::forget('dashboard_sales');
        Cache::forget('dashboard_users');
        Cache::forget('dashboard_products');
        Cache::forget('orders_user_' . $data['user_id']);
        
        return response()->json([
            'success' => true,
            'message' => 'Order has been placed successfully',
            'order' => $order
        ], 201);
    }
    
    /**
     * Get all orders.
     */
    public function index()
    {
        $orders = Cache::remember('orders_all_admin', 15, function () {
            return Order::with([
                    'user:id,name,email',
                    'product:id,name,photopath,price'
                ])
                ->select('id', 'user_id', 'product_id', 'name', 'phone', 'city', 'district', 'quantity', 'price', 'status', 'payment_method', 'payment_status', 'created_at')
                ->orderBy('created_at', 'desc')
                ->get();
        });
            
        return response()->json([
            'success' => true,
            'orders' => $orders
        ]);
    }
    
    /**
     * Update order status.
     */
    public function status($id, $status)
    {
        $order = Order::with(['user', 'product'])->find($id);
        
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }
        
        $order->status = $status;
        $order->save();
        
        // Send order status update email to user
        try {
            Mail::send('emails.order-status-updated', ['order' => $order], function ($message) use ($order) {
                $message->to($order->user->email, $order->user->name)
                       ->subject('Order Status Update - ' . $order->status . ' - Hamro-commerce');
            });
        } catch (\Exception $e) {
            // Log error but don't fail the status update
            Log::error('Failed to send status update email: ' . $e->getMessage());
        }

        Cache::forget('orders_all_admin');
        Cache::forget('orders_overview');
        Cache::forget('orders_user_' . $order->user_id);
        
        return response()->json([
            'success' => true,
            'message' => 'Order is now ' . $status,
            'order' => $order
        ]);
    }
    
    /**
     * Store order from eSewa payment.
     */
    public function storeEsewa(Request $request, $cartid)
    {
        $data = $request->data;
        $data = base64_decode($data);
        $data = json_decode($data);
        $status = $data->status;
        
        if ($status === "COMPLETE") {
            $cart = Cart::with(['product', 'user'])->find($cartid);
            
            if (!$cart) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart not found'
                ], 404);
            }
            
            $order = new Order();
            $order->product_id = $cart->product_id;
            $order->price = $cart->product->price;
            $order->quantity = $cart->quantity;
            $order->payment_method = "eSewa";
            $order->name = $cart->user->name;
            $order->phone = 'N/A';
            $order->address = 'N/A';
            $order->user_id = auth()->user()->id;
            $order->status = "Pending";
            $order->save();
            
            $cart->delete();
            
            // Load relationships for email
            $order->load(['product', 'user']);
            
            // Send order confirmation email to user
            try {
                Mail::send('emails.order-placed', ['order' => $order], function ($message) use ($order) {
                    $message->to($order->user->email, $order->user->name)
                           ->subject('Order Confirmation - eSewa Payment - Hamro-commerce');
                });
            } catch (\Exception $e) {
                // Log error but don't fail the order
                Log::error('Failed to send eSewa order email: ' . $e->getMessage());
            }

            Cache::forget('orders_all_admin');
            Cache::forget('orders_overview');
            Cache::forget('dashboard_index');
            Cache::forget('dashboard_sales');
            Cache::forget('dashboard_users');
            Cache::forget('dashboard_products');
            Cache::forget('orders_user_' . $order->user_id);
            
            return response()->json([
                'success' => true,
                'message' => 'Order has been placed successfully',
                'order' => $order
            ], 201);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Payment not completed'
        ], 400);
    }
    
    /**
     * Get orders for authenticated user.
     */
    public function myOrders()
    {
        $userId = auth()->user()->id;
        $orders = Cache::remember('orders_user_' . $userId, 15, function () use ($userId) {
            return Order::with(['product:id,name,photopath,price'])
                ->select('id', 'user_id', 'product_id', 'price', 'quantity', 'status', 'payment_method', 'payment_status', 'created_at')
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->get();
        });
            
        return response()->json([
            'success' => true,
            'orders' => $orders
        ]);
    }
    
    /**
     * Delete an order.
     */
    public function destroy($id)
    {
        $order = Order::find($id);
        
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }
        
        // Restore stock
        $product = Product::find($order->product_id);
        if ($product) {
            $product->stock += $order->quantity;
            $product->save();
        }
        
        $order->delete();

        Cache::forget('orders_all_admin');
        Cache::forget('orders_overview');
        Cache::forget('dashboard_index');
        Cache::forget('dashboard_sales');
        Cache::forget('dashboard_users');
        Cache::forget('dashboard_products');
        Cache::forget('orders_user_' . $order->user_id);
        
        return response()->json([
            'success' => true,
            'message' => 'Order deleted successfully'
        ]);
    }
}
