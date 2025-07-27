# frozen_string_literal: true

Devise.setup do |config|
  # ==> Mailer Configuration
  config.mailer_sender = "please-change-me@example.com"

  # ==> ORM configuration
  require "devise/orm/active_record"

  # ==> Configuration for any authentication mechanism
  config.case_insensitive_keys = [ :email ]
  config.strip_whitespace_keys = [ :email ]
  config.skip_session_storage = [ :http_auth ]
  config.stretches = Rails.env.test? ? 1 : 12
  config.reconfirmable = true
  config.expire_all_remember_me_on_sign_out = true
  config.password_length = 6..128
  config.email_regexp = /\A[^@\s]+@[^@\s]+\z/
  config.reset_password_within = 6.hours
  config.sign_out_via = :delete
  config.navigational_formats = []

  # ==> JWT Configuration
  # Setup for devise-jwt gem (0.12.x)
  config.jwt do |jwt|
    jwt.secret = Rails.application.credentials.devise_jwt_secret_key
    jwt.dispatch_requests = [
      [ "POST",   %r{^/api/v1/auth/sign_in$} ],
      [ "POST",   %r{^/api/v1/auth$} ]
    ]
    jwt.revocation_requests = [
      [ "DELETE", %r{^/api/v1/auth/sign_out$} ]
    ]
    jwt.expiration_time = 1.day.to_i
    # Revocation strategy is configured in the User model
  end
end
