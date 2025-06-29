class ApplicationController < ActionController::API
  include Devise::Controllers::Helpers

  def ping
    render json: { user: current_user&.email }
  end
end