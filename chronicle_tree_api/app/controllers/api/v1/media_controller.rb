module Api
  module V1
    class MediaController < BaseController
      before_action :set_person, only: %i[index create]
      before_action :set_media,  only: %i[destroy update]

      def index
        render json: @person.media, each_serializer: Api::V1::MediumSerializer
      end

      def create
        begin
          Rails.logger.info("Creating media for person #{@person.id}")
          Rails.logger.info("Media params: #{media_params.inspect}")
          
          media = @person.media.build(title: media_params[:title], description: media_params[:description])
          
          if media_params[:file].present?
            Rails.logger.info("Attaching file: #{media_params[:file].original_filename}")
            media.file.attach(media_params[:file])
          end
          
          if media.save
            Rails.logger.info("Media created successfully with ID: #{media.id}")
            render json: media,
                   serializer: Api::V1::MediumSerializer,
                   status: :created
          else
            Rails.logger.error("MEDIA SAVE ERROR: #{media.errors.full_messages.inspect}")
            Rails.logger.error("PARAMS: #{params.inspect}")
            render json: { errors: media.errors.full_messages },
                   status: :unprocessable_entity
          end
        rescue => e
          Rails.logger.error("MEDIA CREATION EXCEPTION: #{e.message}")
          Rails.logger.error("BACKTRACE: #{e.backtrace.first(10).join("\n")}")
          render json: { error: "Failed to create media: #{e.message}" }, 
                 status: :internal_server_error
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
        begin
          Rails.logger.info("Updating media #{@media.id}")
          Rails.logger.info("Update params: #{media_params.inspect}")
          
          if media_params[:file].present?
            Rails.logger.info("Updating file attachment: #{media_params[:file].original_filename}")
            @media.file.attach(media_params[:file])
          end
          
          if @media.update(media_params.except(:file))
            Rails.logger.info("Media updated successfully")
            render json: @media, status: :ok
          else
            Rails.logger.error("MEDIA UPDATE ERROR: #{@media.errors.full_messages.inspect}")
            render json: { errors: @media.errors.full_messages }, status: :unprocessable_entity
          end
        rescue => e
          Rails.logger.error("MEDIA UPDATE EXCEPTION: #{e.message}")
          Rails.logger.error("BACKTRACE: #{e.backtrace.first(10).join("\n")}")
          render json: { error: "Failed to update media: #{e.message}" }, 
                 status: :internal_server_error
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
            render json: { error: "This media item was not found or you don't have permission to access it. It may have already been deleted." }, status: :not_found
            return
          end
        rescue ActiveRecord::RecordNotFound => e
          Rails.logger.error("Media not found: ID #{params[:id]}")
          Rails.logger.info("Available media IDs: #{Medium.pluck(:id).join(', ')}")
          render json: { error: "Media item not found. It may have already been deleted or never existed." }, status: :not_found
          return
        rescue => e
          Rails.logger.error("Error in set_media: #{e.message}")
          render json: { error: "Unable to access media" }, status: :internal_server_error
          return
        end
      end

      def media_params
        params.require(:media).permit(:title, :description, :file)
      end
    end
  end
end
