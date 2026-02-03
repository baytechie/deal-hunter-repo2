import 'package:flutter/material.dart';
import 'package:money_saver_deals/core/theme/app_theme.dart';
import 'package:url_launcher/url_launcher.dart';

/// AboutPage - Comprehensive about page with affiliate disclosure
///
/// This page provides detailed information about Deal Hunt including:
/// - App description and mission
/// - How we make money (affiliate disclosure)
/// - Partner list
/// - Editorial independence statement
/// - FTC compliance notice
/// - Contact information
class AboutPage extends StatelessWidget {
  const AboutPage({super.key});

  static const String routeName = '/about';

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          'About Deal Hunt',
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
            // Header with app logo and tagline
            _buildHeader(),

            // Content sections
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildMissionSection(),
                  const SizedBox(height: 24),
                  _buildAffiliateDisclosureSection(),
                  const SizedBox(height: 24),
                  _buildPartnerSection(),
                  const SizedBox(height: 24),
                  _buildEditorialIndependenceSection(),
                  const SizedBox(height: 24),
                  _buildFTCComplianceSection(),
                  const SizedBox(height: 24),
                  _buildContactSection(),
                  const SizedBox(height: 32),
                  _buildFooter(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
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
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: ShaderMask(
              shaderCallback: (bounds) => const LinearGradient(
                colors: [AppColors.primary, AppColors.primaryLight],
              ).createShader(bounds),
              child: const Text(
                '\$',
                style: TextStyle(
                  fontSize: 40,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Deal Hunt',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Find the best deals, save big!',
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.grey[300]!),
            ),
            child: Text(
              'Version 1.0.0',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMissionSection() {
    return _buildSection(
      icon: Icons.flag_outlined,
      iconColor: AppColors.primary,
      title: 'Our Mission',
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Deal Hunt helps you discover the best deals and discounts from top retailers. We analyze thousands of products daily to bring you genuine savings on items you actually want.',
            style: TextStyle(
              fontSize: 14,
              height: 1.6,
              color: Colors.grey[700],
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Our goal is to help you make informed purchase decisions by providing honest analysis, price history insights, and expert recommendations.',
            style: TextStyle(
              fontSize: 14,
              height: 1.6,
              color: Colors.grey[700],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAffiliateDisclosureSection() {
    return _buildSection(
      icon: Icons.monetization_on_outlined,
      iconColor: Colors.green[600]!,
      title: 'How We Make Money',
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.green[50],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.green[200]!),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Deal Hunt participates in affiliate marketing programs. When you click on deals and make purchases, we may earn a commission at no extra cost to you.',
                  style: TextStyle(
                    fontSize: 14,
                    height: 1.6,
                    color: Colors.grey[800],
                  ),
                ),
                const SizedBox(height: 16),
                _buildCheckItem('This helps keep the app free for everyone'),
                const SizedBox(height: 8),
                _buildCheckItem(
                    'You pay the same price whether you use our links or not'),
                const SizedBox(height: 8),
                _buildCheckItem(
                    'We only feature deals we believe offer genuine value'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPartnerSection() {
    return _buildSection(
      icon: Icons.handshake_outlined,
      iconColor: Colors.blue[600]!,
      title: 'Our Affiliate Partners',
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'We work with trusted retailers including:',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[700],
            ),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildPartnerChip('Amazon', const Color(0xFFFF9900)),
              _buildPartnerChip('Walmart', const Color(0xFF0071CE)),
              _buildPartnerChip('Target', const Color(0xFFCC0000)),
              _buildPartnerChip('Best Buy', const Color(0xFF0046BE)),
              _buildPartnerChip('eBay', const Color(0xFFE53238)),
              _buildPartnerChip('& More', Colors.grey[600]!),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Amazon Associates Disclosure: As an Amazon Associate, Deal Hunt earns from qualifying purchases.',
            style: TextStyle(
              fontSize: 12,
              fontStyle: FontStyle.italic,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEditorialIndependenceSection() {
    return _buildSection(
      icon: Icons.verified_outlined,
      iconColor: Colors.purple[600]!,
      title: 'Editorial Independence',
      content: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.purple[50],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.purple[200]!),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Our Commitment to You',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.purple[800],
              ),
            ),
            const SizedBox(height: 12),
            _buildCommitmentItem(
              'Our deal analysis and "BUY NOW", "WAIT", or "PASS" verdicts are based solely on value to you, not commission rates.',
            ),
            const SizedBox(height: 8),
            _buildCommitmentItem(
              'We feature deals from any retailer, regardless of whether we have an affiliate relationship.',
            ),
            const SizedBox(height: 8),
            _buildCommitmentItem(
              'Our pros/cons and recommendations reflect genuine product research and price analysis.',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFTCComplianceSection() {
    return _buildSection(
      icon: Icons.gavel_outlined,
      iconColor: Colors.orange[600]!,
      title: 'FTC Compliance',
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'This disclosure is provided in accordance with the Federal Trade Commission\'s guidelines on endorsements and testimonials (16 CFR Part 255).',
            style: TextStyle(
              fontSize: 14,
              height: 1.6,
              color: Colors.grey[700],
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'We are committed to transparency about our affiliate relationships. When you see a deal on our app, it may contain affiliate links that help support our service.',
            style: TextStyle(
              fontSize: 14,
              height: 1.6,
              color: Colors.grey[700],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactSection() {
    return _buildSection(
      icon: Icons.email_outlined,
      iconColor: AppColors.primary,
      title: 'Contact Us',
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Have questions about our affiliate relationships, deal recommendations, or anything else?',
            style: TextStyle(
              fontSize: 14,
              height: 1.6,
              color: Colors.grey[700],
            ),
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: _launchEmail,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.primarySurface,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.primaryLight),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.email, color: AppColors.primary, size: 20),
                  const SizedBox(width: 8),
                  const Text(
                    'hunter4dealsapp@gmail.com',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFooter() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Column(
        children: [
          ShaderMask(
            shaderCallback: (bounds) => const LinearGradient(
              colors: [AppColors.primary, AppColors.primaryLight],
            ).createShader(bounds),
            child: const Text(
              'Deal Hunt',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '${DateTime.now().year} Deal Hunt. All rights reserved.',
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Made with transparency and your savings in mind.',
            style: TextStyle(
              color: Colors.grey[500],
              fontSize: 11,
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection({
    required IconData icon,
    required Color iconColor,
    required String title,
    required Widget content,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(width: 12),
            Text(
              title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        content,
      ],
    );
  }

  Widget _buildCheckItem(String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(Icons.check_circle, color: Colors.green[600], size: 18),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              fontSize: 13,
              color: Colors.grey[800],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCommitmentItem(String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(Icons.star, color: Colors.purple[400], size: 16),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              fontSize: 13,
              color: Colors.grey[800],
              height: 1.4,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPartnerChip(String name, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        name,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}
