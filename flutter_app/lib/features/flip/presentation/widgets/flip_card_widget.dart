import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:money_saver_deals/features/deals/domain/entities/deal.dart';
import 'package:money_saver_deals/features/flip/presentation/widgets/deal_card_front.dart';
import 'package:money_saver_deals/features/flip/presentation/widgets/deal_card_back.dart';

/// FlipCardWidget - A card that can flip between front and back views
///
/// Shows deal summary on front, detailed analysis on back.
/// Supports tap to flip animation with 3D rotation effect.
class FlipCardWidget extends StatefulWidget {
  final Deal deal;
  final bool isSaved;
  final VoidCallback onSaveToggle;
  final VoidCallback onBuyPressed;
  final VoidCallback onCopyCoupon;
  final int currentIndex;
  final int totalDeals;

  const FlipCardWidget({
    super.key,
    required this.deal,
    required this.isSaved,
    required this.onSaveToggle,
    required this.onBuyPressed,
    required this.onCopyCoupon,
    required this.currentIndex,
    required this.totalDeals,
  });

  @override
  State<FlipCardWidget> createState() => _FlipCardWidgetState();
}

class _FlipCardWidgetState extends State<FlipCardWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  bool _showFront = true;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    _animation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _toggleCard() {
    if (_showFront) {
      _controller.forward();
    } else {
      _controller.reverse();
    }
    setState(() {
      _showFront = !_showFront;
    });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _toggleCard,
      child: AnimatedBuilder(
        animation: _animation,
        builder: (context, child) {
          final angle = _animation.value * math.pi;
          final isFront = angle < (math.pi / 2);

          return Transform(
            alignment: Alignment.center,
            transform: Matrix4.identity()
              ..setEntry(3, 2, 0.001) // perspective
              ..rotateY(angle),
            child: isFront
                ? DealCardFront(
                    deal: widget.deal,
                    isSaved: widget.isSaved,
                    onSaveToggle: widget.onSaveToggle,
                    onFlipPressed: _toggleCard,
                    currentIndex: widget.currentIndex,
                    totalDeals: widget.totalDeals,
                  )
                : Transform(
                    alignment: Alignment.center,
                    transform: Matrix4.identity()..rotateY(math.pi),
                    child: DealCardBack(
                      deal: widget.deal,
                      onBuyPressed: widget.onBuyPressed,
                      onCopyCoupon: widget.onCopyCoupon,
                      onFlipBack: _toggleCard,
                    ),
                  ),
          );
        },
      ),
    );
  }
}
