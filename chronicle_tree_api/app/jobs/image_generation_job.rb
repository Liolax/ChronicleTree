# frozen_string_literal: true

class ImageGenerationJob < ApplicationJob
  queue_as :default
  
  retry_on StandardError, wait: 5.seconds, attempts: 3
  
  def perform(person_id, image_type, options = {})
    person = Person.find(person_id)
    
    Rails.logger.info "Starting #{image_type} image generation for person #{person_id}"
    
    case image_type
    when 'profile'
      generator = ImageGeneration::ProfileCardGenerator.new
      file_path = generator.generate(person)
    when 'tree'
      generator = ImageGeneration::TreeSnippetGenerator.new
      file_path = generator.generate(person, options)
    else
      raise ArgumentError, "Unknown image type: #{image_type}"
    end
    
    Rails.logger.info "Successfully generated #{image_type} image: #{file_path}"
    
    file_path
  rescue ActiveRecord::RecordNotFound
    Rails.logger.error "Person #{person_id} not found for image generation"
    raise
  rescue => e
    Rails.logger.error "Image generation failed for person #{person_id}: #{e.message}"
    raise
  end
end