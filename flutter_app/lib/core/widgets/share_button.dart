import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:money_saver_deals/core/theme/app_theme.dart';
import 'package:money_saver_deals/core/widgets/share_bottom_sheet.dart';
import 'package:money_saver_deals/features/deals/domain/entities/deal.dart';

/// ShareButton - Circular share icon button for deal cards
///
/// Follows design system with 44x44px touch target and 36x36px visual.
/// Opens share bottom sheet on tap.
class ShareButton extends StatefulWidget {
  final Deal deal;

  /// Optional callback after successful share
  final VoidCallback? onShareComplete;

  /// Size variant for different contexts
  final ShareButtonSize size;

  const ShareButton({
    super.key,
    required this.deal,
    this.onShareComplete,
    this.size = ShareButtonSize.small,
  });

  @override
  State<ShareButton> createState() => _ShareButtonState();
}

class _ShareButtonState extends State<ShareButton> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _handleTapDown(TapDownDetails details) {
    setState(() => _isPressed = true);
    _animationController.forward();
  }

  void _handleTapUp(TapUpDetails details) {
    setState(() => _isPressed = false);
    _animationController.reverse();
  }

  void _handleTapCancel() {
    setState(() => _isPressed = false);
    _animationController.reverse();
  }

  void _openShareSheet() {
    HapticFeedback.lightImpact();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => ShareBottomSheet(
        deal: widget.deal,
        onShareComplete: widget.onShareComplete,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final dimensions = widget.size.dimensions;

    return Semantics(
      label: 'Share ${widget.deal.title}',
      button: true,
      child: GestureDetector(
        onTapDown: _handleTapDown,
        onTapUp: _handleTapUp,
        onTapCancel: _handleTapCancel,
        onTap: _openShareSheet,
        child: Container(
          width: dimensions.touchTarget,
          height: dimensions.touchTarget,
          alignment: Alignment.center,
          child: AnimatedBuilder(
            animation: _scaleAnimation,
            builder: (context, child) => Transform.scale(
              scale: _scaleAnimation.value,
              child: Container(
                width: dimensions.visual,
                height: dimensions.visual,
                decoration: BoxDecoration(
                  color: _isPressed ? AppColors.primarySurface : AppColors.surface,
                  shape: BoxShape.circle,
                  boxShadow: AppShadows.subtleShadow,
                ),
                child: Icon(
                  Icons.share_rounded,
                  size: dimensions.iconSize,
                  color: _isPressed ? AppColors.primary : AppColors.textMuted,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Size variants for ShareButton
enum ShareButtonSize {
  /// Small size for deal cards in grid view
  small,

  /// Large size for flip view full-screen cards
  large,
}

extension on ShareButtonSize {
  _ButtonDimensions get dimensions {
    switch (this) {
      case ShareButtonSize.small:
        return const _ButtonDimensions(
          touchTarget: 44,
          visual: 36,
          iconSize: 18,
        );
      case ShareButtonSize.large:
        return const _ButtonDimensions(
          touchTarget: 48,
          visual: 40,
          iconSize: 22,
        );
    }
  }
}

class _ButtonDimensions {
  final double touchTarget;
  final double visual;
  final double iconSize;

  const _ButtonDimensions({
    required this.touchTarget,
    required this.visual,
    required this.iconSize,
  });
}
