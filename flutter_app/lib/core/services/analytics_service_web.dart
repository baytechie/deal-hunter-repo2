import 'dart:js_interop';

/// Web implementation using JavaScript interop for GA4

void trackEventJS(String eventName, Map<String, dynamic>? params) {
  try {
    final jsParams = params?.jsify();
    _trackEventJS(eventName.toJS, jsParams);
  } catch (e) {
    // Silently fail if gtag is not available
  }
}

void trackPageViewJS(String pageName) {
  try {
    _trackPageViewJS(pageName.toJS);
  } catch (e) {
    // Silently fail if gtag is not available
  }
}

@JS('trackEvent')
external void _trackEventJS(JSString eventName, JSAny? params);

@JS('trackPageView')
external void _trackPageViewJS(JSString pageName);
