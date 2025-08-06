# Chronicle Tree - Family Tree Application
# for genealogical research and family relationship management
require_relative "boot"

require "rails/all"

Bundler.require(*Rails.groups)

# Require custom middleware
require_relative '../app/middleware/security_middleware'

module ChronicleTreeApi
  class Application < Rails::Application
    config.load_defaults 8.0

    config.autoload_lib(ignore: %w[assets tasks])

    # Configure Redis for caching (disabled for development without Redis)
    # config.cache_store = :redis_cache_store, {
    #   url: ENV.fetch('REDIS_URL') { 'redis://localhost:6379/1' },
    #   expires_in: 90.minutes,
    #   race_condition_ttl: 10.seconds
    # }

    # API-only application configuration
    config.api_only = true

    # Security middleware for comprehensive monitoring
    config.middleware.use SecurityMiddleware
    
    # Rate limiting middleware
    config.middleware.use Rack::Attack

    # JWT authentication middleware
    config.middleware.use Warden::JWTAuth::Middleware
  end
end
