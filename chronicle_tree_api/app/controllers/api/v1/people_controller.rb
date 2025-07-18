# app/controllers/api/v1/people_controller.rb
module Api
  module V1
    class PeopleController < BaseController
      before_action :set_person, only: %i[show update destroy tree relatives]

      # GET /api/v1/people
      def index
        people = current_user.people
        render json: people, each_serializer: Api::V1::PersonSerializer, status: :ok
      end

      # GET /api/v1/people/:id
      def show
        render json: @person, serializer: Api::V1::PersonSerializer, status: :ok
      end

      # POST /api/v1/people
      def create
        Rails.logger.info "[PeopleController#create] Params: \n#{params.inspect}"
        ActiveRecord::Base.transaction do
          person = current_user.people.build(person_params)
          is_first_person = current_user.people.count == 0
          rel_type = params[:person][:relation_type]
          rel_person_id = params[:person][:related_person_id]
          # Require relationship fields unless first person
          if !is_first_person && (rel_type.blank? || rel_person_id.blank?)
            render json: { errors: [ "Relationship Type and Related Person are required" ] }, status: :unprocessable_entity
            raise ActiveRecord::Rollback
          end
          if person.save
            # If relationship_type and related_person_id are provided, create relationship
            if rel_type.present? && rel_person_id.present?
              # Create the correct relationship based on what the user selected
              case rel_type
              when 'child'
                # New person is a child of the selected person
                # So the selected person is the parent of the new person
                Relationship.create!(person_id: rel_person_id, relative_id: person.id, relationship_type: 'child')
                Relationship.create!(person_id: person.id, relative_id: rel_person_id, relationship_type: 'parent')
              when 'parent'
                # New person is a parent of the selected person
                # So the new person is the parent of the selected person
                Relationship.create!(person_id: person.id, relative_id: rel_person_id, relationship_type: 'child')
                Relationship.create!(person_id: rel_person_id, relative_id: person.id, relationship_type: 'parent')
              when 'spouse'
                # Bidirectional spouse relationship
                Relationship.create!(person_id: person.id, relative_id: rel_person_id, relationship_type: 'spouse')
                Relationship.create!(person_id: rel_person_id, relative_id: person.id, relationship_type: 'spouse')
              when 'sibling'
                # Bidirectional sibling relationship
                Relationship.create!(person_id: person.id, relative_id: rel_person_id, relationship_type: 'sibling')
                Relationship.create!(person_id: rel_person_id, relative_id: person.id, relationship_type: 'sibling')
              end
            end
            Rails.logger.info "[PeopleController#create] Person created: \n#{person.inspect}"
            render json: person, serializer: Api::V1::PersonSerializer, status: :created
          else
            Rails.logger.error "[PeopleController#create] Failed to create person: \n#{person.errors.full_messages}"
            render json: { errors: person.errors.full_messages }, status: :unprocessable_entity
          end
        end
      end

      # PATCH /api/v1/people/:id
      def update
        if @person.update(person_params)
          render json: @person, serializer: Api::V1::PersonSerializer, status: :ok
        else
          render json: { errors: @person.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/people/:id
      def destroy
        @person.destroy
        head :no_content
      end

      # GET /api/v1/people/:id/tree
      def tree
        # return the full subtree of ancestors, spouses, siblings, children
        nodes, edges = People::TreeBuilder.new(@person).as_json
        render json: {
          nodes: ActiveModelSerializers::SerializableResource.new(nodes, each_serializer: Api::V1::PersonSerializer),
          edges: edges
        }, status: :ok
      end

      # GET /api/v1/people/:id/relatives
      def relatives
        rels = {
          parents:  @person.parents,
          spouses:  @person.spouses,
          children: @person.children
        }
        render json: rels, status: :ok
      end

      # GET /api/v1/people/tree
      def full_tree
        people = current_user.people
        nodes = people.to_a
        edges = []
        people.each do |person|
          person.relationships.each do |rel|
            # Only include edges where both people are in the user's tree
            if people.map(&:id).include?(rel.relative_id)
              edge = {
                from: person.id,
                to: rel.relative_id,
                type: rel.relationship_type
              }
              # Include is_ex attribute for spouse relationships
              if rel.relationship_type == 'spouse'
                edge[:is_ex] = rel.is_ex
              end
              edges << edge
            end
          end
        end
        
        # Find the oldest person to use as default root
        oldest_person = people.where.not(date_of_birth: nil).order(:date_of_birth).first
        
        render json: {
          nodes: ActiveModelSerializers::SerializableResource.new(nodes, each_serializer: Api::V1::PersonSerializer),
          edges: edges,
          oldest_person_id: oldest_person&.id
        }, status: :ok
      end

      private

      def set_person
        @person = current_user.people.find(params[:id])
      end

      def person_params
        params.require(:person).permit(
          :first_name, :last_name,
          :date_of_birth, :date_of_death,
          :gender
        )
      end
    end
  end
end
