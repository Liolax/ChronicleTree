# frozen_string_literal: true

# Paper Trail configuration for comprehensive audit trails
PaperTrail.configure do |config|
  # Store comprehensive metadata with each version
  config.version_limit = 1000
  config.track_associations = true
  
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
    PaperTrail.request[:user_email]
  end

  def current_ip
    PaperTrail.request[:ip_address]
  end

  def current_user_agent
    PaperTrail.request[:user_agent]
  end

  def current_request_id
    PaperTrail.request[:request_id]
  end
end

# Set up request tracking
PaperTrail.request.enabled = true
