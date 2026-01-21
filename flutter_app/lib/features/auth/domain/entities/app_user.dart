/// App User entity representing the authenticated user
///
/// Immutable class containing user profile information
class AppUser {
  final String id;
  final String? email;
  final String? displayName;
  final String? avatarUrl;
  final bool emailVerified;
  final DateTime? createdAt;
  final DateTime? lastLoginAt;

  const AppUser({
    required this.id,
    this.email,
    this.displayName,
    this.avatarUrl,
    this.emailVerified = false,
    this.createdAt,
    this.lastLoginAt,
  });

  /// Create from JSON response
  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id'] as String,
      email: json['email'] as String?,
      displayName: json['displayName'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      emailVerified: json['emailVerified'] as bool? ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String)
          : null,
      lastLoginAt: json['lastLoginAt'] != null
          ? DateTime.tryParse(json['lastLoginAt'] as String)
          : null,
    );
  }

  /// Get display name or fallback to email username
  String get name => displayName ?? email?.split('@').first ?? 'User';

  /// Check if user has a profile picture
  bool get hasAvatar => avatarUrl != null && avatarUrl!.isNotEmpty;
}

/// Authentication response containing tokens and user info
class AuthResponse {
  final String accessToken;
  final String refreshToken;
  final AppUser user;

  const AuthResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      user: AppUser.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}
