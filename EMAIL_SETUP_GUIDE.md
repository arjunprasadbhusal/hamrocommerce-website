# Email Configuration & Troubleshooting Guide

## ✅ Issues Fixed:

1. **Added `encryption` setting** in `config/mail.php` for SMTP mailer
2. **Added `Log` facade import** in OrderController
3. **Created test email command** for debugging

## 🔧 Setup Steps:

### Step 1: Generate Gmail App Password

Since you're using Gmail, you MUST use an App Password (regular Gmail password won't work):

1. **Enable 2-Step Verification:**
   - Go to: https://myaccount.google.com/security
   - Find "2-Step Verification" and enable it

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Windows Computer" as the device
   - Click "Generate"
   - **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

3. **Update .env file:**
   ```env
   MAIL_PASSWORD=abcdefghijklmnop  (remove spaces, use the actual password)
   ```

### Step 2: Clear Laravel Cache

Run these commands in the **php** terminal:
```bash
php artisan config:clear
php artisan cache:clear
```

### Step 3: Test Email Configuration

Run this command to test if email is working:
```bash
php artisan test:email your-email@gmail.com
```

Replace `your-email@gmail.com` with any email address you want to test with.

## 🐛 Common Issues & Solutions:

### Issue 1: "your_new_app_password_here" still in .env
**Solution:** Replace it with your actual 16-character Gmail App Password

### Issue 2: Authentication failed
**Solutions:**
- Make sure 2-Step Verification is enabled on Gmail
- Generate a NEW App Password (old ones might not work)
- Copy the password without spaces: `abcdefghijklmnop`

### Issue 3: Connection timeout
**Solutions:**
- Check if your firewall is blocking port 587
- Try port 465 with `MAIL_ENCRYPTION=ssl` instead
- Check your internet connection

### Issue 4: Less secure app access
**Solution:** You DON'T need to enable "Less secure app access" if you're using App Password

## 📧 How It Works Now:

### 1. Order Placement Email
When a user places an order via:
- `/api/v1/orders` (regular checkout)
- `/api/v1/orders/esewa/{cartid}` (eSewa payment)

The system will:
- Save the order
- Send a beautiful HTML email to `user->email` with:
  - Order ID
  - Product details
  - Quantity and total price
  - Payment method
  - Shipping information

### 2. Status Change Email
When you update order status via:
- `/api/v1/orders/{id}/status/{status}`

The system will:
- Update the status
- Send an email to user with:
  - Updated status badge (color-coded)
  - Complete order information
  - Contextual message based on status

## 🧪 Testing:

### Test 1: Basic Email Test
```bash
php artisan test:email bhusala452@gmail.com
```

If this works, your email configuration is correct!

### Test 2: Place a Test Order
1. Make sure Laravel server is running: `php artisan serve --host=192.168.100.91`
2. Login to your app
3. Place an order
4. Check the email inbox of the logged-in user

### Test 3: Change Order Status
1. Go to admin dashboard
2. Change any order status
3. Check the email inbox of the user who placed that order

## 📝 Current Configuration:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=bhusala452@gmail.com
MAIL_PASSWORD=your_new_app_password_here  ← REPLACE THIS!
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="bhusala452@gmail.com"
MAIL_FROM_NAME="Hamro-commerce"
```

## 🚨 Important Notes:

1. **Never commit your App Password to Git** - it's sensitive!
2. **App Passwords are account-specific** - each Google account needs its own
3. **Emails are sent synchronously** - for production, consider using queues
4. **Error handling is built-in** - if email fails, the order still succeeds

## 💡 Next Steps After Setup:

Once email is working, you can:
1. Add email queue for better performance: `QUEUE_CONNECTION=database`
2. Customize email templates in `resources/views/emails/`
3. Add more email notifications (e.g., registration welcome email)
4. Set up email logging for debugging

## 🆘 Still Not Working?

If you've followed all steps and email still doesn't work:

1. Check Laravel logs:
   ```bash
   Get-Content storage/logs/laravel.log -Tail 50
   ```

2. Enable debug mode in .env:
   ```env
   APP_DEBUG=true
   LOG_LEVEL=debug
   ```

3. Try the test command with verbose output:
   ```bash
   php artisan test:email bhusala452@gmail.com -v
   ```

4. Check if the issue is with Gmail specifically by trying a different SMTP service
