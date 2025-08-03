# frozen_string_literal: true

module PublicApi
  class PeopleController < ApplicationController
    # No authentication needed for public API
    
    def tree
      # Access Person directly without user scoping for public sharing
      person = Person.find(params[:id])
      
      # Get tree data using the same logic as the authenticated API
      tree_data = get_tree_data(person)
      
      render json: tree_data
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Person not found" }, status: :not_found
    end
    
    def full_tree
      # Get all people without user scoping for public sharing
      # Note: This might need to be restricted in production
      people = Person.includes(:relationships)
      
      tree_data = get_full_tree_data(people)
      
      render json: tree_data
    end
    
    private
    
    def get_tree_data(person)
      # This should match the logic from Api::V1::PeopleController#tree
      nodes = []
      edges = []
      
      # Add the person and their family network
      add_person_and_family(person, nodes, edges, Set.new)
      
      {
        nodes: nodes,
        edges: edges,
        root_person_id: person.id
      }
    end
    
    def get_full_tree_data(people)
      # This should match the logic from Api::V1::PeopleController#full_tree
      nodes = []
      edges = []
      oldest_person_id = nil
      
      people.each do |person|
        nodes << format_person_node(person)
        oldest_person_id = person.id if oldest_person_id.nil? || (person.date_of_birth && person.date_of_birth < Person.find(oldest_person_id)&.date_of_birth)
      end
      
      # Add relationships as edges
      Relationship.includes(:person, :related_person).each do |relationship|
        edges << {
          id: "relationship-#{relationship.id}",
          source: relationship.person_id.to_s,
          target: relationship.related_person_id.to_s,
          type: 'default',
          data: {
            relationship_type: relationship.relationship_type,
            is_ex: relationship.is_ex,
            start_date: relationship.start_date,
            end_date: relationship.end_date
          }
        }
      end
      
      {
        nodes: nodes,
        edges: edges,
        oldest_person_id: oldest_person_id
      }
    end
    
    def add_person_and_family(person, nodes, edges, visited)
      return if visited.include?(person.id)
      visited.add(person.id)
      
      # Add person node
      nodes << format_person_node(person)
      
      # Add relationships
      person.relationships.includes(:related_person).each do |relationship|
        related_person = relationship.related_person
        next unless related_person
        
        # Add edge
        edges << {
          id: "relationship-#{relationship.id}",
          source: person.id.to_s,
          target: related_person.id.to_s,
          type: 'default',
          data: {
            relationship_type: relationship.relationship_type,
            is_ex: relationship.is_ex,
            start_date: relationship.start_date,
            end_date: relationship.end_date
          }
        }
        
        # Recursively add related person (with depth limit)
        if visited.size < 50  # Prevent infinite recursion
          add_person_and_family(related_person, nodes, edges, visited)
        end
      end
    end
    
    def format_person_node(person)
      {
        id: person.id.to_s,
        type: 'personCard',
        position: { x: 0, y: 0 },
        data: {
          id: person.id,
          full_name: person.full_name,
          first_name: person.first_name,
          last_name: person.last_name,
          date_of_birth: person.date_of_birth,
          date_of_death: person.date_of_death,
          gender: person.gender,
          created_at: person.created_at,
          updated_at: person.updated_at
        }
      }
    end
  end
end
