<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class WishlistController extends Controller
{
    /**
     * Add a product to wishlist.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
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
        
        // Check if already in wishlist
        $check = Wishlist::where('user_id', $data['user_id'])
            ->where('product_id', $data['product_id'])
            ->first();
            
        if ($check) {
            return response()->json([
                'success' => false,
                'message' => 'Product already in wishlist',
                'inWishlist' => true
            ], 400);
        }
        
        $wishlistItem = Wishlist::create($data);
        
        // Load relationships
        $wishlistItem->load(['product.category']);
        
        return response()->json([
            'success' => true,
            'message' => 'Product added to wishlist successfully',
            'wishlist_item' => [
                'id' => $wishlistItem->id,
                'product' => [
                    'id' => $wishlistItem->product->id,
                    'name' => $wishlistItem->product->name,
                    'description' => $wishlistItem->product->description,
                    'price' => $wishlistItem->product->price,
                    'stock' => $wishlistItem->product->stock,
                    'photo_url' => $wishlistItem->product->photo_url,
                    'category' => $wishlistItem->product->category ? [
                        'id' => $wishlistItem->product->category->id,
                        'name' => $wishlistItem->product->category->name,
                    ] : null,
                    'brand' => $wishlistItem->product->brand,
                ]
            ]
        ], 201);
    }
    
    /**
     * Get all wishlist items for authenticated user.
     */
    public function mywishlist()
    {
        $wishlists = Wishlist::with([
                'product:id,name,description,price,stock,photopath,category_id,brand',
                'product.category:id,name'
            ])
            ->where('user_id', auth()->user()->id)
            ->get();
        
        // Transform wishlist items
        $transformedWishlists = $wishlists->map(function ($wishlist) {
            return [
                'id' => $wishlist->id,
                'product' => [
                    'id' => $wishlist->product->id,
                    'name' => $wishlist->product->name,
                    'description' => $wishlist->product->description,
                    'price' => $wishlist->product->price,
                    'stock' => $wishlist->product->stock,
                    'photo_url' => $wishlist->product->photo_url,
                    'category' => $wishlist->product->category ? [
                        'id' => $wishlist->product->category->id,
                        'name' => $wishlist->product->category->name,
                    ] : null,
                    'brand' => $wishlist->product->brand,
                ]
            ];
        });
        
        return response()->json([
            'success' => true,
            'wishlists' => $transformedWishlists,
            'count' => $wishlists->count()
        ]);
    }
    
    /**
     * Remove a product from wishlist.
     */
    public function destroy($id)
    {
        $wishlist = Wishlist::where('id', $id)
            ->where('user_id', auth()->user()->id)
            ->first();
        
        if (!$wishlist) {
            return response()->json([
                'success' => false,
                'message' => 'Wishlist item not found'
            ], 404);
        }
        
        $wishlist->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Product removed from wishlist successfully'
        ]);
    }
    
    /**
     * Remove by product ID (convenience method).
     */
    public function destroyByProduct($productId)
    {
        $wishlist = Wishlist::where('product_id', $productId)
            ->where('user_id', auth()->user()->id)
            ->first();
        
        if (!$wishlist) {
            return response()->json([
                'success' => false,
                'message' => 'Product not in wishlist'
            ], 404);
        }
        
        $wishlist->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Product removed from wishlist successfully'
        ]);
    }
}
