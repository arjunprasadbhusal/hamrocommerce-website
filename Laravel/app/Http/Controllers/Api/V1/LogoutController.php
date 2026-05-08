<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LogoutController extends Controller
{
    public function logout(Request $request)
    {
        // Get the authenticated user
        $user = $request->User();

        // Delete the current access token
        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully',
            ], 200);
        }

        return response()->json([
            'success' => false,
            'message' => 'No active session found',
        ], 401);
    }
}
