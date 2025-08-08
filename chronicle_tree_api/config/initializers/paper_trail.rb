# frozen_string_literal: true

# Paper Trail configuration for audit trails
PaperTrail.configure do |config|
  # Store metadata with each version
  config.version_limit = 1000
  
  # Custom serializer for better data storage
  config.serializer = PaperTrail::Serializers::JSON
  
  # Enable tracking for most operations
  config.enabled = true
end

# Custom Paper Trail configuration
module PaperTrailCustom
  def self.included(base)
    base.extend(ClassMethods)
  end

  module ClassMethods
    def chronicle_versioned
      has_paper_trail(
        versions: {
          class_name: 'PaperTrail::Version'
        },
        meta: {
          user_id: :current_user_id,
          user_email: :current_user_email,
          ip_address: :current_ip,
          user_agent: :current_user_agent,
          request_id: :current_request_id
        }
      )
    end
  end

  private

  def current_user_id
    PaperTrail.request.whodunnit
  end

  def current_user_email
    PaperTrail.request.controller_info.try(:[], :user_email) || 'system@chronicletree.app'
  end

  def current_ip
    PaperTrail.request.controller_info.try(:[], :ip_address) || '127.0.0.1'
  end

  def current_user_agent
    PaperTrail.request.controller_info.try(:[], :user_agent)
  end

  def current_request_id
    PaperTrail.request.controller_info.try(:[], :request_id)
  end
end

# Set up request tracking
PaperTrail.request.enabled = true
