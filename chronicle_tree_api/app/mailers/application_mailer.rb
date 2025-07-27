# Base mailer class for Chronicle Tree email communication system
# Provides default configuration and layout for all application emails
class ApplicationMailer < ActionMailer::Base
  default from: "from@example.com"
  layout "mailer"
end
