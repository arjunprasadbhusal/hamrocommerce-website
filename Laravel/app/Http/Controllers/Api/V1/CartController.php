<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    /**
     * Add a product to cart.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
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
        
        $existingCartItem = Cart::where('user_id', $data['user_id'])
            ->where('product_id', $data['product_id'])
            ->first();
            
        if ($existingCartItem) {
            $product = Product::find($data['product_id']);
            $newQuantity = $existingCartItem->quantity + $data['quantity'];

            if ($product && $newQuantity > $product->stock) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient stock. Only ' . $product->stock . ' units available.'
                ], 400);
            }

            $existingCartItem->quantity = $newQuantity;
            if (array_key_exists('color', $data)) {
                $existingCartItem->color = $data['color'];
            }
            if (array_key_exists('size', $data)) {
                $existingCartItem->size = $data['size'];
            }
            $existingCartItem->save();
            $existingCartItem->load(['product.category']);

            return response()->json([
                'success' => true,
                'message' => 'Cart quantity updated successfully',
                'cart_item' => [
                    'id' => $existingCartItem->id,
                    'quantity' => $existingCartItem->quantity,
                    'product' => [
                        'id' => $existingCartItem->product->id,
                        'name' => $existingCartItem->product->name,
                        'description' => $existingCartItem->product->description,
                        'price' => $existingCartItem->product->price,
                        'stock' => $existingCartItem->product->stock,
                        'photo_url' => $existingCartItem->product->photo_url,
                        'brand' => $existingCartItem->product->brand,
                        'category' => $existingCartItem->product->category ? [
                            'id' => $existingCartItem->product->category->id,
                            'name' => $existingCartItem->product->category->name,
                        ] : null,
                    ]
                ]
            ], 200);
        }
        
        $cartItem = Cart::create($data);
        
        // Load relationships and transform
        $cartItem->load(['product.category']);
        
        return response()->json([
            'success' => true,
            'message' => 'Product Added to Cart Successfully',
            'cart_item' => [
                'id' => $cartItem->id,
                'quantity' => $cartItem->quantity,
                'product' => [
                    'id' => $cartItem->product->id,
                    'name' => $cartItem->product->name,
                    'description' => $cartItem->product->description,
                    'price' => $cartItem->product->price,
                    'stock' => $cartItem->product->stock,
                    'photo_url' => $cartItem->product->photo_url,
                    'brand' => $cartItem->product->brand,
                    'category' => $cartItem->product->category ? [
                        'id' => $cartItem->product->category->id,
                        'name' => $cartItem->product->category->name,
                    ] : null,
                ]
            ]
        ], 201);
    }
    
    /**
     * Get all cart items for authenticated user.
     */
    public function mycart()
    {
        $carts = Cart::with([
                'product:id,name,description,price,stock,photopath,category_id,brand,color,size',
                'product.category:id,name'
            ])
            ->where('user_id', auth()->user()->id)
            ->get();
        
        // Transform cart items to include product images and relationships    
        $transformedCarts = $carts->map(function ($cart) {
            return [
                'id' => $cart->id,
                'quantity' => $cart->quantity,
                'color' => $cart->color,
                'size' => $cart->size,
                'product' => [
                    'id' => $cart->product->id,
                    'name' => $cart->product->name,
                    'description' => $cart->product->description,
                    'price' => $cart->product->price,
                    'stock' => $cart->product->stock,
                    'photo_url' => $cart->product->photo_url,
                    'brand' => $cart->product->brand,
                    'color' => $cart->product->color,
                    'size' => $cart->product->size,
                    'category' => $cart->product->category ? [
                        'id' => $cart->product->category->id,
                        'name' => $cart->product->category->name,
                    ] : null,
                ]
            ];
        });
            
        $total = $carts->sum(function ($item) {
            return $item->product->price * $item->quantity;
        });
        
        return response()->json([
            'success' => true,
            'carts' => $transformedCarts,
            'total' => $total,
            'count' => $carts->count()
        ]);
    }
    
    /**
     * Update cart item quantity.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $cart = Cart::with(['product'])->find($id);
        
        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Cart item not found'
            ], 404);
        }
        
        if ($cart->user_id != auth()->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized Access'
            ], 403);
        }
        
        // Check stock availability
        if ($request->quantity > $cart->product->stock) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient stock. Only ' . $cart->product->stock . ' units available.'
            ], 400);
        }
        
        $cart->quantity = $request->quantity;
        $cart->save();
        
        $cart->load(['product.category']);
        
        return response()->json([
            'success' => true,
            'message' => 'Cart updated successfully',
            'cart_item' => [
                'id' => $cart->id,
                'quantity' => $cart->quantity,
                'product' => [
                    'id' => $cart->product->id,
                    'name' => $cart->product->name,
                    'description' => $cart->product->description,
                    'price' => $cart->product->price,
                    'stock' => $cart->product->stock,
                    'photo_url' => $cart->product->photo_url,
                    'category' => $cart->product->category ? [
                        'id' => $cart->product->category->id,
                        'name' => $cart->product->category->name,
                    ] : null,
                    'brand' => $cart->product->brand,
                ]
            ]
        ]);
    }
    
    /**
     * Remove a cart item.
     */
    public function destroy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'dataid' => 'required|exists:carts,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $cart = Cart::find($request->dataid);
        
        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Cart item not found'
            ], 404);
        }
        
        if ($cart->user_id != auth()->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized Access'
            ], 403);
        }
        
        $cart->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Cart item removed successfully'
        ]);
    }
    
    /**
     * Get cart item for checkout.
     */
    public function checkout($id)
    {
        $cart = Cart::with(['product.category'])->find($id);
        
        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Cart item not found'
            ], 404);
        }
        
        if ($cart->user_id != auth()->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized Access'
            ], 403);
        }
        
        return response()->json([
            'success' => true,
            'cart' => [
                'id' => $cart->id,
                'quantity' => $cart->quantity,
                'product' => [
                    'id' => $cart->product->id,
                    'name' => $cart->product->name,
                    'description' => $cart->product->description,
                    'price' => $cart->product->price,
                    'stock' => $cart->product->stock,
                    'photo_url' => $cart->product->photo_url,
                    'category' => $cart->product->category ? [
                        'id' => $cart->product->category->id,
                        'name' => $cart->product->category->name,
                    ] : null,
                    'brand' => $cart->product->brand,
                ]
            ]
        ]);
    }
}
