# frozen_string_literal: true

class Api::V1::Share::ImagesController < Api::V1::BaseController
  # Temporarily skip authentication for testing
  skip_before_action :authenticate_user!, only: [:profile, :tree]
  before_action :set_person, only: [:profile, :tree]
  
  # GET /api/v1/share/profile/:id
  def profile
    begin
      Rails.logger.info "Profile share requested for person #{@person.id}"
      
      # Temporarily disable caching to force regeneration with enhanced content
      # existing_image = @person.share_images
      #                        .where(image_type: 'profile')
      #                        .where('expires_at > ?', Time.current)
      #                        .order(created_at: :desc)
      #                        .first
      
      # if existing_image&.file_exists?
      #   # Return existing image
      #   render json: build_share_response(existing_image, 'profile')
      # else
        # Generate new image
        image_path = generate_profile_image
        share_image = @person.share_images.find_by(file_path: image_path)
        render json: build_share_response(share_image, 'profile')
      # end
    rescue StandardError => e
      Rails.logger.error "Profile share failed: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { 
        error: 'Share generation failed',
        message: e.message,
        person_id: params[:id]
      }, status: :internal_server_error
    end
  end
  
  # GET /api/v1/share/tree/:id
  def tree
    generations = params[:generations]&.to_i || 3
    
    begin
      Rails.logger.info "Tree share requested for person #{@person.id} with #{generations} generations"
      
      # Temporarily disable caching to force regeneration with enhanced content
      # existing_image = @person.share_images
      #                        .where(image_type: 'tree')
      #                        .where('expires_at > ?', Time.current)
      #                        .where("metadata->>'generations' = ?", generations.to_s)
      #                        .order(created_at: :desc)
      #                        .first
      
      # if existing_image&.file_exists?
      #   # Return existing image
      #   render json: build_share_response(existing_image, 'tree', generations)
      # else
        # Generate new image
        image_path = generate_tree_image(generations)
        share_image = @person.share_images.find_by(file_path: image_path)
        render json: build_share_response(share_image, 'tree', generations)
      # end
    rescue StandardError => e
      Rails.logger.error "Tree share failed: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { 
        error: 'Share generation failed',
        message: e.message,
        person_id: params[:id],
        generations: generations
      }, status: :internal_server_error
    end
  end
  
  # DELETE /api/v1/share/cleanup (Admin only)
  def cleanup
    return render_unauthorized unless current_user.admin?
    
    cleanup_result = perform_cleanup
    render json: cleanup_result
  end
  
  private
  
  def set_person
    # For sharing, find person without user scoping
    @person = Person.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Person not found' }, status: :not_found
  end
  
  def generate_profile_image
    generator = ImageGeneration::ProfileCardGenerator.new
    generator.generate(@person)
  end
  
  def generate_tree_image(generations)
    generator = ImageGeneration::TreeSnippetGenerator.new
    generator.generate(@person, generations: generations)
  end
  
  def build_share_response(share_image, image_type, generations = nil)
    base_url = "#{request.protocol}#{request.host_with_port}"
    
    {
      image_url: "#{base_url}#{share_image.url}",
      share_url: build_share_url(image_type),
      title: build_title(image_type, generations),
      description: build_description(image_type, generations),
      meta_tags: build_meta_tags(image_type, share_image),
      generation_time_ms: share_image.generation_time_ms,
      expires_at: share_image.expires_at
    }
  end
  
  def build_share_url(image_type)
    base_url = "#{request.protocol}#{request.host_with_port}"
    case image_type
    when 'profile'
      "#{base_url}/profile/#{@person.id}"
    when 'tree'
      "#{base_url}/tree?root=#{@person.id}"
    end
  end
  
  def build_title(image_type, generations = nil)
    case image_type
    when 'profile'
      "#{@person.full_name} - Family Profile | ChronicleTree"
    when 'tree'
      "#{@person.full_name}'s Family Tree | ChronicleTree"
    end
  end
  
  def build_description(image_type, generations = nil)
    case image_type
    when 'profile'
      build_profile_description
    when 'tree'
      build_tree_description(generations)
    end
  end
  
  def build_profile_description
    parts = []
    
    # Age/birth info
    if @person.date_of_birth
      birth_year = @person.date_of_birth.year
      parts << "Born #{birth_year}"
      
      unless @person.date_of_death
        age = Date.current.year - birth_year
        parts << "Age #{age}"
      end
    end
    
    # Location (if available)
    if @person.respond_to?(:birth_place) && @person.birth_place.present?
      parts << "from #{@person.birth_place}"
    end
    
    # Key facts
    if @person.facts.any?
      facts = @person.facts.limit(2).map { |f| f.label.present? ? f.label : f.value }.compact.join(', ')
      parts << facts if facts.present?
    end
    
    base = "Discover #{@person.full_name}'s family story"
    return base if parts.empty?
    
    "#{base} - #{parts.join(' | ')}"
  end
  
  def build_tree_description(generations)
    stats = gather_family_stats
    
    base = "Explore #{@person.full_name}'s family tree"
    
    if generations
      base += " spanning #{generations} generations"
    end
    
    if stats.any?
      stats_text = stats.join(', ')
      base += " with #{stats_text}"
    end
    
    base
  end
  
  def gather_family_stats
    stats = []
    
    children_count = count_children(@person)
    stats << "#{children_count} children" if children_count > 0
    
    spouse_count = count_current_spouses(@person)
    stats << "#{spouse_count} spouse#{'s' if spouse_count != 1}" if spouse_count > 0
    
    siblings_count = count_siblings(@person)
    stats << "#{siblings_count} siblings" if siblings_count > 0
    
    stats
  end
  
  def count_children(person)
    person.relationships.where(relationship_type: 'child').count
  end
  
  def count_current_spouses(person)
    person.relationships
          .where(relationship_type: 'spouse')
          .where.not(is_ex: true)
          .count
  end
  
  def count_siblings(person)
    person.relationships.where(relationship_type: 'sibling').count
  end
  
  def build_meta_tags(image_type, share_image)
    base_url = "#{request.protocol}#{request.host_with_port}"
    
    {
      'og:title' => build_title(image_type),
      'og:description' => build_description(image_type),
      'og:image' => "#{base_url}#{share_image.url}",
      'og:image:width' => '1200',
      'og:image:height' => '630',
      'og:image:type' => 'image/jpeg',
      'og:type' => 'website',
      'og:site_name' => 'ChronicleTree',
      'og:url' => build_share_url(image_type),
      'twitter:card' => 'summary_large_image',
      'twitter:site' => '@chronicletree',
      'twitter:creator' => '@chronicletree'
    }
  end
  
  def perform_cleanup
    deleted_count = 0
    error_count = 0
    
    # Clean up expired images
    ShareImage.expired.find_each do |share_image|
      if share_image.destroy
        deleted_count += 1
      else
        error_count += 1
      end
    end
    
    # Clean up orphaned files
    orphaned_count = cleanup_orphaned_files
    
    {
      success: true,
      deleted_records: deleted_count,
      errors: error_count,
      orphaned_files_cleaned: orphaned_count,
      message: "Cleanup completed successfully"
    }
  rescue => e
    Rails.logger.error "Cleanup failed: #{e.message}"
    {
      success: false,
      error: e.message
    }
  end
  
  def cleanup_orphaned_files
    shares_dir = Rails.root.join('public', 'generated_shares')
    return 0 unless Dir.exist?(shares_dir)
    
    database_files = ShareImage.pluck(:file_path).map { |path| File.basename(path) }.to_set
    deleted_count = 0
    
    Dir.glob(File.join(shares_dir, '*')).each do |file_path|
      filename = File.basename(file_path)
      next if database_files.include?(filename)
      next if filename.start_with?('.')  # Skip hidden files
      
      # Delete files older than 1 week that aren't in database
      if File.mtime(file_path) < 1.week.ago
        File.delete(file_path)
        deleted_count += 1
      end
    end
    
    deleted_count
  rescue => e
    Rails.logger.error "Orphaned file cleanup failed: #{e.message}"
    0
  end
  
  def render_unauthorized
    render json: { error: 'Unauthorized' }, status: :unauthorized
  end
end