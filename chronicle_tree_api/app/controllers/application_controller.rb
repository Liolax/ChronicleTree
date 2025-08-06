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
    PaperTrail.request[:user_email] = current_user&.email
    PaperTrail.request[:ip_address] = request.remote_ip
    PaperTrail.request[:user_agent] = request.user_agent
    PaperTrail.request[:request_id] = request.uuid
  end
end
