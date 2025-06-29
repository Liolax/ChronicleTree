# frozen_string_literal: true

Devise.setup do |config|
  # Mailer
  config.mailer_sender = 'please-change-me@example.com'

  # ORM
  require 'devise/orm/active_record'

  # Basic config
  config.case_insensitive_keys        = [:email]
  config.strip_whitespace_keys        = [:email]
  config.skip_session_storage         = [:http_auth]
  config.stretches                    = Rails.env.test? ? 1 : 12
  config.reconfirmable               = true
  config.expire_all_remember_me_on_sign_out = true
  config.password_length             = 6..128
  config.email_regexp                = /\A[^@\s]+@[^@\s]+\z/
  config.reset_password_within       = 6.hours
  config.sign_out_via                = :delete

  # Responders
  config.responder.error_status       = :unprocessable_entity
  config.responder.redirect_status    = :see_other

  # JWT integration
  require 'devise/jwt'
  config.jwt do |jwt|
    jwt.secret              = Rails.application.credentials.devise_jwt_secret_key
    jwt.revocation_requests = [
      ['DELETE', %r{^/api/v1/auth/sign_out$}]
    ]
    jwt.expiration_time     = 1.day.to_i
  end
end
