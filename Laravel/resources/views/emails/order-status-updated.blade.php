<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Status Update</title>
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
            padding: 8px 20px;
            border-radius: 25px;
            font-size: 1.1em;
            font-weight: bold;
            text-align: center;
            margin: 15px 0;
        }
        .status-pending { background: #ffa500; color: white; }
        .status-processing { background: #2196F3; color: white; }
        .status-shipped { background: #9C27B0; color: white; }
        .status-delivered { background: #4CAF50; color: white; }
        .status-cancelled { background: #f44336; color: white; }
        .highlight-box {
            background: #e3f2fd;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <div style="margin-bottom: 12px;">
            <img src="{{ $message->embed(public_path('image/logo.png')) }}" alt="Hamro-commerce" style="height: 48px; width: auto;" />
        </div>
        <h1>📦 Order Status Update</h1>
        <p>Your order status has been updated</p>
    </div>
    
    <div class="content">
        <h2>Hello {{ $order->name }},</h2>
        
        <div class="highlight-box">
            <p style="margin: 0; font-size: 1.1em;">Your order status has been updated to:</p>
            <div style="text-align: center;">
                <span class="status-badge status-{{ strtolower($order->status) }}">
                    {{ strtoupper($order->status) }}
                </span>
            </div>
        </div>
        
        <div class="order-details">
            <h3>Order Information</h3>
            
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
                <span class="detail-label">Order Date:</span>
                <span class="detail-value">{{ $order->created_at->format('M d, Y - h:i A') }}</span>
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
        
        @if($order->status === 'Delivered')
            <div class="highlight-box" style="border-left-color: #4CAF50; background: #e8f5e9;">
                <p style="margin: 0;">🎉 Your order has been delivered successfully! Thank you for shopping with us.</p>
            </div>
        @elseif($order->status === 'Shipped')
            <p>Your order is on its way! You should receive it soon.</p>
        @elseif($order->status === 'Processing')
            <p>Your order is being processed and will be shipped soon.</p>
        @elseif($order->status === 'Cancelled')
            <div class="highlight-box" style="border-left-color: #f44336; background: #ffebee;">
                <p style="margin: 0;">Your order has been cancelled. If you have any questions, please contact us.</p>
            </div>
        @endif
        
        <p style="margin-top: 20px;">If you have any questions about your order, please don't hesitate to contact us.</p>
    </div>
    
    <div class="footer">
        <p>&copy; {{ date('Y') }} Hamro-commerce. All rights reserved.</p>
        <p>This is an automated email, please do not reply.</p>
    </div>
</body>
</html>
