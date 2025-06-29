# frozen_string_literal: true

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # Do not eager load code on boot. This avoids loading your whole application
  # just for running a single test. If you are using a tool that preloads Rails
  # for running tests, you may want to set it to true.
  config.eager_load = ENV["CI"].present?

  # Configure public file server for tests with Cache-Control for performance.
  config.public_file_server.enabled = true
  config.public_file_server.headers = {
    "Cache-Control" => "public, max-age=3600"
  }

  # Show full error reports and disable caching.
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false
  config.cache_store                       = :null_store

  # Raise exceptions instead of rendering exception templates.
  config.action_dispatch.show_exceptions = :rescue_exceptions

  # Disable CSRF protection in test environment.
  config.action_controller.allow_forgery_protection = false

  # Use the test storage service for ActiveStorage (stored locally).
  config.active_storage.service = :test

  # Tell Action Mailer not to deliver emails to the real world.
  config.action_mailer.delivery_method = :test
  config.action_mailer.default_url_options = { host: "example.com" }

  # Print deprecation notices to the stderr.
  config.active_support.deprecation = :stderr

  # Raise error when a before_action’s only/except options reference missing actions.
  config.action_controller.raise_on_missing_callback_actions = true
end
