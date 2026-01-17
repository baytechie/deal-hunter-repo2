import 'package:flutter/material.dart';

/// Categories Page - Browse deals by category
class CategoriesPage extends StatefulWidget {
  const CategoriesPage({super.key});

  @override
  State<CategoriesPage> createState() => _CategoriesPageState();
}

class _CategoriesPageState extends State<CategoriesPage> {
  final List<Map<String, dynamic>> _categories = [
    {
      'name': 'Electronics',
      'icon': Icons.devices,
      'color': Colors.blue,
      'count': 24,
    },
    {
      'name': 'Fashion',
      'icon': Icons.shopping_bag,
      'color': Colors.pink,
      'count': 18,
    },
    {
      'name': 'Home & Kitchen',
      'icon': Icons.home,
      'color': Colors.orange,
      'count': 32,
    },
    {
      'name': 'Sports',
      'icon': Icons.sports_basketball,
      'color': Colors.green,
      'count': 15,
    },
    {
      'name': 'Books',
      'icon': Icons.library_books,
      'color': Colors.purple,
      'count': 12,
    },
    {
      'name': 'Beauty',
      'icon': Icons.face,
      'color': Colors.red,
      'count': 20,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('Categories'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 1,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
        ),
        itemCount: _categories.length,
        itemBuilder: (context, index) {
          final category = _categories[index];
          return GestureDetector(
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Viewing ${category['name']} deals'),
                  duration: const Duration(seconds: 1),
                ),
              );
            },
            child: Card(
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      (category['color'] as Color).withOpacity(0.1),
                      (category['color'] as Color).withOpacity(0.05),
                    ],
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      category['icon'] as IconData,
                      size: 48,
                      color: category['color'] as Color,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      category['name'] as String,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${category['count']} deals',
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
