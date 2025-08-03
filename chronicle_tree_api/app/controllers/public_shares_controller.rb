# frozen_string_literal: true

class PublicSharesController < ApplicationController
  # No authentication needed for public sharing
  before_action :set_person, only: [:profile]
  before_action :set_root_person, only: [:tree]

  def profile
    # Set meta data for social sharing
    @meta_title = "#{@person.full_name} | ChronicleTree"
    @meta_description = build_profile_description(@person)
    @meta_image_url = nil
    @share_url = request.original_url
    
    # Generate share image
    begin
      generator = ImageGeneration::ProfileCardGenerator.new
      image_path = generator.generate(@person)
      @share_image = @person.share_images.find_by(file_path: image_path)
      @meta_image_url = @share_image ? "#{request.base_url}#{@share_image.url}" : nil
    rescue => e
      Rails.logger.error "Failed to generate profile share image: #{e.message}"
    end
    
    # Set cache headers for crawlers
    if is_crawler?
      response.headers['Cache-Control'] = 'public, max-age=86400'
      response.headers['Vary'] = 'User-Agent'
    end
    
    # Render HTML for crawlers with refined, modern styling using Tailwind CSS
    html_content = <<~HTML
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>#{@meta_title}</title>
        <meta name="description" content="#{@meta_description}">
        
        <!-- Open Graph / Facebook Meta Tags -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="#{@share_url}">
        <meta property="og:title" content="#{@meta_title}">
        <meta property="og:description" content="#{@meta_description}">
        <meta property="og:site_name" content="ChronicleTree">
        <meta property="og:locale" content="en_US">
        #{@meta_image_url ? "<meta property=\"og:image\" content=\"#{@meta_image_url}\">" : ""}
        #{@meta_image_url ? "<meta property=\"og:image:secure_url\" content=\"#{@meta_image_url}\">" : ""}
        #{@meta_image_url ? "<meta property=\"og:image:width\" content=\"1200\">" : ""}
        #{@meta_image_url ? "<meta property=\"og:image:height\" content=\"630\">" : ""}
        #{@meta_image_url ? "<meta property=\"og:image:type\" content=\"image/jpeg\">" : ""}
        #{@meta_image_url ? "<meta property=\"og:image:alt\" content=\"#{@meta_title}\">" : ""}
        
        <!-- Twitter Meta Tags -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:site" content="@chronicletree">
        <meta name="twitter:creator" content="@chronicletree">
        <meta name="twitter:title" content="#{@meta_title}">
        <meta name="twitter:description" content="#{@meta_description}">
        #{@meta_image_url ? "<meta name=\"twitter:image\" content=\"#{@meta_image_url}\">" : ""}
        #{@meta_image_url ? "<meta name=\"twitter:image:alt\" content=\"#{@meta_title}\">" : ""}
        
        <!-- WhatsApp specific -->
        <meta property="og:image:type" content="image/jpeg">
        <meta property="og:image:alt" content="#{@meta_title}">
        
        <!-- Additional meta tags for better sharing -->
        <meta name="author" content="ChronicleTree">
        <meta name="robots" content="index, follow">
        <link rel="canonical" href="#{@share_url}">
        
        <!-- Styling: Tailwind CSS with App Colors -->
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  'app-bg': '#F8F4F0',
                  'app-container': '#FEFEFA',
                  'app-primary': '#4A4A4A',
                  'app-accent': '#A0C49D',
                  'button-primary': '#4F868E',
                  'link': '#4F868E'
                }
              }
            }
          }
        </script>
      </head>
      <body class="bg-app-bg text-app-primary antialiased" style="font-family: 'Inter', ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';">
        <div class="container mx-auto p-4 sm:p-6 lg:p-8">
          <header class="text-center mb-12">
            <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-app-primary" style="font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;">
              <a href="#{frontend_tree_url('')}" class="hover:text-link transition-colors duration-300">ChronicleTree</a>
            </h1>
            <p class="mt-2 text-lg text-gray-600">Your Family's Living Legacy</p>
          </header>

          <main class="bg-app-container rounded-2xl shadow-xl p-6 sm:p-10 border border-gray-200 max-w-4xl mx-auto">
            <div class="text-center">
              <h2 class="text-2xl md:text-3xl font-bold text-app-primary" style="font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;">#{@person.full_name}</h2>
              <p class="mt-3 text-base text-gray-500 max-w-2xl mx-auto">#{@meta_description}</p>
            </div>

            #{@meta_image_url ? "<img src=\"#{@meta_image_url}\" alt=\"#{@meta_title}\" class=\"rounded-lg shadow-lg my-8 w-full border border-gray-200\">" : ""}
            
            <div class="mt-8 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-center items-center gap-4">
              <a href="#{frontend_register_url}" class="w-full sm:w-auto text-center inline-block px-8 py-3 font-semibold text-white bg-button-primary rounded-lg shadow-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-button-primary transition-colors duration-300">
                Join ChronicleTree
              </a>
              #{@meta_image_url ? "<a href=\"#{@meta_image_url}\" download class=\"w-full sm:w-auto text-center inline-block px-8 py-3 font-semibold text-app-primary bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors duration-300\">Download Image</a>" : ""}
            </div>
          </main>

          <footer class="text-center mt-12 py-6">
            <p class="text-sm text-gray-500">
              <strong>Want to explore more?</strong> Create your own family tree on <a href="#{frontend_tree_url('')}" class="text-link hover:text-opacity-80 font-medium transition-colors duration-300">ChronicleTree</a>!
            </p>
          </footer>
        </div>
      </body>
      </html>
    HTML
    
    render html: html_content.html_safe
  end
  
  def tree
    @generations = params[:generations]&.to_i || 3
    
    # Set meta data for social sharing
    @meta_title = "#{@root_person.full_name}'s Family Tree | ChronicleTree"
    @meta_description = build_tree_description(@root_person, @generations)
    @meta_image_url = nil
    @share_url = request.original_url

    # Generate share image
    begin
      generator = ImageGeneration::TreeSnippetGenerator.new
      image_path = generator.generate(@root_person, generations: @generations)
      @share_image = @root_person.share_images.find_by(file_path: image_path)
      @meta_image_url = @share_image ? "#{request.base_url}#{@share_image.url}" : nil
    rescue => e
      Rails.logger.error "Failed to generate tree share image: #{e.message}"
    end
    
    # Set cache headers for crawlers
    if is_crawler?
      response.headers['Cache-Control'] = 'public, max-age=86400'
      response.headers['Vary'] = 'User-Agent'
    end
    
    # Render HTML for crawlers with refined, modern styling using Tailwind CSS
    html_content = <<~HTML
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>#{@meta_title}</title>
        <meta name="description" content="#{@meta_description}">
        
        <!-- Open Graph / Facebook Meta Tags -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="#{@share_url}">
        <meta property="og:title" content="#{@meta_title}">
        <meta property="og:description" content="#{@meta_description}">
        <meta property="og:site_name" content="ChronicleTree">
        <meta property="og:locale" content="en_US">
        #{@meta_image_url ? "<meta property=\"og:image\" content=\"#{@meta_image_url}\">" : ""}
        #{@meta_image_url ? "<meta property=\"og:image:secure_url\" content=\"#{@meta_image_url}\">" : ""}
        #{@meta_image_url ? "<meta property=\"og:image:width\" content=\"1200\">" : ""}
        #{@meta_image_url ? "<meta property=\"og:image:height\" content=\"630\">" : ""}
        #{@meta_image_url ? "<meta property=\"og:image:type\" content=\"image/jpeg\">" : ""}
        #{@meta_image_url ? "<meta property=\"og:image:alt\" content=\"#{@meta_title}\">" : ""}

        <!-- Twitter Meta Tags -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:site" content="@chronicletree">
        <meta name="twitter:creator" content="@chronicletree">
        <meta name="twitter:title" content="#{@meta_title}">
        <meta name="twitter:description" content="#{@meta_description}">
        #{@meta_image_url ? "<meta name=\"twitter:image\" content=\"#{@meta_image_url}\">" : ""}
        #{@meta_image_url ? "<meta name=\"twitter:image:alt\" content=\"#{@meta_title}\">" : ""}
        
        <!-- WhatsApp specific -->
        <meta property="og:image:type" content="image/jpeg">
        <meta property="og:image:alt" content="#{@meta_title}">
        
        <!-- Additional meta tags for better sharing -->
        <meta name="author" content="ChronicleTree">
        <meta name="robots" content="index, follow">
        <link rel="canonical" href="#{@share_url}">
        
        <!-- Styling: Tailwind CSS with App Colors -->
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  'app-bg': '#F8F4F0',
                  'app-container': '#FEFEFA',
                  'app-primary': '#4A4A4A',
                  'app-accent': '#A0C49D',
                  'button-primary': '#4F868E',
                  'link': '#4F868E'
                }
              }
            }
          }
        </script>
      </head>
      <body class="bg-app-bg text-app-primary antialiased" style="font-family: 'Inter', ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';">
        <div class="container mx-auto p-4 sm:p-6 lg:p-8">
          <header class="text-center mb-12">
            <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-app-primary" style="font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;">
              <a href="#{frontend_tree_url('')}" class="hover:text-link transition-colors duration-300">ChronicleTree</a>
            </h1>
            <p class="mt-2 text-lg text-gray-600">Your Family's Living Legacy</p>
          </header>

          <main class="bg-app-container rounded-2xl shadow-xl p-6 sm:p-10 border border-gray-200 max-w-4xl mx-auto">
            <div class="text-center">
              <h2 class="text-2xl md:text-3xl font-bold text-app-primary" style="font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;">#{@root_person.full_name}'s Family Tree</h2>
              <p class="mt-3 text-base text-gray-500 max-w-2xl mx-auto">#{@meta_description}</p>
            </div>

            #{@meta_image_url ? "<img src=\"#{@meta_image_url}\" alt=\"#{@meta_title}\" class=\"rounded-lg shadow-lg my-8 w-full border border-gray-200\">" : ""}
            
            <div class="mt-8 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-center items-center gap-4">
              <a href="#{frontend_register_url}" class="w-full sm:w-auto text-center inline-block px-8 py-3 font-semibold text-white bg-button-primary rounded-lg shadow-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-button-primary transition-colors duration-300">
                Join ChronicleTree
              </a>
              #{@meta_image_url ? "<a href=\"#{@meta_image_url}\" download class=\"w-full sm:w-auto text-center inline-block px-8 py-3 font-semibold text-app-primary bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors duration-300\">Download Tree Image</a>" : ""}
            </div>
          </main>

          <footer class="text-center mt-12 py-6">
            <p class="text-sm text-gray-500">
              <strong>Discover your family story!</strong> Create your own interactive family tree on <a href="#{frontend_tree_url('')}" class="text-link hover:text-opacity-80 font-medium transition-colors duration-300">ChronicleTree</a>.
            </p>
          </footer>
        </div>
      </body>
      </html>
    HTML
    
    render html: html_content.html_safe
  end
  
  protected
  
  def frontend_profile_url(person_id)
    base_url = Rails.env.development? ? 'http://localhost:5178' : request.base_url
    return "#{base_url}/login" if person_id.blank?
    "#{base_url}/profile/#{person_id}"
  end
  
  def frontend_tree_url(person_id)
    base_url = Rails.env.development? ? 'http://localhost:5178' : request.base_url
    return "#{base_url}/login" if person_id.blank?
    "#{base_url}/tree?root=#{person_id}"
  end
  
  def frontend_register_url
    base_url = Rails.env.development? ? 'http://localhost:5178' : request.base_url
    "#{base_url}/register"
  end
  
  # Redirect routes for frontend login and registration
  def redirect_login
    base_url = Rails.env.development? ? 'http://localhost:5178' : request.base_url
    redirect_to "#{base_url}/login", allow_other_host: true
  end
  
  def redirect_register
    redirect_to frontend_register_url, allow_other_host: true
  end
  
  private
  
  def set_person
    # Access Person directly without user scoping
    @person = Person.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render plain: "Person not found", status: :not_found
  end
  
  def set_root_person
    person_id = params[:root] || params[:person_id]
    return render(plain: "Missing person ID", status: :bad_request) unless person_id
    
    # Access Person directly without user scoping
    @root_person = Person.find(person_id)
  rescue ActiveRecord::RecordNotFound
    render plain: "Person not found", status: :not_found
  end
  
  def is_crawler?
    # Detect social media crawlers and search engines
    user_agent = request.user_agent.to_s.downcase
    crawlers = [
      'facebookexternalhit', 'facebookcatalog', 'facebook',
      'twitterbot', 'twitter', 'x-bot',
      'linkedinbot', 'linkedin',
      'whatsapp', 'whatsappbusinessapi',
      'telegrambot', 'telegram',
      'discordbot', 'discord',
      'slackbot', 'slack',
      'redditbot', 'reddit',
      'googlebot', 'google',
      'bingbot', 'bing', 'msnbot',
      'yandexbot', 'yandex',
      'duckduckbot', 'duckduckgo',
      'applebot', 'apple',
      'snapchat', 'pinterest', 'tumblr',
      'skype', 'viber', 'line'
    ]
    crawlers.any? { |crawler| user_agent.include?(crawler) }
  end
  
  def build_profile_description(person)
    parts = []
    
    # Age/birth info
    if person.date_of_birth
      birth_year = person.date_of_birth.year
      parts << "Born #{birth_year}"
      parts << "Age #{Date.current.year - birth_year}" unless person.date_of_death
    end
    
    # Include detailed facts
    if person.respond_to?(:facts) && person.facts.any?
      facts = person.facts.limit(4).map { |f| [f.label, f.value].compact.join(': ') }.compact
      parts.concat(facts) if facts.any?
    end
    
    # Add timeline highlights
    if person.respond_to?(:timeline_items) && person.timeline_items.any?
      timeline = person.timeline_items.order(:date).limit(2).map do |item|
        "#{item.date ? "#{item.date.year}: " : ""}#{item.title}"
      end.compact
      parts.concat(timeline) if timeline.any?
    end
    
    base = "Discover #{person.full_name}'s family story"
    return base if parts.empty?
    
    description = "#{base} - #{parts.first(4).join(' • ')}"
    description.length > 297 ? "#{description[0..293]}..." : description
  end
  
  def build_tree_description(person, generations)
    stats = []
    
    # Count family members
    children_count = person.relationships.where(relationship_type: 'child').count
    stats << "#{children_count} children" if children_count > 0
    
    spouse_count = person.relationships.where(relationship_type: 'spouse', is_ex: false).count
    stats << "#{spouse_count} spouse#{'s' if spouse_count != 1}" if spouse_count > 0
    
    siblings_count = person.relationships.where(relationship_type: 'sibling').count
    stats << "#{siblings_count} siblings" if siblings_count > 0
    
    base = "Explore #{person.full_name}'s family tree"
    base += " spanning #{generations} generations" if generations
    base += " with #{stats.join(', ')}" if stats.any?
    
    base
  end
end
