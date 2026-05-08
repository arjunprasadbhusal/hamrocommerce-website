<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border: 1px solid #e0e0e0;
        }
        .order-details {
            background: white;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .product-card {
            display: flex;
            gap: 16px;
            align-items: center;
            background: #ffffff;
            border: 1px solid #eee;
            border-radius: 10px;
            padding: 16px;
            margin: 12px 0 20px;
        }
        .product-image {
            width: 90px;
            height: 90px;
            border-radius: 10px;
            object-fit: cover;
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
        }
        .product-meta {
            flex: 1;
        }
        .product-name {
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 4px;
            color: #111827;
        }
        .product-sub {
            font-size: 13px;
            color: #6b7280;
            margin: 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .detail-label {
            font-weight: bold;
            color: #666;
        }
        .detail-value {
            color: #333;
        }
        .total {
            font-size: 1.2em;
            font-weight: bold;
            color: #667eea;
        }
        .footer {
            background: #333;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 10px 10px;
            font-size: 0.9em;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            background: #ffa500;
            color: white;
            border-radius: 20px;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <div style="margin-bottom: 12px;">
            <img src="{{ $message->embed(public_path('image/logo.png')) }}" alt="Hamro-commerce" style="height: 48px; width: auto;" />
        </div>
        <h1>🎉 Order Confirmation</h1>
        <p>Thank you for your order!</p>
    </div>
    
    <div class="content">
        <h2>Hello {{ $order->name }},</h2>
        <p>Your order has been successfully placed. Here are the details:</p>
        
        <div class="order-details">
            <h3>Order Information</h3>

            @php
                $productImagePath = $order->product && $order->product->photopath
                    ? storage_path('app/public/' . $order->product->photopath)
                    : null;
            @endphp

            @if($productImagePath && file_exists($productImagePath))
                <div class="product-card">
                    <img src="{{ $message->embed($productImagePath) }}" alt="{{ $order->product->name }}" class="product-image" />
                    <div class="product-meta">
                        <p class="product-name">{{ $order->product->name }}</p>
                        <p class="product-sub">Qty: {{ $order->quantity }} • NPR {{ number_format($order->price, 2) }}</p>
                    </div>
                </div>
            @endif
            
            <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">#{{ $order->id }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Product:</span>
                <span class="detail-value">{{ $order->product->name }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Quantity:</span>
                <span class="detail-value">{{ $order->quantity }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Price per Unit:</span>
                <span class="detail-value">NPR {{ number_format($order->price, 2) }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label total">Total Amount:</span>
                <span class="detail-value total">NPR {{ number_format($order->price * $order->quantity, 2) }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">{{ $order->payment_method }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="status-badge">{{ $order->status }}</span>
            </div>
        </div>
        
        <div class="order-details">
            <h3>Shipping Information</h3>
            
            <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">{{ $order->name }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">{{ $order->phone }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Address:</span>
                <span class="detail-value">{{ $order->address }}</span>
            </div>
            
            @if($order->city)
            <div class="detail-row">
                <span class="detail-label">City:</span>
                <span class="detail-value">{{ $order->city }}</span>
            </div>
            @endif
            
            @if($order->district)
            <div class="detail-row">
                <span class="detail-label">District:</span>
                <span class="detail-value">{{ $order->district }}</span>
            </div>
            @endif
        </div>
        
        <p style="margin-top: 20px;">We will notify you when your order status changes.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
    </div>
    
    <div class="footer">
        <p>&copy; {{ date('Y') }} Hamro-commerce. All rights reserved.</p>
        <p>This is an automated email, please do not reply.</p>
    </div>
</body>
</html>
