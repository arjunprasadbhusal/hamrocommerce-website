<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmail extends Command
{
    protected $signature = 'test:email {email}';
    protected $description = 'Test email configuration by sending a test email';

    public function handle()
    {
        $email = $this->argument('email');
        
        $this->info('Testing email configuration...');
        $this->info('To: ' . $email);
        
        try {
            Mail::raw('This is a test email from Hamro-commerce. If you receive this, your email configuration is working!', function ($message) use ($email) {
                $message->to($email)
                       ->subject('Test Email - Hamro-commerce');
            });
            
            $this->info('✅ Email sent successfully!');
            $this->info('Check your inbox at: ' . $email);
            
        } catch (\Exception $e) {
            $this->error('❌ Failed to send email!');
            $this->error('Error: ' . $e->getMessage());
            $this->newLine();
            $this->warn('Common issues:');
            $this->warn('1. Gmail App Password not set in .env file');
            $this->warn('2. 2-Step Verification not enabled on Gmail');
            $this->warn('3. App Password not generated correctly');
            $this->warn('4. Firewall blocking SMTP port 587');
        }
    }
}
