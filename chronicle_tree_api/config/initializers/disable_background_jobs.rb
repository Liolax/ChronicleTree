# Disable background jobs in development to avoid Redis dependency
if Rails.env.development?
  # Override job enqueuing to run inline
  class ActiveJob::Base
    def self.perform_later(*args)
      perform_now(*args)
    end
  end
  
  # Ensure no Redis connections
  Rails.application.config.active_job.queue_adapter = :inline
  
  puts "Background jobs disabled for development environment"
end