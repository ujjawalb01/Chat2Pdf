export const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err.message);

  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred.';

  // Map known errors to standard response format
  if (err.message.includes('Unsupported protocol') || err.message.includes('Unsupported domain')) {
    statusCode = 400;
    code = 'INVALID_URL';
    message = err.message;
  } else if (err.message.includes('Localhost') || err.message.includes('private IP')) {
    statusCode = 403;
    code = 'PRIVATE_URL';
    message = 'Access to private or local network addresses is forbidden.';
  } else if (err.message.includes('not publicly accessible')) {
    statusCode = 403;
    code = 'CONVERSATION_NOT_PUBLIC';
    message = err.message;
  } else if (err.message === 'Platform adapter currently unavailable' || err.message.includes('not supported yet')) {
    statusCode = 501;
    code = 'UNSUPPORTED_PLATFORM';
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    }
  });
};
