module Api
  module V1
    class BaseController < ApplicationController
    include ActionController::RequestForgeryProtection
      protect_from_forgery with: :null_session
      before_action   :authenticate_user!
      respond_to      :json
    end
  end
end
