Rails.application.routes.draw do
  # health check endpoint
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      # Devise‐JWT routes under /api/v1/auth
      devise_for :users,
                 path: 'auth',
                 controllers: {
                   sessions:      'api/v1/auth/sessions',
                   registrations: 'api/v1/auth/registrations',
                   passwords:     'api/v1/auth/passwords'
                 }

      # Current user endpoints
      get    'users/me',       to: 'users#show'
      patch  'users/me',       to: 'users#update'
      put    'users/me',       to: 'users#update'
      delete 'users/me',       to: 'users#destroy'
      patch  'users/password', to: 'users#update_password'

      # Family‐tree resources
      resources :people, only: %i[index show create update destroy] do
        member do
          get :tree
          get :relatives
        end

        resources :facts,          only: %i[index create]
        resources :timeline_items, only: %i[index create]
        resources :media,          only: %i[index create]
      end

      # Sub‐resources that can be updated/destroyed directly
      resources :facts,          only: %i[update destroy]
      resources :timeline_items, only: %i[update destroy]
      resources :media,          only: %i[destroy]
      resources :relationships,  only: %i[create destroy]
    end
  end
end
