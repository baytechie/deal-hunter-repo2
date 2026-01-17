import 'package:flutter/material.dart';

/// Notifications Page - Shows user notifications
class NotificationsPage extends StatelessWidget {
  const NotificationsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Icon(
          Icons.notifications_outlined,
          color: Colors.black,
          size: 24,
        ),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _NotificationItem(
            message: "Your vote on 'Wireless Earbuds Pro' was counted",
            timestamp: "2 minutes ago",
          ),
          const Divider(height: 1),
          _NotificationItem(
            message: "New deal alert! 'Ultra Thin Laptop' is now 30% off",
            timestamp: "1 hour ago",
          ),
          const Divider(height: 1),
          _NotificationItem(
            message: "Community discussion about 'Smart Home Hub' started",
            timestamp: "3 hours ago",
          ),
          const Divider(height: 1),
          _NotificationItem(
            message: "Your saved deal 'Next-Gen Gaming Console' is expiring soon",
            timestamp: "Yesterday",
          ),
          const Divider(height: 1),
          _NotificationItem(
            message: "JohnDoe commented on your deal submission: 'Great find!'",
            timestamp: "2 days ago",
          ),
          const Divider(height: 1),
          _NotificationItem(
            message: "Price drop alert for 'Deluxe Coffee Maker' you were watching",
            timestamp: "3 days ago",
          ),
          const Divider(height: 1),
          _NotificationItem(
            message: "Congratulations! You earned a 'Deal Scout' badge",
            timestamp: "4 days ago",
          ),
        ],
      ),
    );
  }
}

class _NotificationItem extends StatelessWidget {
  final String message;
  final String timestamp;

  const _NotificationItem({
    required this.message,
    required this.timestamp,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            message,
            style: const TextStyle(
              fontSize: 15,
              color: Colors.black87,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            timestamp,
            style: const TextStyle(
              fontSize: 13,
              color: Color(0xFF6B7280),
            ),
          ),
        ],
      ),
    );
  }
}
