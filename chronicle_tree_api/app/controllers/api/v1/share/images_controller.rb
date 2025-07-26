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
      else
        death_year = @person.date_of_death.year
        parts << "Died #{death_year}"
      end
    end
    
    # Location (if available)
    if @person.respond_to?(:birth_place) && @person.birth_place.present?
      parts << "from #{@person.birth_place}"
    end
    
    # Use profile-specific relationship context (focused on immediate family)
    family_context = get_profile_relationship_context(@person)
    parts << family_context if family_context.present?
    
    # Key facts (limit to 1 for profile sharing to keep it concise)
    if @person.facts.any?
      fact = @person.facts.first
      fact_text = fact.label.present? ? fact.label : fact.value
      parts << fact_text if fact_text.present?
    end
    
    base = "Discover #{@person.full_name}'s family story"
    return base if parts.empty?
    
    "#{base} - #{parts.join(' | ')}"
  end
  
  def get_profile_relationship_context(person)
    # Profile-specific family context focused on immediate relationships
    # This matches the profile page logic which shows direct family members
    contexts = []
    
    # Get relationship statistics using profile logic
    profile_stats = calculate_profile_relationship_statistics(person)
    
    # Spouse context (current spouses only)
    if profile_stats[:spouses] > 0
      if profile_stats[:spouses] == 1
        spouse_name = get_current_spouse_name(person)
        contexts << "Married to #{spouse_name}" if spouse_name
      else
        contexts << "Multiple current marriages"
      end
    end
    
    # Children context (biological + step-children)
    total_children = profile_stats[:children] + profile_stats[:step_children]
    if total_children > 0
      child_text = total_children == 1 ? "1 child" : "#{total_children} children"
      if profile_stats[:step_children] > 0
        child_text += " (including step-children)"
      end
      contexts << child_text
    end
    
    # Parents context (if person has living parents)
    if profile_stats[:parents] > 0 || profile_stats[:step_parents] > 0
      total_parents = profile_stats[:parents] + profile_stats[:step_parents]
      parent_text = "#{total_parents} parents"
      if profile_stats[:step_parents] > 0
        parent_text += " (including step-parents)"
      end
      contexts << parent_text
    end
    
    # Return the most relevant context (prioritize spouse, then children, then parents)
    contexts.first
  end

  def get_family_relationship_context(person)
    # Tree-specific family context for broader family statistics
    # This is used for tree sharing and shows extended family context
    contexts = []
    
    # Spouse context
    current_spouses = person.relationships.where(relationship_type: 'spouse', is_ex: [false, nil])
    if current_spouses.any?
      spouse_names = current_spouses.limit(2).map do |rel|
        spouse = Person.find_by(id: rel.relative_id)
        spouse&.first_name
      end.compact
      
      if spouse_names.length == 1
        contexts << "Married to #{spouse_names.first}"
      elsif spouse_names.length > 1
        contexts << "Multiple marriages"
      end
    end
    
    # Children context (simplified)
    children_count = person.relationships.where(relationship_type: 'child').count
    if children_count > 0
      if children_count == 1
        contexts << "1 child"
      else
        contexts << "#{children_count} children"
      end
    end
    
    # Return the most relevant context
    contexts.first
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
    
    # Use the same relationship calculation logic as the people controller
    # to avoid duplicating relationship logic
    relationship_stats = calculate_relationship_statistics_for_sharing(@person)
    
    # Format the statistics for display
    total_children = relationship_stats[:children] + relationship_stats[:step_children]
    stats << "#{total_children} children" if total_children > 0
    
    # Count current spouses (not ex-spouses)
    spouse_count = relationship_stats[:spouses]
    stats << "#{spouse_count} spouse#{'s' if spouse_count != 1}" if spouse_count > 0
    
    # Count siblings (including step-siblings in description context)
    total_siblings = relationship_stats[:siblings] + relationship_stats[:step_siblings]
    stats << "#{total_siblings} siblings" if total_siblings > 0
    
    # Add generation context if person has parents or grandparents
    generation_info = get_generation_context(@person)
    stats << generation_info if generation_info.present?
    
    stats
  end
  
  # Calculate relationship statistics using the same core logic as the frontend and people controller
  # This avoids duplicating relationship calculation logic across the application
  def calculate_relationship_statistics_for_sharing(person)
    # Get all relationships for sharing calculation
    # We need to build the same format as used in the people controller
    user = person.user
    all_people = user.people.to_a
    relationships = []
    
    all_people.each do |p|
      p.relationships.each do |rel|
        if all_people.map(&:id).include?(rel.relative_id)
          relationships << {
            source: p.id,
            target: rel.relative_id,
            relationship_type: rel.relationship_type,
            is_ex: rel.is_ex || false,
            is_deceased: rel.is_deceased || false
          }
        end
      end
    end

    stats = {
      children: 0,
      step_children: 0,
      spouses: 0,
      ex_spouses: 0,
      siblings: 0,
      step_siblings: 0,
      parents: 0,
      step_parents: 0
    }

    # Count biological children
    biological_children = relationships.select do |rel|
      rel[:source] == person.id && rel[:relationship_type] == 'child'
    end
    stats[:children] = biological_children.count

    # Count step-children through current/deceased spouses (NOT ex-spouses)
    current_and_deceased_spouses = relationships.select do |rel|
      rel[:source] == person.id && 
      rel[:relationship_type] == 'spouse' && 
      !rel[:is_ex]  # Only current and deceased, not ex
    end

    step_children_count = 0
    current_and_deceased_spouses.each do |spouse_rel|
      spouse_id = spouse_rel[:target]
      
      # Find spouse's children who are not also person's biological children
      spouse_children = relationships.select do |rel|
        rel[:source] == spouse_id && rel[:relationship_type] == 'child'
      end
      
      spouse_children.each do |child_rel|
        # Check if this child is also person's biological child
        is_biological_child = biological_children.any? { |bio_rel| bio_rel[:target] == child_rel[:target] }
        step_children_count += 1 unless is_biological_child
      end
    end
    stats[:step_children] = step_children_count

    # Count current spouses (not ex-spouses)
    current_spouses = relationships.select do |rel|
      rel[:source] == person.id && 
      rel[:relationship_type] == 'spouse' && 
      !rel[:is_ex]
    end
    stats[:spouses] = current_spouses.count

    # Count biological siblings
    biological_siblings = relationships.select do |rel|
      rel[:source] == person.id && rel[:relationship_type] == 'sibling'
    end
    stats[:siblings] = biological_siblings.count

    # Count step-siblings through parents' current/deceased spouses (NOT ex-spouses)
    parents = relationships.select do |rel|
      rel[:source] == person.id && rel[:relationship_type] == 'parent'
    end

    step_siblings_count = 0
    parents.each do |parent_rel|
      parent_id = parent_rel[:target]
      
      # Get parent's current/deceased spouses (exclude ex-spouses)
      parent_spouses = relationships.select do |rel|
        rel[:source] == parent_id && 
        rel[:relationship_type] == 'spouse' && 
        !rel[:is_ex]  # Only current and deceased, not ex
      end
      
      parent_spouses.each do |spouse_rel|
        spouse_id = spouse_rel[:target]
        
        # Find spouse's children who are not person's biological siblings
        spouse_children = relationships.select do |rel|
          rel[:source] == spouse_id && 
          rel[:relationship_type] == 'child' &&
          rel[:target] != person.id  # Skip self
        end
        
        spouse_children.each do |child_rel|
          # Check if this is a biological sibling
          is_biological_sibling = biological_siblings.any? { |sib_rel| sib_rel[:target] == child_rel[:target] }
          step_siblings_count += 1 unless is_biological_sibling
        end
      end
    end
    stats[:step_siblings] = step_siblings_count

    stats
  end

  # Calculate relationship statistics specifically for profile sharing
  # This focuses on immediate relationships like the profile page
  def calculate_profile_relationship_statistics(person)
    # Use the same core calculation logic but adapted for profile context
    user = person.user
    all_people = user.people.to_a
    relationships = []
    
    all_people.each do |p|
      p.relationships.each do |rel|
        if all_people.map(&:id).include?(rel.relative_id)
          relationships << {
            source: p.id,
            target: rel.relative_id,
            relationship_type: rel.relationship_type,
            is_ex: rel.is_ex || false,
            is_deceased: rel.is_deceased || false
          }
        end
      end
    end

    stats = {
      children: 0,
      step_children: 0,
      spouses: 0,
      siblings: 0,
      step_siblings: 0,
      parents: 0,
      step_parents: 0
    }

    # Count biological children
    biological_children = relationships.select do |rel|
      rel[:source] == person.id && rel[:relationship_type] == 'child'
    end
    stats[:children] = biological_children.count

    # Count step-children through current/deceased spouses (NOT ex-spouses)
    # This matches the profile page logic
    current_and_deceased_spouses = relationships.select do |rel|
      rel[:source] == person.id && 
      rel[:relationship_type] == 'spouse' && 
      !rel[:is_ex]  # Only current and deceased, not ex
    end

    step_children_count = 0
    current_and_deceased_spouses.each do |spouse_rel|
      spouse_id = spouse_rel[:target]
      
      # Find spouse's children who are not also person's biological children
      spouse_children = relationships.select do |rel|
        rel[:source] == spouse_id && rel[:relationship_type] == 'child'
      end
      
      spouse_children.each do |child_rel|
        # Check if this child is also person's biological child
        is_biological_child = biological_children.any? { |bio_rel| bio_rel[:target] == child_rel[:target] }
        step_children_count += 1 unless is_biological_child
      end
    end
    stats[:step_children] = step_children_count

    # Count current spouses (not ex-spouses) - profile shows current relationships
    current_spouses = relationships.select do |rel|
      rel[:source] == person.id && 
      rel[:relationship_type] == 'spouse' && 
      !rel[:is_ex]
    end
    stats[:spouses] = current_spouses.count

    # Count biological parents
    parents = relationships.select do |rel|
      rel[:source] == person.id && rel[:relationship_type] == 'parent'
    end
    stats[:parents] = parents.count

    # Count step-parents (parents' spouses who are not biological parents)
    step_parents_count = 0
    parents.each do |parent_rel|
      parent_id = parent_rel[:target]
      
      # Get parent's current/deceased spouses (exclude ex-spouses)
      parent_spouses = relationships.select do |rel|
        rel[:source] == parent_id && 
        rel[:relationship_type] == 'spouse' && 
        !rel[:is_ex]  # Only current and deceased, not ex
      end
      
      parent_spouses.each do |spouse_rel|
        spouse_id = spouse_rel[:target]
        
        # Check if this spouse is also person's biological parent
        is_biological_parent = parents.any? { |par_rel| par_rel[:target] == spouse_id }
        step_parents_count += 1 unless is_biological_parent
      end
    end
    stats[:step_parents] = step_parents_count

    # Count biological siblings
    biological_siblings = relationships.select do |rel|
      rel[:source] == person.id && rel[:relationship_type] == 'sibling'
    end
    stats[:siblings] = biological_siblings.count

    # Count step-siblings (simplified for profile context)
    step_siblings_count = 0
    parents.each do |parent_rel|
      parent_id = parent_rel[:target]
      
      # Get parent's current/deceased spouses (exclude ex-spouses)
      parent_spouses = relationships.select do |rel|
        rel[:source] == parent_id && 
        rel[:relationship_type] == 'spouse' && 
        !rel[:is_ex]
      end
      
      parent_spouses.each do |spouse_rel|
        spouse_id = spouse_rel[:target]
        
        # Find spouse's children who are not person's biological siblings
        spouse_children = relationships.select do |rel|
          rel[:source] == spouse_id && 
          rel[:relationship_type] == 'child' &&
          rel[:target] != person.id  # Skip self
        end
        
        spouse_children.each do |child_rel|
          # Check if this is a biological sibling
          is_biological_sibling = biological_siblings.any? { |sib_rel| sib_rel[:target] == child_rel[:target] }
          step_siblings_count += 1 unless is_biological_sibling
        end
      end
    end
    stats[:step_siblings] = step_siblings_count

    stats
  end

  # Get the name of the current spouse for display purposes
  def get_current_spouse_name(person)
    current_spouse = person.relationships
                          .where(relationship_type: 'spouse', is_ex: [false, nil])
                          .first
    
    if current_spouse
      spouse_person = Person.find_by(id: current_spouse.relative_id)
      spouse_person&.first_name
    end
  end
  
  def get_generation_context(person)
    # Add context about family position
    has_parents = person.relationships.where(relationship_type: 'parent').exists?
    has_grandparents = false
    
    if has_parents
      parents = person.relationships.where(relationship_type: 'parent')
      parents.each do |parent_rel|
        parent_person = Person.find_by(id: parent_rel.relative_id)
        if parent_person&.relationships&.where(relationship_type: 'parent')&.exists?
          has_grandparents = true
          break
        end
      end
    end
    
    if has_grandparents
      "multi-generational family"
    elsif has_parents
      "family with parents"
    else
      nil
    end
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