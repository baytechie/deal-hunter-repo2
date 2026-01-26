# Flutter specific rules
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

# Keep Google Sign-In classes
-keep class com.google.android.gms.** { *; }
-keep class com.google.firebase.** { *; }

# Keep Dio HTTP client
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**

# Keep secure storage
-keep class com.it_nomads.fluttersecurestorage.** { *; }
