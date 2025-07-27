# frozen_string_literal: true

# Updated shares controller to use unified relationship calculation
# This demonstrates how to update the existing controller to use the new system
class Api::V1::SharesControllerUpdated < Api::V1::BaseController
  before_action :authenticate_user!

  def create
    share_params = params.require(:share).permit(:content_type, :content_id, :platform, :caption)
    
    # Use unified relationship calculator for consistent data
    calculator = UnifiedRelationshipCalculator.new(current_user)
    person = current_user.people.find(share_params[:content_id])
    relationship_data = calculator.calculate_relationships_for_person(person)
    
    share_content = generate_enhanced_share_content(share_params, person, relationship_data)
    
    if share_content
      render json: { 
        success: true, 
        share_url: generate_share_url(share_params[:platform], share_content),
        message: "Share content generated with enhanced relationships",
        relationship_count: relationship_data[:relationships].count,
        stats: relationship_data[:stats]
      }
    else
      render json: { 
        success: false, 
        error: "Failed to generate enhanced share content" 
      }, status: :unprocessable_entity
    end
  end

  private

  def generate_enhanced_share_content(share_params, person, relationship_data)
    case share_params[:content_type]
    when 'tree'
      generate_enhanced_tree_share_content(share_params, person, relationship_data)
    when 'profile'
      generate_enhanced_profile_share_content(share_params, person, relationship_data)
    else
      nil
    end
  end

  def generate_enhanced_profile_share_content(share_params, person, relationship_data)
    stats = relationship_data[:stats]
    relationships = relationship_data[:relationships]
    
    # Build description using actual relationship data
    description = "Meet #{person.full_name}"
    
    if person.date_of_birth
      birth_year = person.date_of_birth.year
      description += " (born #{birth_year})"
    end
    
    # Use comprehensive relationship statistics
    relationship_parts = []
    relationship_parts << "#{stats[:children]} children" if stats[:children] > 0
    relationship_parts << "#{stats[:step_children]} step-children" if stats[:step_children] > 0
    relationship_parts << "#{stats[:spouses]} spouse#{'s' if stats[:spouses] != 1}" if stats[:spouses] > 0
    relationship_parts << "#{stats[:siblings]} siblings" if stats[:siblings] > 0
    relationship_parts << "#{stats[:step_siblings]} step-siblings" if stats[:step_siblings] > 0
    
    if relationship_parts.any?
      description += " - connected to #{relationship_parts.join(', ')} in our family tree."
    else
      description += " - part of our family tree."
    end
    
    description += " 🌳"
    
    {
      title: "#{person.full_name}'s Profile",
      description: description,
      image_url: person.profile&.avatar&.url,
      caption: share_params[:caption],
      enhanced_stats: stats,
      relationship_details: relationships.transform_values { |rel| rel[:relationship] }
    }
  end

  def generate_enhanced_tree_share_content(share_params, person, relationship_data)
    stats = relationship_data[:stats]
    
    title = "#{person.full_name}'s Family Tree"
    description = "Explore #{person.full_name}'s comprehensive family tree! 🌳"
    
    # Add detailed statistics
    total_relationships = stats.values.sum
    description += " Features #{total_relationships} family relationships"
    
    detail_parts = []
    detail_parts << "#{stats[:children] + stats[:step_children]} children" if (stats[:children] + stats[:step_children]) > 0
    detail_parts << "#{stats[:parents] + stats[:step_parents]} parents" if (stats[:parents] + stats[:step_parents]) > 0
    detail_parts << "#{stats[:siblings] + stats[:step_siblings]} siblings" if (stats[:siblings] + stats[:step_siblings]) > 0
    
    if detail_parts.any?
      description += " including #{detail_parts.join(', ')}."
    end
    
    {
      title: title,
      description: description,
      image_url: nil,
      caption: share_params[:caption],
      comprehensive_stats: stats,
      total_people: current_user.people.count,
      relationship_network_size: relationship_data[:relationships].count
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
end