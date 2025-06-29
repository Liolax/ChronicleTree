module Api
  module V1
    class MediaController < BaseController
      before_action :set_person, only: %i[index create]
      before_action :set_media,  only: %i[destroy]

      # GET /api/v1/people/:person_id/media
      def index
        render json: @person.media, each_serializer: Api::V1::MediumSerializer
      end

      # POST /api/v1/people/:person_id/media
      # Expects multipart form-data: media[file], media[description]
      def create
        media = @person.media.build(description: media_params[:description])
        media.file.attach(media_params[:file])  # ActiveStorage
        if media.save
          render json: media,
                 serializer: Api::V1::MediumSerializer,
                 status: :created
        else
          render json: { errors: media.errors.full_messages },
                 status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/media/:id
      def destroy
        @media.destroy
        head :no_content
      end

      private

      def set_person
        @person = current_user.people.find(params[:person_id])
      end

      def set_media
        # Find the media record directly first
        media = Medium.find(params[:id])
        # Then, authorize that it belongs to the current user
        if media.attachable_type == 'Person' && media.attachable.user == current_user
          @media = media
        else
          head :not_found
        end
      end

      def media_params
        params.require(:media).permit(:description, :file)
      end
    end
  end
end