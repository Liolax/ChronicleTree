class Api::V1::RelationshipsController < Api::V1::BaseController
  before_action :set_relationship, only: [:destroy]

  # POST /api/v1/relationships
  def create
    @relationship = Relationship.new(relationship_params)

    # Ensure the relationship is being created for a person owned by the current user
    person = current_user.people.find_by(id: relationship_params[:person_id])
    relative = current_user.people.find_by(id: relationship_params[:relative_id])

    if person && relative
      if @relationship.save
        render json: @relationship, status: :created
      else
        render json: { errors: @relationship.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { errors: ["One or both persons not found in your records."] }, status: :not_found
    end
  end

  # DELETE /api/v1/relationships/:id
  def destroy
    # Ensure the relationship belongs to the current user's people before destroying
    if @relationship.person.user == current_user
      @relationship.destroy
      head :no_content
    else
      head :forbidden
    end
  end

  private

  def set_relationship
    @relationship = Relationship.find(params[:id])
  end

  # Only allow a list of trusted parameters through.
  def relationship_params
    params.require(:relationship).permit(:person_id, :relative_id, :relationship_type)
  end
end
    end

    # Only allow a list of trusted parameters through.
    def relationship_params
      params.require(:relationship).permit(
        :person_id,
        :relative_id,
        :relationship_type
      )
    end
end
