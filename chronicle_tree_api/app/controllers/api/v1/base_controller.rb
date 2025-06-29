module Api
  module V1
    class BaseController < ActionController::API
      # Require a signed-in user for *all* API actions by default
      before_action :authenticate_user!
    end
  end
end
  end
end
