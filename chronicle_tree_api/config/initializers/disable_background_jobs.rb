# Disable background jobs and Redis in development to avoid Redis dependency
if Rails.env.development?
  # Override job enqueuing to run inline
  class ActiveJob::Base
    def self.perform_later(*args)
      perform_now(*args)
    end
  end
  
  # Ensure no Redis connections
  Rails.application.config.active_job.queue_adapter = :inline
  
  # Prevent ActiveStorage from using background jobs for image processing
  Rails.application.config.after_initialize do
    # Disable variant processing jobs
    if defined?(ActiveStorage::AnalyzeJob)
      ActiveStorage::AnalyzeJob.queue_adapter = :inline
    end
    if defined?(ActiveStorage::PurgeJob)  
      ActiveStorage::PurgeJob.queue_adapter = :inline
    end
    if defined?(ActiveStorage::ProcessImageJob)
      ActiveStorage::ProcessImageJob.queue_adapter = :inline
    end
  end
  
  # Stub Redis to prevent connection attempts
  if defined?(Redis)
    class Redis
      def self.new(*args)
        raise "Redis disabled in development environment"
      end
      
      def self.current
        raise "Redis disabled in development environment"
      end
      
      def self.connect(*args)
        raise "Redis disabled in development environment"  
      end
    end
  end
  
  # Stub Sidekiq to prevent Redis connections
  if defined?(Sidekiq)
    module Sidekiq
      def self.configure_server(&block)
        # No-op
      end
      
      def self.configure_client(&block)
        # No-op  
      end
      
      def self.redis(&block)
        # No-op
      end
    end
  end
  
  puts "Background jobs and Redis disabled for development environment"
end