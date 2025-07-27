# Chronicle Tree API routing configuration for family tree management system
Rails.application.routes.draw do
  # Health check endpoint for monitoring
  get "up" => "rails/health#show", as: :rails_health_check
  get "/ping", to: "application#ping"
  
  # Static file serving for generated share images
  get '/generated_shares/*path', to: 'share_images#show', constraints: { path: /.+/ }
  
  # Public sharing pages for social media crawlers
  get '/profile/:id', to: 'public_shares#profile', as: :public_profile_share
  get '/tree', to: 'public_shares#tree', as: :public_tree_share

  # Background job monitoring interface (development environment only)
  if Rails.env.development?
    require 'sidekiq/web'
    mount Sidekiq::Web => '/sidekiq'
  end

  # User authentication routes using Devise with JWT tokens
  devise_for :users,
             path: "api/v1/auth",
             defaults: { format: :json },
             path_names: {
               sign_in: "sign_in",
               sign_out: "sign_out",
               registration: "" # POST to /api/v1/auth
             },
             controllers: {
               sessions:      "api/v1/auth/sessions",
               registrations: "api/v1/auth/registrations",
               passwords:     "api/v1/auth/passwords"
             }

  namespace :api, defaults: { format: :json } do
    namespace :v1 do

      # User account management endpoints
      get    "users/me",       to: "users#show"
      patch  "users/me",       to: "users#update"
      put    "users/me",       to: "users#update"
      delete "users/me",       to: "users#destroy"
      patch  "users/password", to: "users#update_password"

      # Core family tree data management
      get "people/full_tree", to: "people#full_tree"

      resources :people, only: %i[index show create update destroy] do
        member do
          get :tree
          get :relatives
          get :relationship_stats
        end

        resources :facts,          only: %i[index create]
        resources :timeline_items, only: %i[index create]
        resources :media,          only: %i[index create]
        resource  :note,           only: %i[show create update]
      end

      # Direct resource management for nested entities
      resources :facts,          only: %i[update destroy]
      resources :timeline_items, only: %i[update destroy]
      resources :media, only: %i[update destroy]
      resources :relationships,  only: %i[create destroy] do
        member do
          patch :toggle_ex
          patch :toggle_deceased
        end
      end
      resources :profiles,       only: %i[index show create update destroy]
      
      # Social media sharing and content generation
      resources :shares, only: %i[create show]
      
      # Dynamic image generation for social sharing
      namespace :share do
        get 'profile/:id', to: 'images#profile'
        get 'tree/:id', to: 'images#tree'
        delete 'cleanup', to: 'images#cleanup'
      end
    end
  end
end
