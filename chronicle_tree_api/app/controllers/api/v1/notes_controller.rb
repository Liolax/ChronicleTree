module Api
  module V1
    class NotesController < BaseController
      before_action :set_person, only: %i[show create update]

      # GET /api/v1/people/:person_id/note
      def show
        note = @person.note
        if note
          render json: note, serializer: Api::V1::NoteSerializer
        else
          render json: { note: nil }, status: :ok
        end
      end

      # POST /api/v1/people/:person_id/note
      def create
        note = @person.build_note(note_params)
        if note.save
          render json: note, serializer: Api::V1::NoteSerializer, status: :created
        else
          render json: { errors: note.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/people/:person_id/note
      def update
        note = @person.note
        if note&.update(note_params)
          render json: note, serializer: Api::V1::NoteSerializer
        else
          render json: { errors: note ? note.errors.full_messages : [ "Note not found" ] }, status: :unprocessable_entity
        end
      end

      private

      def set_person
        @person = current_user.people.find(params[:person_id])
      end

      def note_params
        params.require(:note).permit(:content)
      end
    end
  end
end
