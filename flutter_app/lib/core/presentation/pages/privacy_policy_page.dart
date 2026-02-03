import 'package:flutter/material.dart';
import 'package:money_saver_deals/core/theme/app_theme.dart';

/// PrivacyPolicyPage - Dedicated privacy policy page for Android compliance
///
/// This page provides a standalone, linkable privacy policy as required by
/// Google Play Store for Android app distribution. It can be accessed via
/// deep link at /privacy-policy for PWA compliance.
class PrivacyPolicyPage extends StatelessWidget {
  const PrivacyPolicyPage({super.key});

  /// Route name for navigation and deep linking
  static const String routeName = '/privacy-policy';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          'Privacy Policy',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppColors.primary.withOpacity(0.1),
                    AppColors.primaryLight.withOpacity(0.05),
                  ],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.privacy_tip,
                          color: Colors.white,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 16),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Deal Hunt',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            Text(
                              'Privacy Policy',
                              style: TextStyle(
                                fontSize: 14,
                                color: AppColors.textMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.grey[300]!),
                    ),
                    child: Text(
                      'Last updated: January 2026',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Content sections
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSection(
                    '1. Introduction',
                    'Welcome to Deal Hunt ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website (collectively, the "Service"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the Service.',
                  ),
                  _buildSection(
                    '2. Information We Collect',
                    '''We may collect information about you in a variety of ways:

Personal Data
When you register for an account, we may collect:
• Email address
• Display name (optional)
• Profile picture (if using Google Sign-In)

Usage Data
We automatically collect certain information when you use the Service:
• Device information (device type, operating system)
• App usage data (pages viewed, features used)
• IP address
• Browser type (for web access)

Saved Preferences
• Deals you have saved/bookmarked
• Category preferences
• Notification settings''',
                  ),
                  _buildSection(
                    '3. How We Use Your Information',
                    '''We use the information we collect to:

• Provide, maintain, and improve our Service
• Create and manage your account
• Send you deal notifications based on your preferences
• Personalize your experience and show relevant deals
• Respond to your comments, questions, and requests
• Monitor and analyze usage trends to improve user experience
• Send you technical notices, updates, and administrative messages
• Protect against fraudulent or illegal activity''',
                  ),
                  _buildSection(
                    '4. Information Sharing and Disclosure',
                    '''We do not sell, trade, or rent your personal information to third parties. We may share your information in the following situations:

Service Providers
We may share your information with third-party vendors who perform services on our behalf, such as:
• Analytics providers (Google Analytics)
• Cloud hosting services
• Authentication services (Google Sign-In)

Legal Requirements
We may disclose your information if required by law or in response to valid requests by public authorities.

Business Transfers
If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.''',
                  ),
                  _buildSection(
                    '5. Affiliate Links and Third-Party Services',
                    '''Our Service contains affiliate links to third-party retailers. When you make a purchase through our links, we may earn a commission at no additional cost to you.

Our Affiliate Partners Include:
• Amazon Associates Program - As an Amazon Associate, Deal Hunt earns from qualifying purchases
• Walmart Affiliate Program
• Target Affiliate Program
• Best Buy Affiliate Program
• Other retail partners

How Affiliate Links Work:
• When you click a deal link, you may be directed through an affiliate link
• We earn a small commission if you make a qualifying purchase
• The price you pay is exactly the same as if you visited the retailer directly
• This revenue helps us keep the app free and maintain our service

Editorial Independence:
Our deal recommendations, analysis, and "BUY NOW", "WAIT", or "PASS" verdicts are based solely on value to you. We do not let affiliate relationships influence which deals we feature or our editorial opinions. We feature deals from any retailer, regardless of affiliate status.

FTC Compliance:
This disclosure is made in accordance with the Federal Trade Commission's guidelines on endorsements and testimonials (16 CFR Part 255). We are committed to transparency about our affiliate relationships.

Third-Party Websites:
When you click on affiliate links, you will be directed to third-party websites that have their own privacy policies. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.''',
                  ),
                  _buildSection(
                    '6. Data Security',
                    '''We implement appropriate technical and organizational security measures to protect your personal information, including:

• Encryption of data in transit (HTTPS/TLS)
• Secure authentication mechanisms
• Regular security assessments
• Access controls and authentication for our systems

However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.''',
                  ),
                  _buildSection(
                    '7. Data Retention',
                    '''We retain your personal information for as long as your account is active or as needed to provide you services. We will retain and use your information as necessary to:

• Comply with our legal obligations
• Resolve disputes
• Enforce our agreements

You may request deletion of your account and associated data at any time by contacting us.''',
                  ),
                  _buildSection(
                    '8. Your Rights and Choices',
                    '''Depending on your location, you may have the following rights:

• Access: Request access to your personal information
• Correction: Request correction of inaccurate data
• Deletion: Request deletion of your personal information
• Portability: Request a copy of your data in a portable format
• Opt-out: Opt out of marketing communications

To exercise these rights, please contact us using the information below.''',
                  ),
                  _buildSection(
                    '9. Children\'s Privacy',
                    'Our Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately so we can delete such information.',
                  ),
                  _buildSection(
                    '10. International Data Transfers',
                    'Your information may be transferred to and maintained on servers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. By using our Service, you consent to such transfers.',
                  ),
                  _buildSection(
                    '11. Changes to This Privacy Policy',
                    'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.',
                  ),
                  _buildSection(
                    '12. Contact Us',
                    '''If you have any questions about this Privacy Policy or our privacy practices, please contact us at:

Email: hunter4dealsapp@gmail.com

We will respond to your inquiry within a reasonable timeframe.''',
                  ),

                  const SizedBox(height: 32),

                  // Footer with app info
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey[300]!),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [
                                    AppColors.primary,
                                    AppColors.primaryLight
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text(
                                '\$',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            const Text(
                              'Deal Hunt',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          '© ${DateTime.now().year} Deal Hunt. All rights reserved.',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Build a section with title and content
  Widget _buildSection(String title, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            content,
            style: const TextStyle(
              fontSize: 14,
              height: 1.6,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
