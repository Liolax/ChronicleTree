# frozen_string_literal: true

Rails.application.configure do
  config.eager_load = ENV["CI"].present?

  config.public_file_server.enabled = true
  config.public_file_server.headers = {
    "Cache-Control" => "public, max-age=3600"
  }

  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false
  config.cache_store                       = :null_store

  config.action_dispatch.show_exceptions = :rescue_exceptions
  config.action_controller.allow_forgery_protection = false
  config.active_storage.service = :test

  config.action_mailer.delivery_method = :test
  config.action_mailer.default_url_options = { host: "example.com" }

  config.active_support.deprecation = :stderr
  config.action_controller.raise_on_missing_callback_actions = true
end
