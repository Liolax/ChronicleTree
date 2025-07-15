# Filters sensitive parameters from Rails logs to enhance user privacy and security.
Rails.application.config.filter_parameters += [
  :password, :email, :secret, :token, :_key, :crypt, :salt, :certificate, :otp, :ssn, :cvv, :cvc
]
