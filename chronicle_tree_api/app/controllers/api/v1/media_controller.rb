module Api
  module V1
    class MediaController < BaseController
      before_action :set_person, only: %i[index create]
      before_action :set_media,  only: %i[destroy update]

      def index
        render json: @person.media, each_serializer: Api::V1::MediumSerializer
      end

      def create
        media = @person.media.build(title: media_params[:title], description: media_params[:description])
        media.file.attach(media_params[:file])
        if media.save
          render json: media,
                 serializer: Api::V1::MediumSerializer,
                 status: :created
        else
          Rails.logger.error("MEDIA SAVE ERROR: #{media.errors.full_messages.inspect}")
          Rails.logger.error("PARAMS: #{params.inspect}")
          render json: { errors: media.errors.full_messages },
                 status: :unprocessable_entity
        end
      end

      def destroy
        @media.destroy
        head :no_content
      end

      def update
        if @media.update(media_params)
          render json: @media, status: :ok
        else
          render json: { errors: @media.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_person
        @person = current_user.people.find(params[:person_id])
      end

      def set_media
        # Find the media record
        media = Medium.find(params[:id])
        # Authorize that it belongs to the current user
        if media.attachable_type == "Person" && media.attachable.user == current_user
          @media = media
        else
          head :not_found
        end
      end

      def media_params
        params.require(:media).permit(:title, :description, :file)
      end
    end
  end
end
