Rails.application.routes.draw do
  # Health check endpoint, keep at top
  get "up" => "rails/health#show", as: :rails_health_check

  # All of your application’s JSON API lives under /api/v1
  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      devise_for :users,
        path: 'auth',
        controllers: {
          sessions:      'api/v1/auth/sessions',
          registrations: 'api/v1/auth/registrations',
          passwords:     'api/v1/auth/passwords'
        }

      # Users: show/update profile, change password, delete account
      get    'users/me', to: 'users#show'
      patch  'users/me', to: 'users#update'
      put    'users/me', to: 'users#update'
      delete 'users/me', to: 'users#destroy'
      patch  'users/password', to: 'users#update_password'

      # People & all nested resources
      resources :people, only: %i[index show create update destroy] do
        member do
          get :tree       # /api/v1/people/:id/tree
          get :relatives  # /api/v1/people/:id/relatives
        end

        resources :facts,          only: %i[index create]
        resources :timeline_items, only: %i[index create]
        resources :media,          only: %i[index create]
      end

      # Standalone updates/deletes
      resources :facts,          only: %i[update destroy]
      resources :timeline_items, only: %i[update destroy]
      resources :media,          only: %i[destroy]
      resources :relationships,  only: %i[create destroy]
    end
  end

  # If you still need the legacy Rails-generated HTML controllers 
  # (e.g. scaffolds for people, media, profiles), leave those below.
  # Otherwise you can remove/comment them out:
  #
  # resources :media
  # resources :profiles
  # resources :relationships
  # resources :people
  # devise_for :users

  # You can set root (HTML) if needed, or point to your SPA container:
  # root "home#index"
end
  # root "home#index"
