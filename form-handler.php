<?php
// SuiteKeep Support Form Handler
// This script processes support ticket submissions and sends them via email

// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type
header('Content-Type: application/json');

// Allow CORS for local development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration
$to_email = 'MikeMyersCo@Gmail.com';
$from_name = 'SuiteKeep Support';
$from_email = 'noreply@suitekeeper.com'; // Should be from your domain

function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function send_response($success, $message, $data = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit();
}

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_response(false, 'Method not allowed');
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

// If JSON decode failed, try form data
if (!$input) {
    $input = $_POST;
}

// Validate required fields
$required_fields = ['name', 'email', 'subject', 'message'];
$errors = [];

foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        $errors[] = ucfirst($field) . ' is required';
    }
}

// Validate email format
if (!empty($input['email']) && !validate_email($input['email'])) {
    $errors[] = 'Invalid email address';
}

// If there are validation errors, return them
if (!empty($errors)) {
    send_response(false, 'Validation failed', $errors);
}

// Sanitize inputs
$name = sanitize_input($input['name']);
$email = sanitize_input($input['email']);
$category = sanitize_input($input['category'] ?? 'General');
$subject = sanitize_input($input['subject']);
$message = sanitize_input($input['message']);
$device = sanitize_input($input['device'] ?? 'Not specified');

// Create ticket ID
$ticket_id = 'SK-' . date('Ymd') . '-' . substr(md5($email . time()), 0, 6);

// Prepare email content
$email_subject = "[SuiteKeep Support] {$category}: {$subject}";

$email_body = "
New support ticket submitted via SuiteKeep Support Website

Ticket ID: {$ticket_id}
Submitted: " . date('Y-m-d H:i:s T') . "

Customer Information:
Name: {$name}
Email: {$email}
Device: {$device}

Issue Details:
Category: {$category}
Subject: {$subject}

Message:
{$message}

---
This ticket was submitted through the SuiteKeep Support website.
Please respond to the customer at: {$email}
";

// Email headers
$headers = [
    'From' => "{$from_name} <{$from_email}>",
    'Reply-To' => $email,
    'X-Mailer' => 'SuiteKeep Support System',
    'Content-Type' => 'text/plain; charset=UTF-8',
    'X-Priority' => '3',
    'X-SuiteKeep-Ticket-ID' => $ticket_id,
    'X-Customer-Email' => $email,
    'X-Issue-Category' => $category
];

$header_string = '';
foreach ($headers as $key => $value) {
    $header_string .= "{$key}: {$value}\r\n";
}

// Attempt to send email
try {
    $mail_sent = mail($to_email, $email_subject, $email_body, $header_string);
    
    if ($mail_sent) {
        // Log successful submission
        $log_entry = date('Y-m-d H:i:s') . " - Ticket {$ticket_id} submitted by {$email}\n";
        file_put_contents('support_tickets.log', $log_entry, FILE_APPEND | LOCK_EX);
        
        // Send confirmation email to customer
        $customer_subject = "SuiteKeep Support - Your ticket has been received (Ticket #{$ticket_id})";
        $customer_body = "
Dear {$name},

Thank you for contacting SuiteKeep support. We have received your support request and assigned it ticket number: {$ticket_id}

Your Issue:
Category: {$category}
Subject: {$subject}

What happens next?
• Our support team will review your request within 24 hours
• You'll receive a personal response at this email address
• If needed, we may ask for additional information to better assist you

In the meantime, you might find helpful information in our:
• User Guide: https://your-domain.com/support/#guide
• FAQ Section: https://your-domain.com/support/#faq

Best regards,
The SuiteKeep Support Team
MikeMyersCo@Gmail.com

---
Please do not reply to this automated email. If you need to add information to your ticket, please submit a new support request referencing ticket #{$ticket_id}.
        ";
        
        $customer_headers = [
            'From' => "{$from_name} <{$from_email}>",
            'Reply-To' => $to_email,
            'X-Mailer' => 'SuiteKeep Support System',
            'Content-Type' => 'text/plain; charset=UTF-8',
            'X-SuiteKeep-Ticket-ID' => $ticket_id
        ];
        
        $customer_header_string = '';
        foreach ($customer_headers as $key => $value) {
            $customer_header_string .= "{$key}: {$value}\r\n";
        }
        
        mail($email, $customer_subject, $customer_body, $customer_header_string);
        
        send_response(true, "Thank you! Your support ticket #{$ticket_id} has been submitted successfully. You'll receive a confirmation email shortly and we'll respond within 24 hours.", ['ticket_id' => $ticket_id]);
    } else {
        // Log failed submission
        $log_entry = date('Y-m-d H:i:s') . " - FAILED to send ticket for {$email}: {$subject}\n";
        file_put_contents('support_tickets.log', $log_entry, FILE_APPEND | LOCK_EX);
        
        send_response(false, 'Failed to send your support request. Please try again or contact us directly at MikeMyersCo@Gmail.com');
    }
} catch (Exception $e) {
    // Log exception
    $log_entry = date('Y-m-d H:i:s') . " - EXCEPTION for {$email}: " . $e->getMessage() . "\n";
    file_put_contents('support_tickets.log', $log_entry, FILE_APPEND | LOCK_EX);
    
    send_response(false, 'An error occurred while processing your request. Please contact us directly at MikeMyersCo@Gmail.com');
}
?>