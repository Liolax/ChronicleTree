# frozen_string_literal: true

# Security monitoring middleware for comprehensive API access tracking
class SecurityMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    request = Rack::Request.new(env)
    start_time = Time.current
    
    # Log incoming request
    log_request_start(request)
    
    # Process request
    status, headers, response = @app.call(env)
    
    # Log response
    log_request_end(request, status, start_time)
    
    [status, headers, response]
  rescue => e
    # Log errors
    log_error(request, e)
    raise e
  end

  private

  def log_request_start(request)
    Rails.logger.info({
      event: 'api_request_start',
      method: request.request_method,
      path: request.path,
      ip: request.ip,
      user_agent: request.user_agent,
      referer: request.referer,
      content_type: request.content_type,
      content_length: request.content_length,
      query_params: request.query_string,
      timestamp: Time.current.iso8601
    }.to_json)
  end

  def log_request_end(request, status, start_time)
    duration = Time.current - start_time
    
    Rails.logger.info({
      event: 'api_request_end',
      method: request.request_method,
      path: request.path,
      status: status,
      duration_ms: (duration * 1000).round(2),
      ip: request.ip,
      timestamp: Time.current.iso8601
    }.to_json)
    
    # Log suspicious activity
    if suspicious_request?(request, status, duration)
      log_suspicious_activity(request, status, duration)
    end
  end

  def log_error(request, error)
    Rails.logger.error({
      event: 'api_error',
      method: request.request_method,
      path: request.path,
      ip: request.ip,
      error_class: error.class.name,
      error_message: error.message,
      timestamp: Time.current.iso8601
    }.to_json)
  end

  def suspicious_request?(request, status, duration)
    # Define suspicious patterns
    duration > 30.seconds ||  # Very slow requests
    status == 429 ||          # Rate limited
    status >= 500 ||          # Server errors
    request.path.include?('..') ||  # Path traversal attempts
    request.path.include?('<script') || # XSS attempts
    request.user_agent&.include?('bot') # Bot traffic
  end

  def log_suspicious_activity(request, status, duration)
    Rails.logger.warn({
      event: 'suspicious_activity',
      method: request.request_method,
      path: request.path,
      ip: request.ip,
      user_agent: request.user_agent,
      status: status,
      duration_ms: (duration * 1000).round(2),
      timestamp: Time.current.iso8601
    }.to_json)
  end
end
