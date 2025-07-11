Rails.application.routes.draw do
  # health check endpoint
  get "up" => "rails/health#show", as: :rails_health_check
  get '/ping', to: 'application#ping'

  # Devise routes for JWT authentication
  devise_for :users,
             path: 'api/v1/auth',
             path_names: {
               sign_in: 'sign_in',
               sign_out: 'sign_out',
               registration: '' # POST to /api/v1/auth
             },
             controllers: {
               sessions:      'api/v1/auth/sessions',
               registrations: 'api/v1/auth/registrations',
               passwords:     'api/v1/auth/passwords'
             }

  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      # =====================
      # Profile & Media API routes (for frontend integration)
      #
      # Avatar (profile picture) upload/removal:
      #   PATCH/PUT /api/v1/profiles/:id   (profile#update, use profile.id)
      #   DELETE    /api/v1/profiles/:id   (profile#destroy, use profile.id)
      #     - Use the `profile.id` field from the API, not `person.id`.
      #
      # Media upload (gallery images, etc):
      #   POST   /api/v1/people/:person_id/media   (media#create, use person.id)
      #   DELETE /api/v1/media/:id                 (media#destroy)
      #     - Use the `person.id` field from the API for uploads.
      #
      # Notes:
      #   - To fetch a person's profile, use GET /api/v1/profiles?person_id=PERSON_ID
      #   - To fetch a person's media, use GET /api/v1/people/:person_id/media
      #   - To fetch a profile by id, use GET /api/v1/profiles/:id
      # =====================

      # Current user endpoints
      get    'users/me',       to: 'users#show'
      patch  'users/me',       to: 'users#update'
      put    'users/me',       to: 'users#update'
      delete 'users/me',       to: 'users#destroy'
      patch  'users/password', to: 'users#update_password'

      # Family‐tree resources
      get 'people/tree', to: 'people#full_tree'

      resources :people, only: %i[index show create update destroy] do
        member do
          get :tree
          get :relatives
        end

        resources :facts,          only: %i[index create]
        resources :timeline_items, only: %i[index create]
        resources :media,          only: %i[index create]
        resource  :note,           only: %i[show create update]
      end

      # Sub‐resources that can be updated/destroyed directly
      resources :facts,          only: %i[update destroy]
      resources :timeline_items, only: %i[update destroy]
      resources :media, only: %i[update destroy]
      resources :relationships,  only: %i[create destroy]
      resources :profiles,       only: %i[index show create update destroy]
    end
  end
end