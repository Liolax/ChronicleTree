# frozen_string_literal: true

# Rack::Attack configuration for rate limiting and abuse prevention
# Provides comprehensive protection against various attack vectors

class Rack::Attack
  # Configuration
  Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new

  # Enable detailed logging for rate limiting events
  ActiveSupport::Notifications.subscribe("rack.attack") do |name, start, finish, request_id, req|
    Rails.logger.info({
      event: 'rack_attack',
      name: name,
      ip: req.ip,
      path: req.path,
      matched: req.env['rack.attack.matched'],
      match_type: req.env['rack.attack.match_type'],
      match_data: req.env['rack.attack.match_data'],
      timestamp: Time.current
    }.to_json)
  end

  # Allow localhost and development IPs
  safelist('allow from localhost') do |req|
    req.ip == '127.0.0.1' || req.ip == '::1' || req.ip.start_with?('192.168.') || req.ip.start_with?('10.')
  end

  # Block known bad IPs (can be populated from threat intelligence)
  blocklist('block bad IPs') do |req|
    # Example: Add known malicious IPs here
    # ['1.2.3.4', '5.6.7.8'].include?(req.ip)
    false
  end

  # General API rate limiting
  throttle('api requests by ip', limit: 300, period: 5.minutes) do |req|
    req.ip if req.path.start_with?('/api/')
  end

  # More restrictive rate limiting for authenticated users
  throttle('api requests by user', limit: 1000, period: 1.hour) do |req|
    if req.path.start_with?('/api/') && req.env['warden']&.user
      req.env['warden'].user.id
    end
  end

  # Authentication endpoints - stricter limits
  throttle('login attempts by ip', limit: 5, period: 20.seconds) do |req|
    if req.path == '/api/v1/auth/sign_in' && req.post?
      req.ip
    end
  end

  throttle('login attempts by email', limit: 10, period: 1.hour) do |req|
    if req.path == '/api/v1/auth/sign_in' && req.post? && req.params['user']
      req.params['user']['email']&.downcase&.strip
    end
  end

  # Registration rate limiting
  throttle('registration by ip', limit: 3, period: 1.hour) do |req|
    if req.path == '/api/v1/auth' && req.post?
      req.ip
    end
  end

  # Password reset protection
  throttle('password reset by ip', limit: 5, period: 1.hour) do |req|
    if req.path == '/api/v1/auth/password' && req.post?
      req.ip
    end
  end

  # Resource-intensive operations
  throttle('media uploads by user', limit: 20, period: 1.hour) do |req|
    if req.path.include?('/media') && req.post? && req.env['warden']&.user
      req.env['warden'].user.id
    end
  end

  throttle('share generation by user', limit: 50, period: 1.hour) do |req|
    if req.path.include?('/share/') && req.env['warden']&.user
      req.env['warden'].user.id
    end
  end

  # Tree operations rate limiting
  throttle('tree operations by user', limit: 100, period: 1.hour) do |req|
    if req.path.match(%r{/api/v1/(people|relationships)}) && 
       (req.post? || req.put? || req.patch? || req.delete?) && 
       req.env['warden']&.user
      req.env['warden'].user.id
    end
  end

  # Exponential backoff for repeated violations
  throttle('exponential backoff', limit: 1, period: lambda { |req|
    match_data = req.env['rack.attack.match_data']
    if match_data
      # Exponential backoff: 1min, 2min, 4min, 8min, etc.
      2 ** (match_data[:count] - 1).clamp(0, 8)
    else
      1.minute
    end
  }) do |req|
    if req.env['rack.attack.matched'] && req.env['rack.attack.match_type'] == :throttle
      req.ip
    end
  end

  # Custom response for blocked requests
  self.blocklisted_response = lambda do |env|
    Rails.logger.warn({
      event: 'request_blocked',
      ip: env['REMOTE_ADDR'],
      path: env['PATH_INFO'],
      reason: 'blocklisted',
      timestamp: Time.current
    }.to_json)

    [403, {'Content-Type' => 'application/json'}, [JSON.generate({
      error: 'Forbidden',
      message: 'Your request has been blocked'
    })]]
  end

  # Custom response for rate limited requests
  self.throttled_response = lambda do |env|
    match_data = env['rack.attack.match_data']
    retry_after = match_data[:period] - (Time.current.to_i % match_data[:period])

    Rails.logger.warn({
      event: 'request_throttled',
      ip: env['REMOTE_ADDR'],
      path: env['PATH_INFO'],
      limit: match_data[:limit],
      period: match_data[:period],
      count: match_data[:count],
      retry_after: retry_after,
      timestamp: Time.current
    }.to_json)

    [429, {
      'Content-Type' => 'application/json',
      'Retry-After' => retry_after.to_s,
      'X-RateLimit-Limit' => match_data[:limit].to_s,
      'X-RateLimit-Remaining' => [0, match_data[:limit] - match_data[:count]].max.to_s,
      'X-RateLimit-Reset' => (Time.current + retry_after).to_i.to_s
    }, [JSON.generate({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retry_after: retry_after
    })]]
  end
end

# Only enable Rack::Attack in production and staging
Rails.application.config.middleware.use Rack::Attack unless Rails.env.development?
