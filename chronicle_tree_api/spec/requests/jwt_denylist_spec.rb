require 'rails_helper'

RSpec.describe "JWT Denylist", type: :request do
  let(:user) { create(:user, password: "Password123!") }

  it "adds JWT to denylist on logout and rejects further use" do
    # Login to get JWT
    post "/api/v1/auth/sign_in", params: { user: { email: user.email, password: "Password123!" } }
    token = JSON.parse(response.body)["token"]

    # Logout (DELETE)
    delete "/api/v1/auth/sign_out", headers: { "Authorization" => "Bearer #{token}" }
    expect(response).to have_http_status(:no_content)

    # Token should be in the denylist
    jti = Warden::JWTAuth::TokenDecoder.new.call(token)["jti"]
    expect(JwtDenylist.exists?(jti: jti)).to be true

    # Token is now denied for further requests
    get "/api/v1/users/me", headers: { "Authorization" => "Bearer #{token}" }
    expect(response).to have_http_status(:unauthorized)
  end
end
