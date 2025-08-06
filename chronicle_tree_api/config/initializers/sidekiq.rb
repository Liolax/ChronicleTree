# frozen_string_literal: true

# Configure Sidekiq for background job processing (production only)
# Development uses inline job processing to avoid Redis dependency

if defined?(Sidekiq) && Rails.env.production?
  Sidekiq.configure_server do |config|
    config.redis = {
      url: ENV.fetch('REDIS_URL') { 'redis://localhost:6379/0' },
      size: 10
    }
  end

  Sidekiq.configure_client do |config|
    config.redis = {
      url: ENV.fetch('REDIS_URL') { 'redis://localhost:6379/0' },
      size: 2
    }
  end

  # Configure Rails to use Sidekiq for background jobs in production
  Rails.application.config.active_job.queue_adapter = :sidekiq
else
  # Explicitly set inline adapter for development/test
  Rails.application.config.active_job.queue_adapter = :inline
end