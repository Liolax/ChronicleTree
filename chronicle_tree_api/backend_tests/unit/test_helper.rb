ENV["RAILS_ENV"] ||= "test"
require_relative "../../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    # Parallel test execution configuration for improved performance
    parallelize(workers: :number_of_processors, with: :threads)

    # Load test fixture data for comprehensive test scenarios
    fixtures :all

    # Authentication helper methods for API testing
    def sign_in_as(user)
      post api_v1_user_session_url, params: { user: { email: user.email, password: "Password123!" } }, as: :json
      JSON.parse(response.body)["token"]
    end
  end
end
