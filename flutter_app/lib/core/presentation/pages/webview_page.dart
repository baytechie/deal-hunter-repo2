import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

/// WebView Page for displaying web content
/// 
/// SOLID Principles:
/// - Single Responsibility: Only renders and manages WebView
/// - Open/Closed: Can be extended with new features without modification
/// 
/// Why: Provides in-app browsing fallback when:
/// - Amazon app is not installed
/// - URL cannot be opened in external browser
/// - Better UX by keeping user in the app
/// 
/// On Web: Opens URL in new browser tab instead of WebView
class WebViewPage extends StatefulWidget {
  /// URL to display in WebView
  final String url;

  /// Page title for AppBar
  final String title;

  /// Constructor
  const WebViewPage({
    required this.url,
    this.title = 'Viewing Deal',
    super.key,
  });

  @override
  State<WebViewPage> createState() => _WebViewPageState();
}

class _WebViewPageState extends State<WebViewPage> {
  @override
  void initState() {
    super.initState();
    debugPrint('[WebViewPage] Initializing with URL: ${widget.url}');
    
    // On web, automatically open URL in new tab
    if (kIsWeb) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _openInNewTab();
      });
    }
  }

  Future<void> _openInNewTab() async {
    debugPrint('[WebViewPage] Web platform - opening URL in new tab');
    final launched = await launchUrl(
      Uri.parse(widget.url),
      webOnlyWindowName: '_blank',
    );
    
    if (launched && mounted) {
      // Go back to previous page after opening new tab
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    // On web, show a loading screen while redirecting
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(),
            const SizedBox(height: 16),
            Text(
              kIsWeb 
                ? 'Opening deal in new tab...'
                : 'Loading deal page...',
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _openInNewTab,
              child: const Text('Open Deal'),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Go Back'),
            ),
          ],
        ),
      ),
    );
  }
}
