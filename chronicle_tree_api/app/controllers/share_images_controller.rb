# frozen_string_literal: true

class ShareImagesController < ApplicationController
  # Skip authentication for public share images
  skip_before_action :authenticate_user!, if: -> { defined?(authenticate_user!) }
  
  def show
    image_path = Rails.root.join('public', 'generated_shares', params[:path])
    
    if File.exist?(image_path) && image_within_allowed_directory?(image_path)
      # Determine content type
      content_type = case File.extname(params[:path]).downcase
                     when '.jpg', '.jpeg'
                       'image/jpeg'
                     when '.png'
                       'image/png'
                     when '.svg'
                       'image/svg+xml'
                     else
                       'application/octet-stream'
                     end
      
      send_file image_path, 
                type: content_type,
                disposition: 'inline',
                filename: File.basename(image_path)
    else
      head :not_found
    end
  end
  
  private
  
  def image_within_allowed_directory?(path)
    allowed_dir = Rails.root.join('public', 'generated_shares')
    path.to_s.start_with?(allowed_dir.to_s)
  end
end