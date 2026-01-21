import 'package:flutter/material.dart';
import 'package:money_saver_deals/core/theme/app_theme.dart';
import 'package:url_launcher/url_launcher.dart';

/// AppFooter - Reusable footer widget with legal links and contact info
///
/// Contains:
/// - Contact email
/// - Privacy Policy, Terms of Service, Affiliate Disclosure links
/// - Social media links
///
/// This widget can be placed at the bottom of any page in the app.
class AppFooter extends StatelessWidget {
  const AppFooter({super.key});

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> _launchEmail() async {
    final uri = Uri(
      scheme: 'mailto',
      path: 'hunter4dealsapp@gmail.com',
      query: 'subject=Deal Hunt App Inquiry',
    );
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  void _showLegalDialog(BuildContext context, String title, String content) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: SingleChildScrollView(
          child: Text(
            content,
            style: const TextStyle(fontSize: 14, height: 1.5),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        border: Border(
          top: BorderSide(color: Colors.grey[300]!),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Social Media Links
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _SocialButton(
                icon: Icons.close, // X (Twitter) icon approximation
                label: 'X',
                onTap: () => _launchUrl('https://x.com/DealHunt2026'),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Contact Email
          GestureDetector(
            onTap: _launchEmail,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.email_outlined, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 8),
                Text(
                  'hunter4dealsapp@gmail.com',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Legal Links Row
          Wrap(
            alignment: WrapAlignment.center,
            spacing: 8,
            runSpacing: 8,
            children: [
              _LegalLink(
                label: 'Privacy Policy',
                onTap: () => _showLegalDialog(
                  context,
                  'Privacy Policy',
                  _privacyPolicyText,
                ),
              ),
              Text('•', style: TextStyle(color: Colors.grey[400])),
              _LegalLink(
                label: 'Terms of Service',
                onTap: () => _showLegalDialog(
                  context,
                  'Terms of Service',
                  _termsOfServiceText,
                ),
              ),
              Text('•', style: TextStyle(color: Colors.grey[400])),
              _LegalLink(
                label: 'Affiliate Disclosure',
                onTap: () => _showLegalDialog(
                  context,
                  'Affiliate Disclosure',
                  _affiliateDisclosureText,
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Copyright
          Text(
            '© ${DateTime.now().year} Deal Hunt. All rights reserved.',
            style: TextStyle(
              color: Colors.grey[500],
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }
}

/// Social media button widget
class _SocialButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _SocialButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.black,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: Colors.white, size: 18),
            const SizedBox(width: 8),
            Text(
              'Follow us on $label',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Legal link button widget
class _LegalLink extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const _LegalLink({
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Text(
        label,
        style: TextStyle(
          color: Colors.grey[600],
          fontSize: 12,
          decoration: TextDecoration.underline,
        ),
      ),
    );
  }
}

// Legal text content
const String _privacyPolicyText = '''
Privacy Policy for Deal Hunt

Last updated: January 2026

1. Information We Collect
We collect information you provide directly, such as email addresses for account creation and preferences for deal alerts.

2. How We Use Your Information
- To provide and improve our deal-finding services
- To send you relevant deal notifications
- To personalize your experience

3. Information Sharing
We do not sell your personal information. We may share data with:
- Service providers who help operate our app
- Analytics partners to improve our services

4. Data Security
We implement appropriate security measures to protect your information.

5. Your Rights
You may request access to, correction of, or deletion of your personal data by contacting us.

6. Contact Us
For privacy inquiries: hunter4dealsapp@gmail.com
''';

const String _termsOfServiceText = '''
Terms of Service for Deal Hunt

Last updated: January 2026

1. Acceptance of Terms
By using Deal Hunt, you agree to these terms.

2. Use of Service
- You must be 13 years or older to use this app
- You agree to use the service lawfully
- You are responsible for your account security

3. Deal Information
- Prices and availability are subject to change
- We strive for accuracy but cannot guarantee all deal information
- Always verify deals with the retailer before purchasing

4. Intellectual Property
All content and features are owned by Deal Hunt.

5. Limitation of Liability
Deal Hunt is not responsible for:
- Third-party retailer policies or actions
- Price changes or deal expirations
- Any losses from using deal information

6. Changes to Terms
We may update these terms at any time.

7. Contact
Questions: hunter4dealsapp@gmail.com
''';

const String _affiliateDisclosureText = '''
Affiliate Disclosure

Deal Hunt participates in affiliate marketing programs, which means we may earn commissions on purchases made through links in our app.

Our Affiliate Partners Include:
• Amazon Associates Program
• Walmart Affiliate Program
• Target Affiliate Program
• And other retail partners

What This Means For You:
- Clicking on deals may direct you through affiliate links
- We earn a small commission at no extra cost to you
- This helps support our free service

Our Commitment:
- We never let affiliate relationships influence our deal recommendations
- We showcase deals based on value to our users
- Prices shown are the same whether you use our links or not

FTC Compliance:
This disclosure is provided in accordance with the Federal Trade Commission's guidelines on affiliate marketing.

Questions about our affiliate relationships? Contact us at hunter4dealsapp@gmail.com
''';
