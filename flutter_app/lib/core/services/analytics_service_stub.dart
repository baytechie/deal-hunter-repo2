/// Stub implementation for non-web platforms
/// These functions do nothing on mobile - analytics is handled differently

void trackEventJS(String eventName, Map<String, dynamic>? params) {
  // No-op on mobile platforms
}

void trackPageViewJS(String pageName) {
  // No-op on mobile platforms
}
