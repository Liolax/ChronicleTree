require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.enable_reloading = true
  config.eager_load = false
  config.consider_all_requests_local = true
  config.server_timing = true

  if Rails.root.join("tmp/caching-dev.txt").exist?
    config.public_file_server.headers = { "cache-control" => "public, max-age=#{2.days.to_i}" }
  else
    config.action_controller.perform_caching = false
  end

  config.cache_store = :memory_store
  config.active_storage.service = :local
  
  # Use inline job processing instead of background jobs to avoid Redis dependency
  config.active_job.queue_adapter = :inline
  config.action_mailer.raise_delivery_errors = false
  config.action_mailer.perform_caching = false
  config.action_mailer.default_url_options = { host: "localhost", port: 3000 }
  config.active_support.deprecation = :log
  config.active_record.migration_error = :page_load
  config.active_record.verbose_query_logs = true
  config.active_record.query_log_tags_enabled = true
  config.active_job.verbose_enqueue_logs = true
  config.action_view.annotate_rendered_view_with_filenames = true
  config.action_controller.raise_on_missing_callback_actions = true
  
  # Suppress log shifting messages and other unwanted logs
  config.log_level = :info
  
  # Reduce database query logging noise
  config.active_record.verbose_query_logs = false if ENV['RAILS_ENV'] == 'development' && (ENV['DB_RESET'] || ENV['DB_SEED'])
  
  # Custom logger configuration to suppress log rotation messages
  config.logger = ActiveSupport::Logger.new(STDOUT)
  config.logger.level = Logger::INFO
  
end
