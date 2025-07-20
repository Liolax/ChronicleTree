# frozen_string_literal: true

# Configure Sidekiq for background job processing

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

# Configure Rails to use Sidekiq for background jobs
Rails.application.config.active_job.queue_adapter = :sidekiq