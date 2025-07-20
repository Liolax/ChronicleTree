# frozen_string_literal: true

class PublicSharesController < ApplicationController
  
  # No authentication needed for public sharing pages
  before_action :set_person, only: [:profile]
  before_action :set_root_person, only: [:tree]
  
  # GET /profile/:id
  def profile
    # Log all requests for debugging
    Rails.logger.info "PUBLIC SHARE: #{request.user_agent} accessing #{request.original_url}"
    
    # Set meta data for social sharing
    @meta_title = "#{@person.full_name} - Family Profile | ChronicleTree"
    @meta_description = build_profile_description(@person)
    @meta_image_url = nil
    @share_url = request.original_url
    
    # Note: Facebook requires HTTPS URLs in production
    # Localhost HTTP URLs will not work with Facebook's crawler in production
    if Rails.env.development? && request.host == 'localhost'
      Rails.logger.warn "WARNING: Facebook sharing may not work with localhost URLs. Use HTTPS domain in production."
    end
    
    # Try to generate share image
    begin
      generator = ImageGeneration::ProfileCardGenerator.new
      image_path = generator.generate(@person)
      @share_image = @person.share_images.find_by(file_path: image_path)
      @meta_image_url = @share_image ? "#{request.base_url}#{@share_image.url}" : nil
    rescue => e
      Rails.logger.error "Failed to generate profile share image: #{e.message}"
    end
    
    # Redirect to frontend if this is a browser request
    if !is_crawler?
      redirect_to frontend_profile_url(@person.id)
    else
      # Set proper cache headers for Facebook crawler
      if is_crawler?
        response.headers['Cache-Control'] = 'public, max-age=86400' # 24 hours
        response.headers['Vary'] = 'User-Agent'
      end
      
      # Render HTML directly for crawlers
      html_content = <<~HTML
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>#{@meta_title}</title>
          <meta name="description" content="#{@meta_description}">
          <meta property="og:type" content="website">
          <meta property="og:url" content="#{@share_url}">
          <meta property="og:title" content="#{@meta_title}">
          <meta property="og:description" content="#{@meta_description}">
          #{@meta_image_url ? "<meta property=\"og:image\" content=\"#{@meta_image_url}\">" : ""}
          #{@meta_image_url ? "<meta property=\"og:image:width\" content=\"1200\">" : ""}
          #{@meta_image_url ? "<meta property=\"og:image:height\" content=\"630\">" : ""}
          #{@meta_image_url ? "<meta property=\"og:image:type\" content=\"image/jpeg\">" : ""}
          <meta property="og:site_name" content="ChronicleTree">
          <meta property="og:locale" content="en_US">
          <meta property="fb:app_id" content="YOUR_FACEBOOK_APP_ID">
          <link rel="canonical" href="#{@share_url}">
          <meta property="twitter:card" content="summary_large_image">
          <meta property="twitter:title" content="#{@meta_title}">
          <meta property="twitter:description" content="#{@meta_description}">
          #{@meta_image_url ? "<meta property=\"twitter:image\" content=\"#{@meta_image_url}\">" : ""}
          <meta property="twitter:site" content="@chronicletree">
          <meta property="twitter:creator" content="@chronicletree">
        </head>
        <body>
          <h1>#{@meta_title}</h1>
          <p>#{@meta_description}</p>
          #{@meta_image_url ? "<img src=\"#{@meta_image_url}\" alt=\"#{@meta_title}\" style=\"max-width: 100%; height: auto;\">" : ""}
          <p><a href="#{frontend_profile_url(@person.id)}">View Full Profile</a></p>
          <script>
            setTimeout(function() {
              window.location.href = '#{frontend_profile_url(@person.id)}';
            }, 3000);
          </script>
        </body>
        </html>
      HTML
      
      render html: html_content.html_safe
    end
  end
  
  # GET /tree?root=:person_id&generations=:generations
  def tree
    # Log all requests for debugging
    Rails.logger.info "PUBLIC TREE SHARE: #{request.user_agent} accessing #{request.original_url}"
    
    @generations = params[:generations]&.to_i || 3
    
    # Set meta data for social sharing
    @meta_title = "#{@root_person.full_name}'s Family Tree | ChronicleTree"
    @meta_description = build_tree_description(@root_person, @generations)
    @meta_image_url = nil
    @share_url = request.original_url
    
    # Try to generate share image
    begin
      generator = ImageGeneration::TreeSnippetGenerator.new
      image_path = generator.generate(@root_person, generations: @generations)
      @share_image = @root_person.share_images.find_by(file_path: image_path)
      @meta_image_url = @share_image ? "#{request.base_url}#{@share_image.url}" : nil
    rescue => e
      Rails.logger.error "Failed to generate tree share image: #{e.message}"
    end
    
    # Redirect to frontend if this is a browser request
    if !is_crawler?
      redirect_to frontend_tree_url(@root_person.id)
    else
      # Set proper cache headers for Facebook crawler
      if is_crawler?
        response.headers['Cache-Control'] = 'public, max-age=86400' # 24 hours
        response.headers['Vary'] = 'User-Agent'
      end
      
      # Render HTML directly for crawlers
      html_content = <<~HTML
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>#{@meta_title}</title>
          <meta name="description" content="#{@meta_description}">
          <meta property="og:type" content="website">
          <meta property="og:url" content="#{@share_url}">
          <meta property="og:title" content="#{@meta_title}">
          <meta property="og:description" content="#{@meta_description}">
          #{@meta_image_url ? "<meta property=\"og:image\" content=\"#{@meta_image_url}\">" : ""}
          #{@meta_image_url ? "<meta property=\"og:image:width\" content=\"1200\">" : ""}
          #{@meta_image_url ? "<meta property=\"og:image:height\" content=\"630\">" : ""}
          #{@meta_image_url ? "<meta property=\"og:image:type\" content=\"image/jpeg\">" : ""}
          <meta property="og:site_name" content="ChronicleTree">
          <meta property="og:locale" content="en_US">
          <meta property="fb:app_id" content="YOUR_FACEBOOK_APP_ID">
          <link rel="canonical" href="#{@share_url}">
          <meta property="twitter:card" content="summary_large_image">
          <meta property="twitter:title" content="#{@meta_title}">
          <meta property="twitter:description" content="#{@meta_description}">
          #{@meta_image_url ? "<meta property=\"twitter:image\" content=\"#{@meta_image_url}\">" : ""}
          <meta property="twitter:site" content="@chronicletree">
          <meta property="twitter:creator" content="@chronicletree">
        </head>
        <body>
          <h1>#{@meta_title}</h1>
          <p>#{@meta_description}</p>
          #{@meta_image_url ? "<img src=\"#{@meta_image_url}\" alt=\"#{@meta_title}\" style=\"max-width: 100%; height: auto;\">" : ""}
          <p><a href="#{frontend_tree_url(@root_person.id)}">View Interactive Family Tree</a></p>
          <script>
            setTimeout(function() {
              window.location.href = '#{frontend_tree_url(@root_person.id)}';
            }, 3000);
          </script>
        </body>
        </html>
      HTML
      
      render html: html_content.html_safe
    end
  end
  
  protected
  
  # Make these methods available to views
  def frontend_profile_url(person_id)
    # Assuming React frontend runs on port 3000 in development
    base_url = Rails.env.development? ? 'http://localhost:3000' : request.base_url
    "#{base_url}/profile/#{person_id}"
  end
  
  def frontend_tree_url(person_id)
    # Assuming React frontend runs on port 3000 in development
    base_url = Rails.env.development? ? 'http://localhost:3000' : request.base_url
    "#{base_url}/tree?root=#{person_id}"
  end
  
  private
  
  def set_person
    # For public sharing, access Person directly without user scoping
    @person = Person.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render plain: "Person not found", status: :not_found
  end
  
  def set_root_person
    person_id = params[:root] || params[:person_id]
    return render(plain: "Missing person ID", status: :bad_request) unless person_id
    
    # For public sharing, access Person directly without user scoping
    @root_person = Person.find(person_id)
  rescue ActiveRecord::RecordNotFound
    render plain: "Person not found", status: :not_found
  end
  
  def is_crawler?
    # Detect social media crawlers and bots
    user_agent = request.user_agent.to_s.downcase
    crawlers = [
      'facebookexternalhit',
      'twitterbot',
      'linkedinbot',
      'whatsapp',
      'telegrambot',
      'discordbot',
      'slackbot',
      'googlebot',
      'bingbot'
    ]
    crawlers.any? { |crawler| user_agent.include?(crawler) }
  end
  
  def build_profile_description(person)
    parts = []
    
    # Age/birth info
    if person.date_of_birth
      birth_year = person.date_of_birth.year
      parts << "Born #{birth_year}"
      
      unless person.date_of_death
        age = Date.current.year - birth_year
        parts << "Age #{age}"
      end
    end
    
    # Include more detailed facts (increase from 2 to 4)
    if person.respond_to?(:facts) && person.facts.any?
      facts = person.facts.limit(4).map do |f| 
        if f.label.present? && f.value.present?
          "#{f.label}: #{f.value}"
        elsif f.label.present?
          f.label
        elsif f.value.present?
          f.value
        end
      end.compact
      parts.concat(facts) if facts.any?
    end
    
    # Add timeline highlights
    if person.respond_to?(:timeline_items) && person.timeline_items.any?
      timeline = person.timeline_items.order(:date).limit(2).map do |item|
        year_prefix = item.date ? "#{item.date.year}: " : ""
        "#{year_prefix}#{item.title}"
      end.compact
      parts.concat(timeline) if timeline.any?
    end
    
    base = "Discover #{person.full_name}'s family story"
    return base if parts.empty?
    
    # Join with better formatting - Facebook recommends 2-4 sentences
    description_parts = parts.first(4) # Limit to prevent too long descriptions for Facebook
    description = "#{base} - #{description_parts.join(' • ')}"
    
    # Ensure description is not too long (Facebook recommends under 300 characters)
    description.length > 297 ? "#{description[0..293]}..." : description
  end
  
  def build_tree_description(person, generations)
    stats = []
    
    # Count family members
    children_count = person.relationships.where(relationship_type: 'child').count
    stats << "#{children_count} children" if children_count > 0
    
    spouse_count = person.relationships
                          .where(relationship_type: 'spouse')
                          .where.not(is_ex: true)
                          .count
    stats << "#{spouse_count} spouse#{'s' if spouse_count != 1}" if spouse_count > 0
    
    siblings_count = person.relationships.where(relationship_type: 'sibling').count
    stats << "#{siblings_count} siblings" if siblings_count > 0
    
    base = "Explore #{person.full_name}'s family tree"
    
    if generations
      base += " spanning #{generations} generations"
    end
    
    if stats.any?
      stats_text = stats.join(', ')
      base += " with #{stats_text}"
    end
    
    base
  end
end