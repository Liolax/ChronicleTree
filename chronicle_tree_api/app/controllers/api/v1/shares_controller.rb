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
      title = "#{person.first_name}'s Family Tree"
    else
      # Full tree
      title = "Complete Family Tree"
    end
    
    people_count = current_user.people.count
    
    {
      title: title,
      description: "Check out this family tree with #{people_count} family members!",
      image_url: nil, # TODO: Generate tree image
      caption: share_params[:caption]
    }
  end

  def generate_profile_share_content(share_params)
    person = current_user.people.find(share_params[:content_id])
    
    {
      title: "#{person.first_name} #{person.last_name}'s Profile",
      description: "Learn more about #{person.first_name} #{person.last_name} in our family tree.",
      image_url: person.profile&.avatar&.url, # Person's avatar
      caption: share_params[:caption]
    }
  end

  def generate_share_url(platform, content)
    base_url = request.base_url
    share_url = "#{base_url}/share/#{generate_share_token}"
    
    case platform
    when 'facebook'
      "https://www.facebook.com/sharer/sharer.php?u=#{URI.encode_www_form_component(share_url)}&quote=#{URI.encode_www_form_component(content[:description])}"
    when 'twitter'
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
end