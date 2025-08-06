class ApplicationController < ActionController::API
  include Devise::Controllers::Helpers
  include AuditLogging

  # Set up Paper Trail request information
  before_action :set_paper_trail_whodunnit
  before_action :set_paper_trail_metadata

  def ping
    render json: { user: current_user&.email }
  end

  private

  def set_paper_trail_whodunnit
    if current_user
      PaperTrail.request.whodunnit = current_user.id
    end
  end

  def set_paper_trail_metadata
    return unless defined?(PaperTrail)
    
    PaperTrail.request.controller_info = {
      user_email: current_user&.email,
      ip_address: request.remote_ip,
      user_agent: request.user_agent,
      request_id: request.uuid
    }
  rescue => e
    Rails.logger.debug "PaperTrail metadata setup failed: #{e.message}"
  end
end
