class AdminView {
    static formatSuccessResponse(message, data) {
      return {
        status: 'success',
        message: message,
        data: data
      };
    }
  
    static formatErrorResponse(errorMessage) {
      return {
        status: 'error',
        message: errorMessage
      };
    }

    
  }
  
  module.exports = AdminView;
  