# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # In development, you can use '*' to allow any origin.
    # For production, you should restrict this to your frontend's domain.
    # e.g., origins 'https://www.your-app.com'
    origins "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://localhost:5175"

    resource "*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ],
      expose: [ "Authorization" ] # Expose Authorization header for JWT
  end
end
