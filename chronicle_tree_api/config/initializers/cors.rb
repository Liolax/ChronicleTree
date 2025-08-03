# CORS configuration for Chronicle Tree API frontend integration

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Development origins - restrict to frontend domains in production
    origins "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5178", "http://127.0.0.1:5178"

    resource "*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ],
      expose: [ "Authorization" ]
  end
end
