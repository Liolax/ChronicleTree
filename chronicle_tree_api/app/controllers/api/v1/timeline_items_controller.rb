# app/controllers/api/v1/timeline_items_controller.rb
module Api
  module V1
    class TimelineItemsController < BaseController
      before_action :set_person,        only: %i[index create]
      before_action :set_timeline_item, only: %i[update destroy]

      # GET /api/v1/people/:person_id/timeline_items
      def index
        render json: @person.timeline_items,
               each_serializer: Api::V1::TimelineItemSerializer,
               status: :ok
      end

      # POST /api/v1/people/:person_id/timeline_items
      def create
        item = @person.timeline_items.build(timeline_item_params)
        if item.save
          render json: item,
                 serializer: Api::V1::TimelineItemSerializer,
                 status: :created
        else
          render json: { errors: item.errors.full_messages },
                 status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/timeline_items/:id
      def update
        if @timeline_item.update(timeline_item_params)
          render json: @timeline_item,
                 serializer: Api::V1::TimelineItemSerializer,
                 status: :ok
        else
          render json: { errors: @timeline_item.errors.full_messages },
                 status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/timeline_items/:id
      def destroy
        @timeline_item.destroy
        head :no_content
      end

      private

      def set_person
        @person = current_user.people.find(params[:person_id])
      end

      def set_timeline_item
        @timeline_item = current_user.people
                                     .flat_map(&:timeline_items)
                                     .find { |i| i.id == params[:id].to_i }
        head :not_found unless @timeline_item
      end

      def timeline_item_params
        params.require(:timeline_item)
              .permit(:title, :date, :place, :icon, :description)
      end
    end
  end
end
