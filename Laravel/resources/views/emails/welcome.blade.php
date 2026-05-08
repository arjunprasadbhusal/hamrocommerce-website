<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Hamro-commerce</title>
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
        .welcome-box {
            background: white;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            background: #333;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 10px 10px;
            font-size: 0.9em;
        }
        .cta {
            display: inline-block;
            margin-top: 16px;
            padding: 10px 18px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <div style="margin-bottom: 12px;">
            <img src="{{ $message->embed(public_path('image/logo.png')) }}" alt="Hamro-commerce" style="height: 48px; width: auto;" />
        </div>
        <h1>Welcome to Hamro-commerce</h1>
        <p>Your account is ready</p>
    </div>

    <div class="content">
        <h2>Hello {{ $user->name }},</h2>
        <p>Thanks for creating your account. We are excited to have you with us.</p>

        <div class="welcome-box">
            <p><strong>Account Email:</strong> {{ $user->email }}</p>
            <p>You can now sign in and start shopping.</p>
            <a class="cta" href="{{ url('/') }}">Visit Hamro-commerce</a>
        </div>

        <p>If you have any questions, please contact our support team.</p>
    </div>

    <div class="footer">
        <p>&copy; {{ date('Y') }} Hamro-commerce. All rights reserved.</p>
        <p>This is an automated email, please do not reply.</p>
    </div>
</body>
</html>
