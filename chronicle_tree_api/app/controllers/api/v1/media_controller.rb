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
        begin
          @media.destroy
          Rails.logger.info("Media deleted successfully: ID #{@media.id}")
          head :no_content
        rescue => e
          Rails.logger.error("Media deletion failed: #{e.message}")
          Rails.logger.error("Media ID: #{params[:id]}, User ID: #{current_user.id}")
          render json: { error: "Failed to delete media: #{e.message}" }, status: :unprocessable_entity
        end
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
        begin
          # Find the media record
          media = Medium.find(params[:id])
          Rails.logger.info("Found media: ID #{media.id}, attachable_type: #{media.attachable_type}, attachable_id: #{media.attachable_id}")
          
          # Authorize that it belongs to the current user
          if media.attachable_type == "Person" && media.attachable.user == current_user
            @media = media
            Rails.logger.info("Media authorized for user #{current_user.id}")
          else
            Rails.logger.warn("Media authorization failed: Media belongs to user #{media.attachable.user_id if media.attachable_type == 'Person'}, current user: #{current_user.id}")
            render json: { error: "Media not found or you don't have permission to access it" }, status: :not_found
          end
        rescue ActiveRecord::RecordNotFound => e
          Rails.logger.error("Media not found: ID #{params[:id]}")
          render json: { error: "Media not found" }, status: :not_found
        rescue => e
          Rails.logger.error("Error in set_media: #{e.message}")
          render json: { error: "Unable to access media" }, status: :internal_server_error
        end
      end

      def media_params
        params.require(:media).permit(:title, :description, :file)
      end
    end
  end
end
