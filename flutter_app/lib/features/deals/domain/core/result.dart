/// Result wrapper for handling success and error states
/// 
/// Why: Provides a clean way to handle both success and failure cases
/// without throwing exceptions up the call stack. Enables functional
/// error handling patterns.
abstract class Result<T> {
  const Result();

  /// Execute different logic based on success or failure
  R when<R>({
    required R Function(T data) success,
    required R Function(String error) failure,
  });
}

/// Success result containing the data
class Success<T> extends Result<T> {
  final T data;

  const Success(this.data);

  @override
  R when<R>({
    required R Function(T data) success,
    required R Function(String error) failure,
  }) {
    return success(data);
  }
}

/// Failure result containing error message
class Failure<T> extends Result<T> {
  final String error;

  const Failure(this.error);

  @override
  R when<R>({
    required R Function(T data) success,
    required R Function(String error) failure,
  }) {
    return failure(error);
  }
}
