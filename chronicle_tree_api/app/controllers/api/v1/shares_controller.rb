class Api::V1::SharesController < Api::V1::BaseController
  before_action :authenticate_user!

  # POST /api/v1/shares
  def create
    share_params = params.require(:share).permit(:content_type, :content_id, :platform, :caption)
    
    # Generate share content based on content type
    share_content = generate_share_content(share_params)
    
    if share_content
      render json: { 
        success: true, 
        share_url: generate_share_url(share_params[:platform], share_content),
        message: "Share content generated successfully" 
      }
    else
      render json: { 
        success: false, 
        error: "Failed to generate share content" 
      }, status: :unprocessable_entity
    end
  end

  # GET /api/v1/shares/:id
  def show
    # This could be used for public sharing links
    share_token = params[:id]
    
    # For demo purposes, we'll return basic share info
    # In a real app, you'd store share tokens and retrieve the associated content
    
    render json: { 
      success: true, 
      share_token: share_token,
      message: "Share content retrieved successfully" 
    }
  end

  private

  def generate_share_content(share_params)
    case share_params[:content_type]
    when 'tree'
      generate_tree_share_content(share_params)
    when 'profile'
      generate_profile_share_content(share_params)
    else
      nil
    end
  end

  def generate_tree_share_content(share_params)
    # Get tree data for the current user
    if share_params[:content_id].present?
      # Root person specified
      person = current_user.people.find(share_params[:content_id])
      title = "#{person.first_name} #{person.last_name}'s Family Tree"
      description = "Explore #{person.first_name}'s family tree with #{current_user.people.count} family members! 🌳"
    else
      # Full tree
      title = "Complete Family Tree"
      description = "Discover our complete family tree with #{current_user.people.count} family members across multiple generations! 🌳"
    end
    
    # Add more engaging elements based on tree statistics
    generations = calculate_tree_generations
    oldest_person = current_user.people.where.not(date_of_birth: nil).order(:date_of_birth).first
    youngest_person = current_user.people.where.not(date_of_birth: nil).order(date_of_birth: :desc).first
    
    if oldest_person && youngest_person
      years_span = Date.current.year - oldest_person.date_of_birth.year
      description += " Spanning #{years_span} years from #{oldest_person.first_name} (#{oldest_person.date_of_birth.year}) to #{youngest_person.first_name} (#{youngest_person.date_of_birth.year})."
    end
    
    {
      title: title,
      description: description,
      image_url: nil, # TODO: Generate tree image
      caption: share_params[:caption],
      stats: {
        total_people: current_user.people.count,
        generations: generations,
        oldest_person: oldest_person&.first_name,
        youngest_person: youngest_person&.first_name
      }
    }
  end

  def generate_profile_share_content(share_params)
    person = current_user.people.find(share_params[:content_id])
    
    # Build a more comprehensive description
    description = "Meet #{person.first_name} #{person.last_name}"
    
    # Add birth year if available
    if person.date_of_birth
      birth_year = person.date_of_birth.year
      description += " (born #{birth_year})"
    end
    
    # Add relationships context
    relationships = []
    relationships << "#{person.children.count} children" if person.children.any?
    relationships << "#{person.parents.count} parents" if person.parents.any?
    relationships << "#{person.siblings.count} siblings" if person.siblings.any?
    
    if relationships.any?
      description += " - connected to #{relationships.join(', ')} in our family tree."
    else
      description += " - part of our family tree."
    end
    
    # Add facts if available
    if person.facts.any?
      key_facts = person.facts.limit(2).pluck(:description).join(', ')
      description += " Key facts: #{key_facts}."
    end
    
    description += " 🌳"
    
    {
      title: "#{person.first_name} #{person.last_name}'s Profile",
      description: description,
      image_url: person.profile&.avatar&.url,
      caption: share_params[:caption],
      person_details: {
        name: "#{person.first_name} #{person.last_name}",
        birth_year: person.date_of_birth&.year,
        relationships_count: person.relatives.count,
        facts_count: person.facts.count
      }
    }
  end

  def generate_share_url(platform, content)
    base_url = request.base_url
    share_url = "#{base_url}/share/#{generate_share_token}"
    
    case platform
    when 'facebook'
      "https://www.facebook.com/sharer/sharer.php?u=#{URI.encode_www_form_component(share_url)}&quote=#{URI.encode_www_form_component(content[:description])}"
    when 'twitter', 'x'
      "https://twitter.com/intent/tweet?text=#{URI.encode_www_form_component(content[:description])}&url=#{URI.encode_www_form_component(share_url)}"
    when 'whatsapp'
      "https://wa.me/?text=#{URI.encode_www_form_component(content[:description] + ' ' + share_url)}"
    when 'email'
      "mailto:?subject=#{URI.encode_www_form_component(content[:title])}&body=#{URI.encode_www_form_component(content[:description] + '\n\n' + share_url)}"
    else
      share_url
    end
  end

  def generate_share_token
    SecureRandom.urlsafe_base64(32)
  end

  def calculate_tree_generations
    # Simple calculation based on parent-child relationships
    # Find people with no parents (top generation)
    top_generation = current_user.people.select { |p| p.parents.empty? }
    return 1 if top_generation.empty?
    
    # BFS to find maximum depth
    max_depth = 0
    queue = top_generation.map { |person| [person, 0] }
    
    while queue.any?
      person, depth = queue.shift
      max_depth = [max_depth, depth].max
      
      person.children.each do |child|
        queue << [child, depth + 1]
      end
    end
    
    max_depth + 1
  end
end