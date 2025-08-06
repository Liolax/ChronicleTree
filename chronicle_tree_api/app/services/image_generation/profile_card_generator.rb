# frozen_string_literal: true

module ImageGeneration
  class ProfileCardGenerator < BaseGenerator
    # Dynamic canvas height based on content
    MIN_CANVAS_HEIGHT = 750
    MAX_CANVAS_HEIGHT = 1200
    SECTION_HEIGHT = 35
    HEADER_HEIGHT = 120
    FOOTER_HEIGHT = 60
    def generate(person, options = {})
      @include_step_relationships = options[:include_step_relationships] != false
      
      begin
        # Initialize content analysis before creating the canvas
        @person = person
        @content_sections = analyze_content_sections
        @dynamic_height = calculate_dynamic_height
        
        # Debug logging
        Rails.logger.info "Profile card generation - Person: #{@person.full_name}"
        Rails.logger.info "Content sections: #{@content_sections.inspect}"
        Rails.logger.info "Calculated dynamic height: #{@dynamic_height}px"
        
        create_profile_card(person)
        filename = "profile_#{person.id}_#{@include_step_relationships ? 'with' : 'without'}_steps.jpg"
        file_path = save_to_file(filename)
        
        # Store in database
        ShareImage.create!(
          person: person,
          image_type: 'profile',
          file_path: file_path,
          expires_at: 7.days.from_now,
          generation_time_ms: generation_time,
          file_size: File.size(Rails.root.join('public', file_path)),
          metadata: { include_step_relationships: @include_step_relationships }
        )
        
        file_path
      ensure
        cleanup
      end
    end
    
    private
    
    def analyze_content_sections
      sections = {}
      
      # Analyze relationships section (left column)
      relationships = get_enhanced_family_relationships
      sections[:relationships] = {
        count: relationships.length,
        lines: relationships.length,  # Single column now
        height: relationships.length * SECTION_HEIGHT + 80  # Header + content
      }
      
      # Analyze timeline section (right column)
      timeline_items = @person.timeline_items.order(:date).limit(6)  # More space available
      dated_facts = @person.facts.where.not(date: nil).order(:date).limit(3)
      total_timeline_events = [timeline_items.count + dated_facts.count, 8].min  # Increased limit
      sections[:timeline] = {
        count: total_timeline_events,
        lines: total_timeline_events,
        height: total_timeline_events > 0 ? total_timeline_events * 40 + 80 : 60  # Header + events or message
      }
      
      # Facts are now in header, so we calculate header height including facts
      facts = @person.facts.limit(3)  # Limited facts in header
      facts_height = facts.any? ? facts.length * 20 + 10 : 0  # Compact facts in header
      sections[:header_facts] = {
        count: facts.length,
        height: facts_height
      }
      
      sections
    end
    
    def calculate_dynamic_height
      # Enhanced header height to include facts
      header_height = HEADER_HEIGHT + (@content_sections[:header_facts][:height] || 0)
      base_height = header_height + FOOTER_HEIGHT + 40  # Header + Footer + margins
      
      # Two-column layout: take the maximum height of the two columns
      relationships_height = @content_sections[:relationships][:height] || 0
      timeline_height = @content_sections[:timeline][:height] || 0
      content_height = [relationships_height, timeline_height].max
      
      total_height = base_height + content_height + 20  # Add spacing
      
      # Ensure height is within bounds
      [[total_height, MIN_CANVAS_HEIGHT].max, MAX_CANVAS_HEIGHT].min
    end
    
    def create_profile_card(person)
      # Content analysis already done in generate method
      # This method now just serves as a placeholder for any additional setup
    end
    
    def create_base_canvas
      # Ensure we have a valid height
      height = @dynamic_height || MIN_CANVAS_HEIGHT
      
      # Validate dimensions
      if height < MIN_CANVAS_HEIGHT || height > MAX_CANVAS_HEIGHT
        Rails.logger.warn "Invalid height #{height}, using default #{MIN_CANVAS_HEIGHT}"
        height = MIN_CANVAS_HEIGHT
      end
      
      if CANVAS_WIDTH <= 0 || height <= 0
        Rails.logger.error "Invalid canvas dimensions: #{CANVAS_WIDTH}x#{height}"
        raise "Invalid canvas dimensions"
      end
      
      # Create base canvas with dynamic height based on content
      canvas_svg = %{<svg width="#{CANVAS_WIDTH}" height="#{height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="#{CANVAS_WIDTH}" height="#{height}" fill="#{COLORS[:background]}"/>
      </svg>}
      
      Rails.logger.info "Creating canvas with dimensions: #{CANVAS_WIDTH}x#{height}"
      Vips::Image.svgload_buffer(canvas_svg)
    end
    
    def svg_content
      height = @dynamic_height
      header_height_with_facts = HEADER_HEIGHT + (@content_sections[:header_facts][:height] || 0)
      
      <<~CONTENT
        <!-- Main Card Background -->
        <rect x="40" y="40" width="#{CANVAS_WIDTH-80}" height="#{height-80}" fill="#{COLORS[:card_bg]}" stroke="#{COLORS[:accent]}" stroke-width="3" rx="20"/>
        
        <!-- Enhanced Profile Header with Key Facts -->
        #{header_svg}
        
        <!-- Two Column Layout -->
        #{two_column_content_svg}
        
        <!-- Footer with enhanced styling -->
        <rect x="60" y="#{height-60}" width="#{CANVAS_WIDTH-120}" height="40" fill="#{COLORS[:secondary]}" rx="10"/>
        <text x="#{CANVAS_WIDTH/2}" y="#{height-35}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#{COLORS[:text_light]}">
          Generated by ChronicleTree • #{Date.current.strftime("%B %Y")}
        </text>
      CONTENT
    end
    
    private
    
    def header_svg
      header_height = HEADER_HEIGHT + (@content_sections[:header_facts][:height] || 0)
      content = ""
      
      # Main header background
      content += %{<rect x="60" y="60" width="#{CANVAS_WIDTH-120}" height="#{header_height}" fill="#{COLORS[:primary]}" stroke="#{COLORS[:accent]}" stroke-width="2" rx="15"/>}
      
      # Person name (left side)
      content += %{<text x="90" y="100" text-anchor="start" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#{COLORS[:text_light]}">
        #{escape_xml(@person.full_name)}
      </text>}
      
      # Life dates (left side, below name)
      content += life_dates_header_svg
      
      # Key facts in header (right side with more space)
      content += key_facts_in_header_svg
      
      content
    end
    
    def key_facts_in_header_svg
      content = ""
      facts = @person.facts.limit(4)  # Adjusted for multi-line facts
      
      if facts.any?
        # Start from the right side with more available space
        start_x = 400  # More space available since name/age moved left
        y_pos = 85  # Start higher since header is shorter
        available_width = CANVAS_WIDTH - start_x - 80  # Available width for facts
        
        # Title for Key Facts section
        content += %{<text x="#{start_x}" y="#{y_pos}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#{COLORS[:text_light]}">Key Facts</text>}
        y_pos += 20
        
        facts.each_with_index do |fact, index|
          # Format fact text
          if fact.label.present? && fact.value.present?
            fact_text = "#{fact.label}: #{fact.value}"
          elsif fact.label.present?
            fact_text = fact.label
          elsif fact.value.present?
            fact_text = fact.value
          else
            next
          end
          
          # Wrap text if it's too long instead of truncating
          max_chars_per_line = 45  # Increased character limit
          if fact_text.length > max_chars_per_line
            # Split into multiple lines at word boundaries
            words = fact_text.split(' ')
            lines = []
            current_line = ""
            
            words.each do |word|
              if (current_line + " " + word).length <= max_chars_per_line
                current_line += (current_line.empty? ? "" : " ") + word
              else
                lines << current_line unless current_line.empty?
                current_line = word
              end
            end
            lines << current_line unless current_line.empty?
            
            # Display multiple lines
            lines.each_with_index do |line, line_index|
              if line_index == 0
                # First line with bullet
                content += %{<circle cx="#{start_x}" cy="#{y_pos - 3}" r="2" fill="#{COLORS[:text_light]}"/>}
                content += %{<text x="#{start_x + 10}" y="#{y_pos}" font-family="Arial, sans-serif" font-size="12" fill="#{COLORS[:text_light]}">#{escape_xml(line)}</text>}
              else
                # Continuation lines without bullet, indented
                content += %{<text x="#{start_x + 20}" y="#{y_pos}" font-family="Arial, sans-serif" font-size="12" fill="#{COLORS[:text_light]}">#{escape_xml(line)}</text>}
              end
              y_pos += 16
            end
          else
            # Single line fact
            content += %{<circle cx="#{start_x}" cy="#{y_pos - 3}" r="2" fill="#{COLORS[:text_light]}"/>}
            content += %{<text x="#{start_x + 10}" y="#{y_pos}" font-family="Arial, sans-serif" font-size="12" fill="#{COLORS[:text_light]}">#{escape_xml(fact_text)}</text>}
            y_pos += 18
          end
        end
      end
      
      content
    end
    
    def two_column_content_svg
      content = ""
      column_start_y = HEADER_HEIGHT + (@content_sections[:header_facts][:height] || 0) + 80  # After header
      
      # Left column: Relationships
      content += relationships_column_svg(column_start_y)
      
      # Right column: Timeline
      content += timeline_column_svg(column_start_y)
      
      content
    end
    
    def relationships_column_svg(start_y)
      content = ""
      left_x = 80
      column_width = (CANVAS_WIDTH - 160) / 2 - 20  # Half width minus spacing
      
      # Section header
      content += %{<rect x="#{left_x}" y="#{start_y-10}" width="#{column_width}" height="35" fill="#{COLORS[:primary]}" rx="8"/>}
      content += %{<text x="#{left_x + column_width/2}" y="#{start_y+15}" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#{COLORS[:text_light]}">Family Relationships</text>}
      
      # Get relationships
      relationships = get_enhanced_family_relationships
      
      if relationships.any?
        y_pos = start_y + 50
        max_relationships = calculate_max_items_for_space(@content_sections[:relationships][:height] - 80, SECTION_HEIGHT)
        display_relationships = relationships.first(max_relationships)
        
        display_relationships.each_with_index do |relationship, index|
          # Stop if we exceed available space
          break if y_pos > start_y + @content_sections[:relationships][:height] - 30
          
          # Relationship bullet point
          content += %{<circle cx="#{left_x + 10}" cy="#{y_pos - 5}" r="3" fill="#{COLORS[:accent]}"/>}
          
          # Relationship text with responsive truncation
          max_chars = get_max_chars_for_column_width(column_width - 30)
          rel_text = relationship.length > max_chars ? "#{relationship[0...max_chars-3]}..." : relationship
          content += %{<text x="#{left_x + 25}" y="#{y_pos}" font-family="Arial, sans-serif" font-size="14" fill="#{COLORS[:text_primary]}">#{escape_xml(rel_text)}</text>}
          
          y_pos += SECTION_HEIGHT
        end
        
        # Show count if we had to truncate
        if relationships.length > display_relationships.length
          remaining = relationships.length - display_relationships.length
          content += %{<text x="#{left_x + column_width/2}" y="#{y_pos + 20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#{COLORS[:text_secondary]}" font-style="italic">... and #{remaining} more</text>}
        end
      else
        content += %{<text x="#{left_x + column_width/2}" y="#{start_y + 60}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#{COLORS[:text_secondary]}" font-style="italic">No relationships found</text>}
      end
      
      content
    end
    
    def timeline_column_svg(start_y)
      content = ""
      right_x = CANVAS_WIDTH/2 + 20  # Right column start
      column_width = (CANVAS_WIDTH - 160) / 2 - 20  # Half width minus spacing
      
      # Section header
      content += %{<rect x="#{right_x}" y="#{start_y-10}" width="#{column_width}" height="35" fill="#{COLORS[:primary]}" rx="8"/>}
      content += %{<text x="#{right_x + column_width/2}" y="#{start_y+15}" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#{COLORS[:text_light]}">Timeline</text>}
      
      # Get timeline events (using existing method)
      timeline_items = @person.timeline_items.order(:date).limit(6)
      dated_facts = @person.facts.where.not(date: nil).order(:date).limit(3)
      
      # Combine timeline items and facts
      all_events = []
      
      timeline_items.each do |item|
        event_text = item.title
        event_text = "#{event_text}: #{item.description}" if item.description.present?
        event_text = event_text.length > 35 ? "#{event_text[0..32]}..." : event_text
        
        all_events << {
          date: item.date,
          text: event_text,
          location: item.place
        }
      end
      
      dated_facts.each do |fact|
        fact_text = fact.label.present? ? fact.label : fact.value
        fact_text = fact_text.length > 35 ? "#{fact_text[0..32]}..." : fact_text
        
        all_events << {
          date: fact.date,
          text: fact_text,
          location: fact.location
        }
      end
      
      # Sort and limit events
      all_events.sort_by! { |event| event[:date] || Date.new(1900) }
      max_events = calculate_max_items_for_space(@content_sections[:timeline][:height] - 80, 35)
      all_events = all_events.first(max_events)
      
      if all_events.any?
        y_pos = start_y + 50
        
        all_events.each_with_index do |event, index|
          # Stop if we exceed available space
          break if y_pos > start_y + @content_sections[:timeline][:height] - 40
          
          # Timeline connector line
          if index > 0
            content += %{<line x1="#{right_x + 15}" y1="#{y_pos - 20}" x2="#{right_x + 15}" y2="#{y_pos - 5}" stroke="#{COLORS[:accent]}" stroke-width="2"/>}
          end
          
          # Timeline bullet
          content += %{<circle cx="#{right_x + 15}" cy="#{y_pos - 3}" r="3" fill="#{COLORS[:accent]}"/>}
          
          # Event date
          if event[:date]
            date_text = event[:date].year.to_s
            content += %{<text x="#{right_x + 25}" y="#{y_pos - 6}" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#{COLORS[:primary]}">#{date_text}</text>}
          end
          
          # Event text with responsive truncation
          max_chars = get_max_chars_for_column_width(column_width - 40)
          event_text = event[:text].length > max_chars ? "#{event[:text][0...max_chars-3]}..." : event[:text]
          content += %{<text x="#{right_x + 25}" y="#{y_pos + 8}" font-family="Arial, sans-serif" font-size="12" fill="#{COLORS[:text_primary]}">#{escape_xml(event_text)}</text>}
          
          # Event location if available and fits
          if event[:location].present? && y_pos + 18 <= start_y + @content_sections[:timeline][:height] - 20
            location_max_chars = get_max_chars_for_column_width(column_width - 50, 10)
            location_text = event[:location].length > location_max_chars ? "#{event[:location][0...location_max_chars-3]}..." : event[:location]
            content += %{<text x="#{right_x + 30}" y="#{y_pos + 20}" font-family="Arial, sans-serif" font-size="10" fill="#{COLORS[:text_secondary]}">#{escape_xml(location_text)}</text>}
            y_pos += 35
          else
            y_pos += 30
          end
        end
      else
        content += %{<text x="#{right_x + column_width/2}" y="#{start_y + 60}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#{COLORS[:text_secondary]}" font-style="italic">No timeline events</text>}
      end
      
      content
    end
    
    def life_dates_header_svg
      content = ""
      
      if @person.date_of_birth || @person.date_of_death
        dates_text = ""
        
        if @person.date_of_birth && @person.date_of_death
          dates_text = "#{@person.date_of_birth.year} - #{@person.date_of_death.year}"
        elsif @person.date_of_birth
          age = Date.current.year - @person.date_of_birth.year
          dates_text = "Born #{@person.date_of_birth.year} • Age #{age}"
        elsif @person.date_of_death
          dates_text = "Died #{@person.date_of_death.year}"
        end
        
        content += %{<text x="90" y="125" text-anchor="start" font-family="Arial, sans-serif" font-size="16" fill="#{COLORS[:text_light]}">#{dates_text}</text>}
      end
      
      content
    end
    
    def relationships_svg
      y_pos = 280
      left_column_x = 120
      content = %{<text x="#{left_column_x}" y="#{y_pos}" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#{COLORS[:primary]}">Family Connections</text>}
      y_pos += 40
      
      # Parents
      parents = @person.parents
      if parents.any?
        content += %{<text x="#{left_column_x}" y="#{y_pos}" font-family="Arial, sans-serif" font-size="16" fill="#{COLORS[:text_primary]}">Parents: #{parents.map(&:full_name).join(', ')}</text>}
        y_pos += 25
      end
      
      # All spouses (including deceased)
      spouses = @person.all_spouses_including_deceased
      if spouses.any?
        # Build spouse display with proper deceased logic
        spouse_displays = spouses.map do |spouse|
          spouse_type = get_spouse_relationship_type(spouse)
          "#{spouse_type}: #{spouse.full_name}"
        end
        spouse_text = spouse_displays.join(', ')
        content += %{<text x="#{left_column_x}" y="#{y_pos}" font-family="Arial, sans-serif" font-size="16" fill="#{COLORS[:text_primary]}">Spouses: #{spouse_text}</text>}
        y_pos += 25
      end
      
      # Children
      children = @person.children
      if children.any?
        children_text = children.count > 3 ? "#{children.limit(3).map(&:full_name).join(', ')} and #{children.count - 3} more" : children.map(&:full_name).join(', ')
        content += %{<text x="#{left_column_x}" y="#{y_pos}" font-family="Arial, sans-serif" font-size="16" fill="#{COLORS[:text_primary]}">Children: #{children_text}</text>}
        y_pos += 25
      end
      
      # Siblings
      siblings = @person.siblings
      if siblings.any?
        siblings_text = siblings.count > 2 ? "#{siblings.limit(2).map(&:full_name).join(', ')} and #{siblings.count - 2} more" : siblings.map(&:full_name).join(', ')
        content += %{<text x="#{left_column_x}" y="#{y_pos}" font-family="Arial, sans-serif" font-size="16" fill="#{COLORS[:text_primary]}">Siblings: #{siblings_text}</text>}
        y_pos += 25
      end
      
      # Add timeline section to left column
      if y_pos < 450  # Only add if we have space
        content += timeline_svg(y_pos + 20, left_column_x)
      end
      
      content
    end
    
    def timeline_svg(start_y, x_pos = 120)
      timeline_content = ""
      y_pos = start_y
      
      # Timeline header
      timeline_content += %{<text x="#{x_pos}" y="#{y_pos}" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#{COLORS[:primary]}">Timeline</text>}
      y_pos += 30
      
      # Get timeline events
      timeline_events = get_timeline_events
      
      if timeline_events.any?
        timeline_events.take(4).each do |event|  # Limit to 4 events for space
          # Timeline bullet point
          timeline_content += %{<circle cx="#{x_pos + 10}" cy="#{y_pos - 5}" r="2" fill="#{COLORS[:accent]}"/>}
          
          # Timeline event (truncate long events)
          event_text = event.length > 35 ? "#{event[0..32]}..." : event
          timeline_content += %{<text x="#{x_pos + 20}" y="#{y_pos}" font-family="Arial, sans-serif" font-size="12" fill="#{COLORS[:text_primary]}">#{escape_xml(event_text)}</text>}
          y_pos += 18
        end
      else
        # Show message if no timeline data available
        timeline_content += %{<text x="#{x_pos + 20}" y="#{y_pos}" font-family="Arial, sans-serif" font-size="12" fill="#{COLORS[:text_secondary]}" font-style="italic">No events recorded</text>}
      end
      
      timeline_content
    end
    
    def facts_svg
      left_column_x = 120  # Left side of the canvas
      y_pos = 300  # Increased to prevent overlap with life dates
      content = ""
      
      # Facts header
      content += %{<text x="#{left_column_x}" y="#{y_pos}" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#{COLORS[:primary]}">Key Facts</text>}
      y_pos += 40
      
      # Get facts from database
      facts = @person.facts.order(:date).limit(8)  # Show up to 8 facts
      
      if facts.any?
        facts.each do |fact|
          # Format fact text
          if fact.label.present? && fact.value.present?
            fact_text = "#{fact.label}: #{fact.value}"
          elsif fact.label.present?
            fact_text = fact.label
          elsif fact.value.present?
            fact_text = fact.value
          else
            next # Skip empty facts
          end
          
          # Increase limit for facts - no truncation for better sharing
          fact_text = fact_text.length > 80 ? "#{fact_text[0..77]}..." : fact_text
          
          # Add bullet point
          content += %{<circle cx="#{left_column_x + 5}" cy="#{y_pos - 5}" r="2" fill="#{COLORS[:accent]}"/>}
          
          # Add fact text
          content += %{<text x="#{left_column_x + 15}" y="#{y_pos}" font-family="Arial, sans-serif" font-size="14" fill="#{COLORS[:text_primary]}">#{escape_xml(fact_text)}</text>}
          y_pos += 22
          
          # Add date/location if available
          if fact.date || fact.location
            detail_parts = []
            detail_parts << fact.date.year.to_s if fact.date
            detail_parts << fact.location if fact.location.present?
            detail_text = detail_parts.join(', ')
            
            content += %{<text x="#{left_column_x + 15}" y="#{y_pos}" font-family="Arial, sans-serif" font-size="12" fill="#{COLORS[:text_secondary]}">#{escape_xml(detail_text)}</text>}
            y_pos += 18
          end
          
          y_pos += 5  # Extra spacing between facts
          
          # Stop if we're getting close to bottom
          break if y_pos > 480
        end
      else
        content += %{<text x="#{left_column_x + 15}" y="#{y_pos}" font-family="Arial, sans-serif" font-size="14" fill="#{COLORS[:text_secondary]}" font-style="italic">No facts recorded</text>}
      end
      
      content
    end
    
    
    
    def enhanced_relationships_svg
      y_start = get_section_y_position(:relationships)
      content = ""
      available_height = @content_sections[:relationships][:height]
      
      # Section header
      content += %{<rect x="80" y="#{y_start-10}" width="#{CANVAS_WIDTH-160}" height="35" fill="#{COLORS[:primary]}" rx="8"/>}
      content += %{<text x="#{CANVAS_WIDTH/2}" y="#{y_start+15}" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#{COLORS[:text_light]}">Family Relationships</text>}
      
      # Get relationships using unified calculator with step-relationship option
      relationships = get_enhanced_family_relationships
      
      if relationships.any?
        y_pos = y_start + 60
        column_width = (CANVAS_WIDTH - 160) / 2
        left_x = 100
        right_x = 100 + column_width + 20
        
        # Limit relationships to fit available space
        max_relationships = calculate_max_items_for_space(available_height - 80, SECTION_HEIGHT)
        display_relationships = relationships.first(max_relationships)
        
        display_relationships.each_with_index do |relationship, index|
          # Stop if we exceed available space
          break if y_pos > y_start + available_height - 30
          
          # Alternate between left and right columns
          x_pos = index.even? ? left_x : right_x
          
          # Move to next row after every 2 items
          if index > 0 && index.even?
            y_pos += SECTION_HEIGHT
          end
          
          # Relationship bullet point
          content += %{<circle cx="#{x_pos}" cy="#{y_pos - 5}" r="3" fill="#{COLORS[:accent]}"/>}
          
          # Relationship text with responsive truncation
          max_chars = get_max_chars_for_column_width(column_width - 30)
          rel_text = relationship.length > max_chars ? "#{relationship[0...max_chars-3]}..." : relationship
          content += %{<text x="#{x_pos + 15}" y="#{y_pos}" font-family="Arial, sans-serif" font-size="16" fill="#{COLORS[:text_primary]}">#{escape_xml(rel_text)}</text>}
        end
        
        # Show count if we had to truncate
        if relationships.length > display_relationships.length
          remaining = relationships.length - display_relationships.length
          content += %{<text x="#{CANVAS_WIDTH/2}" y="#{y_pos + SECTION_HEIGHT}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#{COLORS[:text_secondary]}" font-style="italic">... and #{remaining} more relationships</text>}
        end
      else
        content += %{<text x="#{CANVAS_WIDTH/2}" y="#{y_start + 60}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#{COLORS[:text_secondary]}" font-style="italic">No family relationships found</text>}
      end
      
      content
    end
    
    def get_enhanced_family_relationships
      relationships = []
      
      # Use unified relationship calculator with proper step-relationship handling
      calculator = UnifiedRelationshipCalculator.new(@person.user)
      relationship_data = calculator.calculate_relationships_for_person(@person)
      
      # Get relationship stats including step-relationships
      stats = relationship_data[:stats]
      
      if @include_step_relationships
        # Add step-relationships from the calculator with FULL NAMES
        relationship_data[:relationships].each do |person_id, rel_info|
          break if relationships.count >= 14  # Increased limit for step-relationships
          
          relationship_label = rel_info[:relationship]
          person_name = rel_info[:person].full_name
          
          # Skip if already added to avoid duplicates
          entry = "#{relationship_label}: #{person_name}"
          relationships << entry unless relationships.any? { |r| r.include?(person_name) }
        end
        
        # Add step-relationships manually by name (not just statistics)
        step_parents = get_step_parents_with_names(@person)
        step_parents.each do |step_parent|
          parent_type = get_step_parent_relationship_type(step_parent)
          entry = "#{parent_type}: #{step_parent.full_name}"
          relationships << entry unless relationships.any? { |r| r.include?(step_parent.full_name) }
        end
        
        step_children = get_step_children_with_names(@person)
        step_children.each do |step_child|
          child_type = get_step_child_relationship_type(step_child)
          entry = "#{child_type}: #{step_child.full_name}"
          relationships << entry unless relationships.any? { |r| r.include?(step_child.full_name) }
        end
        
        step_siblings = get_step_siblings_with_names(@person)
        step_siblings.each do |step_sibling|
          sibling_type = get_step_sibling_relationship_type(step_sibling)
          entry = "#{sibling_type}: #{step_sibling.full_name}"
          relationships << entry unless relationships.any? { |r| r.include?(step_sibling.full_name) }
        end
      else
        # Biological relationships only
        biological_parents = @person.parents
        biological_parents.each do |parent|
          parent_type = get_parent_relationship_type(parent)
          relationships << "#{parent_type}: #{parent.full_name}"
        end
        
        all_spouses = @person.all_spouses_including_deceased
        all_spouses.each do |spouse|
          spouse_type = get_spouse_relationship_type(spouse)
          relationships << "#{spouse_type}: #{spouse.full_name}"
        end
        
        biological_children = @person.children
        if biological_children.count <= 3
          biological_children.each do |child|
            child_type = get_child_relationship_type(child)
            relationships << "#{child_type}: #{child.full_name}"
          end
        else
          relationships << "Children: #{biological_children.count} total"
        end
        
        biological_siblings = @person.siblings
        if biological_siblings.count <= 2
          biological_siblings.each do |sibling|
            sibling_type = get_sibling_relationship_type(sibling)
            relationships << "#{sibling_type}: #{sibling.full_name}"
          end
        else
          relationships << "Siblings: #{biological_siblings.count} total"
        end
      end
      
      relationships.uniq
    end
    
    def get_step_parents_with_names(person)
      step_parents = []
      person.parents.each do |parent|
        parent_spouses = parent.relationships
                              .where(relationship_type: 'spouse')
                              .where.not(is_ex: true)
                              .includes(:relative)
                              .map(&:relative)
        
        parent_spouses.each do |spouse|
          unless person.parents.include?(spouse)
            step_parents << spouse
          end
        end
      end
      step_parents.uniq
    end
    
    def get_step_children_with_names(person)
      step_children = []
      current_spouses = person.relationships
                             .where(relationship_type: 'spouse')
                             .where.not(is_ex: true)
                             .includes(:relative)
                             .map(&:relative)
      
      current_spouses.each do |spouse|
        spouse_children = spouse.relationships
                               .where(relationship_type: 'child')
                               .includes(:relative)
                               .map(&:relative)
        
        spouse_children.each do |child|
          unless person.children.include?(child)
            step_children << child
          end
        end
      end
      step_children.uniq
    end
    
    def get_step_siblings_with_names(person)
      step_siblings = []
      person.parents.each do |parent|
        parent_spouses = parent.relationships
                              .where(relationship_type: 'spouse')
                              .where.not(is_ex: true)
                              .includes(:relative)
                              .map(&:relative)
        
        parent_spouses.each do |step_parent|
          next if person.parents.include?(step_parent)
          
          step_parent_children = step_parent.relationships
                                          .where(relationship_type: 'child')
                                          .includes(:relative)
                                          .map(&:relative)
          
          step_parent_children.each do |step_sibling|
            next if step_sibling == person
            next if person.siblings.include?(step_sibling)
            
            step_siblings << step_sibling
          end
        end
      end
      step_siblings.uniq
    end
    
    def get_step_parent_relationship_type(step_parent)
      return 'Step-Parent' unless step_parent.gender.present?
      step_parent.gender.downcase == 'male' ? 'Step-Father' : 'Step-Mother'
    end
    
    def get_step_child_relationship_type(step_child)
      return 'Step-Child' unless step_child.gender.present?
      step_child.gender.downcase == 'male' ? 'Step-Son' : 'Step-Daughter'
    end
    
    def get_step_sibling_relationship_type(step_sibling)
      return 'Step-Sibling' unless step_sibling.gender.present?
      step_sibling.gender.downcase == 'male' ? 'Step-Brother' : 'Step-Sister'
    end
    
    def additional_info_svg
      y_start = get_section_y_position(:facts)
      content = ""
      available_height = @content_sections[:facts][:height]
      
      # Key Facts section like main Profile page
      max_facts = calculate_max_items_for_space(available_height - 80, SECTION_HEIGHT)
      facts = @person.facts.limit(max_facts)
      
      if facts.any?
        # Facts section header
        content += %{<rect x="80" y="#{y_start-5}" width="#{CANVAS_WIDTH-160}" height="35" fill="#{COLORS[:primary]}" rx="8"/>}
        content += %{<text x="#{CANVAS_WIDTH/2}" y="#{y_start+20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#{COLORS[:text_light]}">Key Facts</text>}
        
        y_pos = y_start + 60
        column_width = (CANVAS_WIDTH - 160) / 2
        left_x = 100
        right_x = 100 + column_width + 20
        
        facts.each_with_index do |fact, index|
          # Stop if we exceed available space
          break if y_pos > y_start + available_height - 30
          
          # Alternate between left and right columns
          x_pos = index.even? ? left_x : right_x
          
          # Move to next row after every 2 items
          if index > 0 && index.even?
            y_pos += SECTION_HEIGHT
          end
          
          # Format fact text properly
          if fact.label.present? && fact.value.present?
            fact_text = "#{fact.label}: #{fact.value}"
          elsif fact.label.present?
            fact_text = fact.label
          elsif fact.value.present?
            fact_text = fact.value
          else
            next
          end
          
          # Responsive text truncation based on column width
          max_chars = get_max_chars_for_column_width(column_width - 30)
          fact_text = fact_text.length > max_chars ? "#{fact_text[0...max_chars-3]}..." : fact_text
          
          # Fact bullet and text
          content += %{<circle cx="#{x_pos}" cy="#{y_pos - 5}" r="3" fill="#{COLORS[:accent]}"/>}
          content += %{<text x="#{x_pos + 15}" y="#{y_pos}" font-family="Arial, sans-serif" font-size="14" font-weight="500" fill="#{COLORS[:text_primary]}">#{escape_xml(fact_text)}</text>}
          
          # Add date/location if available (but only if we have space)
          if (fact.date || fact.location.present?) && y_pos + 15 <= y_start + available_height - 15
            detail_parts = []
            detail_parts << fact.date.year.to_s if fact.date
            detail_parts << fact.location if fact.location.present?
            detail_text = detail_parts.join(', ')
            
            # Truncate detail text if needed
            detail_max_chars = get_max_chars_for_column_width(column_width - 30, 11)
            detail_text = detail_text.length > detail_max_chars ? "#{detail_text[0...detail_max_chars-3]}..." : detail_text
            
            content += %{<text x="#{x_pos + 15}" y="#{y_pos + 15}" font-family="Arial, sans-serif" font-size="11" fill="#{COLORS[:text_secondary]}">#{escape_xml(detail_text)}</text>}
          end
        end
      else
        # Show message if no facts available
        content += %{<rect x="80" y="#{y_start-5}" width="#{CANVAS_WIDTH-160}" height="35" fill="#{COLORS[:primary]}" rx="8"/>}
        content += %{<text x="#{CANVAS_WIDTH/2}" y="#{y_start+20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#{COLORS[:text_light]}">Key Facts</text>}
        content += %{<text x="#{CANVAS_WIDTH/2}" y="#{y_start + 60}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#{COLORS[:text_secondary]}" font-style="italic">No facts recorded</text>}
      end
      
      content
    end
    
    def timeline_events_svg
      y_start = get_section_y_position(:timeline)
      content = ""
      available_height = @content_sections[:timeline][:height]
      
      # Calculate max events that can fit in available space
      max_events = calculate_max_items_for_space(available_height - 80, 40)  # 40px per event
      
      # Get timeline items and facts with dates
      timeline_items = @person.timeline_items.order(:date).limit([max_events - 2, 1].max)
      dated_facts = @person.facts.where.not(date: nil).order(:date).limit(2)
      
      # Combine timeline items and facts
      all_events = []
      
      timeline_items.each do |item|
        event_text = item.title
        event_text = "#{event_text}: #{item.description}" if item.description.present?
        event_text = event_text.length > 45 ? "#{event_text[0..42]}..." : event_text
        
        all_events << {
          date: item.date,
          text: event_text,
          location: item.place
        }
      end
      
      dated_facts.each do |fact|
        fact_text = fact.label.present? ? fact.label : fact.value
        fact_text = fact_text.length > 45 ? "#{fact_text[0..42]}..." : fact_text
        
        all_events << {
          date: fact.date,
          text: fact_text,
          location: fact.location
        }
      end
      
      # Sort all events by date
      all_events.sort_by! { |event| event[:date] || Date.new(1900) }
      all_events = all_events.first(max_events)  # Limit to fit available space
      
      if all_events.any?
        # Timeline section header
        content += %{<rect x="80" y="#{y_start-5}" width="#{CANVAS_WIDTH-160}" height="35" fill="#{COLORS[:primary]}" rx="8"/>}
        content += %{<text x="#{CANVAS_WIDTH/2}" y="#{y_start+20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#{COLORS[:text_light]}">Timeline</text>}
        
        y_pos = y_start + 60
        
        all_events.each_with_index do |event, index|
          # Stop if we exceed available space
          break if y_pos > y_start + available_height - 40
          
          # Timeline connector line
          if index > 0
            content += %{<line x1="110" y1="#{y_pos - 25}" x2="110" y2="#{y_pos - 10}" stroke="#{COLORS[:accent]}" stroke-width="2"/>}
          end
          
          # Timeline bullet
          content += %{<circle cx="110" cy="#{y_pos - 5}" r="4" fill="#{COLORS[:accent]}" stroke="#{COLORS[:primary]}" stroke-width="2"/>}
          
          # Event date
          if event[:date]
            date_text = event[:date].year.to_s
            content += %{<text x="125" y="#{y_pos - 8}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#{COLORS[:primary]}">#{date_text}</text>}
          end
          
          # Event text with responsive truncation
          max_text_width = CANVAS_WIDTH - 200  # Leave margin for text
          max_chars = get_max_chars_for_width(max_text_width, 14)
          event_text = event[:text].length > max_chars ? "#{event[:text][0...max_chars-3]}..." : event[:text]
          content += %{<text x="125" y="#{y_pos + 8}" font-family="Arial, sans-serif" font-size="14" fill="#{COLORS[:text_primary]}">#{escape_xml(event_text)}</text>}
          
          # Event location if available and fits
          if event[:location].present? && y_pos + 22 <= y_start + available_height - 20
            location_max_chars = get_max_chars_for_width(max_text_width - 80, 11)  # Account for location emoji text
            location_text = event[:location].length > location_max_chars ? "#{event[:location][0...location_max_chars-3]}..." : event[:location]
            content += %{<text x="125" y="#{y_pos + 22}" font-family="Arial, sans-serif" font-size="11" fill="#{COLORS[:text_secondary]}">#{escape_xml(location_text)}</text>}
            y_pos += 40
          else
            y_pos += 35
          end
        end
      else
        # Show message if no timeline events available
        content += %{<rect x="80" y="#{y_start-5}" width="#{CANVAS_WIDTH-160}" height="35" fill="#{COLORS[:primary]}" rx="8"/>}
        content += %{<text x="#{CANVAS_WIDTH/2}" y="#{y_start+20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#{COLORS[:text_light]}">Timeline</text>}
        content += %{<text x="#{CANVAS_WIDTH/2}" y="#{y_start + 60}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#{COLORS[:text_secondary]}" font-style="italic">No timeline events recorded</text>}
      end
      
      content
    end
    
    def get_child_relationship_type(child)
      return 'Child' unless child.gender.present?
      child.gender.downcase == 'male' ? 'Son' : 'Daughter'
    end
    
    def get_sibling_relationship_type(sibling)
      if is_half_sibling?(sibling)
        return get_half_sibling_relationship_type(sibling)
      end
      
      return 'Sibling' unless sibling.gender.present?
      sibling.gender.downcase == 'male' ? 'Brother' : 'Sister'
    end
    
    def is_half_sibling?(sibling)
      person_parents = @person.parents
      sibling_parents = sibling.parents
      shared_parents = person_parents & sibling_parents
      
      shared_parents.length == 1
    end
    
    def get_half_sibling_relationship_type(sibling)
      return 'Half-Sibling' unless sibling.gender.present?
      sibling.gender.downcase == 'male' ? 'Half-Brother' : 'Half-Sister'
    end

    def get_parent_relationship_type(parent)
      return 'Parent' unless parent.gender.present?
      parent.gender.downcase == 'male' ? 'Father' : 'Mother'
    end

    def get_spouse_relationship_type(spouse)
      base_type = spouse.gender.present? ? 
        (spouse.gender.downcase == 'male' ? 'Husband' : 'Wife') : 'Spouse'
      
      # Apply deceased spouse logic
      if spouse.date_of_death.present? && should_mark_as_late_spouse?(spouse, @person)
        "Late #{base_type}"
      else
        base_type
      end
    end
    
    def should_mark_as_late_spouse?(spouse, person_viewing)
      spouse_deceased = spouse.date_of_death || spouse.is_deceased
      viewer_deceased = person_viewing.date_of_death || person_viewing.is_deceased
      
      # Only mark spouse as "late" if:
      # 1. The spouse is deceased AND
      # 2. The person viewing (perspective) is alive
      # This means: living person sees deceased spouse as "Late Husband/Wife"
      # But: deceased person sees living spouse as normal "Husband/Wife"
      
      spouse_deceased && !viewer_deceased
    end
    
    def get_spouse_label(person, spouse_count)
      return spouse_count > 1 ? 'Spouses' : 'Spouse' unless person.gender.present?
      
      base_term = person.gender.downcase == 'male' ? 'Wife' : 'Husband'
      spouse_count > 1 ? "#{base_term}s" : base_term
    end

    def get_step_parent_relationship_type(step_parent)
      return 'Step-Parent' unless step_parent[:gender].present?
      step_parent[:gender].downcase == 'male' ? 'Step-Father' : 'Step-Mother'
    end

    def get_step_child_relationship_type(step_child)
      return 'Step-Child' unless step_child[:gender].present?
      step_child[:gender].downcase == 'male' ? 'Step-Son' : 'Step-Daughter'
    end

    def get_step_sibling_relationship_type(step_sibling)
      return 'Step-Sibling' unless step_sibling[:gender].present?
      step_sibling[:gender].downcase == 'male' ? 'Step-Brother' : 'Step-Sister'
    end
    
    def get_step_grandparent_relationship_type(step_grandparent)
      return 'Step-Grandparent' unless step_grandparent[:gender].present?
      step_grandparent[:gender].downcase == 'male' ? 'Step-Grandfather' : 'Step-Grandmother'
    end

    # Removed calculate_step_relationships_for_profile - now using UnifiedRelationshipCalculator
    
    def get_timeline_events
      events = []
      
      if @person.timeline_items.any?
        @person.timeline_items.order(:date).limit(5).each do |item|
          year_prefix = item.date ? "#{item.date.year}: " : ""
          location_suffix = item.place.present? ? " (#{item.place})" : ""
          event_text = "#{year_prefix}#{item.title}#{location_suffix}"
          events << event_text
        end
      end
      
      if events.length < 5 && @person.facts.any?
        remaining_slots = 5 - events.length
        @person.facts.order(:date).limit(remaining_slots).each do |fact|
          date_prefix = fact.date ? "#{fact.date.year}: " : ""
          location_suffix = fact.location.present? ? " (#{fact.location})" : ""
          
          if fact.label.present? && fact.value.present?
            event_text = "#{date_prefix}#{fact.label}: #{fact.value}#{location_suffix}"
          elsif fact.label.present?
            event_text = "#{date_prefix}#{fact.label}#{location_suffix}"
          elsif fact.value.present?
            event_text = "#{date_prefix}#{fact.value}#{location_suffix}"
          else
            next
          end
          
          events << event_text
        end
      end
      
      events
    end
    
    def add_content_to_vips_image(image)
      begin
        require 'vips'
        
        name_text = Vips::Image.text @person.full_name, font: 'sans bold 40'
        image = image.composite name_text, 'over', x: 100, y: 100
        
        y_position = 170
        
        if @person.date_of_birth
          birth_year = @person.date_of_birth.year
          if @person.date_of_death
            life_span = "#{birth_year} - #{@person.date_of_death.year}"
          else
            current_age = Date.current.year - birth_year
            life_span = "Born #{birth_year} • Age #{current_age}"
          end
          
          life_text = Vips::Image.text life_span, font: 'sans 24'
          image = image.composite life_text, 'over', x: 100, y: y_position
          y_position += 60
        end
        
        family_title = Vips::Image.text "Family Connections", font: 'sans bold 28'
        image = image.composite family_title, 'over', x: 100, y: y_position
        y_position += 50
        
        family_info = build_comprehensive_family_info
        family_info.each do |info_line|
          family_text = Vips::Image.text info_line, font: 'sans 20'
          image = image.composite family_text, 'over', x: 120, y: y_position
          y_position += 35
        end
        
        footer_text = "Generated by ChronicleTree • #{Date.current.strftime('%B %Y')}"
        footer_display = Vips::Image.text footer_text, font: 'sans 16'
        image = image.composite footer_display, 'over', x: 100, y: CANVAS_HEIGHT - 80
        
        image
      rescue => e
        Rails.logger.error "Enhanced profile generation failed: #{e.message}"
        super(image)
      end
    end
    
    def build_comprehensive_family_info
      info_lines = []
      
      parents = @person.parents
      if parents.any?
        parents_names = parents.map(&:full_name).join(', ')
        info_lines << "Parents: #{parents_names}"
      end
      
      spouses = @person.all_spouses_including_deceased
      if spouses.any?
        # Build spouse display with proper deceased logic
        spouse_displays = spouses.map do |spouse|
          spouse_type = get_spouse_relationship_type(spouse)
          spouse_type
        end
        spouse_names = spouse_displays.join(', ')
        info_lines << "Spouses: #{spouse_names}"
      end
      
      children = @person.children
      if children.any?
        if children.count > 5
          children_text = "#{children.limit(5).map(&:full_name).join(', ')} and #{children.count - 5} more"
        else
          children_text = children.map(&:full_name).join(', ')
        end
        info_lines << "Children: #{children_text}"
      end
      
      siblings = @person.siblings
      if siblings.any?
        if siblings.count > 4
          siblings_text = "#{siblings.limit(4).map(&:full_name).join(', ')} and #{siblings.count - 4} more"
        else
          siblings_text = siblings.map(&:full_name).join(', ')
        end
        info_lines << "Siblings: #{siblings_text}"
      end
      
      total_relatives = (parents.count + spouses.count + children.count + siblings.count)
      if total_relatives > 0
        info_lines << ""
        info_lines << "Total family connections: #{total_relatives}"
        
        all_relatives = parents + spouses + children + siblings
        living_count = all_relatives.count { |p| p.date_of_death.nil? }
        info_lines << "Living relatives: #{living_count}"
      end
      
      info_lines
    end
    
    def add_main_card_background(image)
      card_margin = 60
      card_width = CANVAS_WIDTH - (card_margin * 2)
      card_height = CANVAS_HEIGHT - (card_margin * 2)
      
      white_card = Vips::Image.new_from_array [[255, 255, 255]]
      white_card = white_card.embed 0, 0, card_width, card_height, extend: :copy
      
      image = image.composite white_card, 'over', x: card_margin, y: card_margin
      
      image
    end
    
    def add_profile_header(image)
      header_height = 150
      
      header_bg = Vips::Image.new_from_array [[59, 130, 246]]
      header_bg = header_bg.embed 0, 0, CANVAS_WIDTH - 120, header_height, extend: :copy
      
      image = image.composite header_bg, 'over', x: 60, y: 60
      
      white_name = create_white_text(@person.full_name, 'sans bold 36')
      image = image.composite white_name, 'over', x: 100, y: 90
      
      if @person.date_of_birth
        birth_year = @person.date_of_birth.year
        age_text = @person.date_of_death ? 
          "#{birth_year} - #{@person.date_of_death.year}" : 
          "Born #{birth_year} • Age #{Date.current.year - birth_year}"
        
        white_dates = create_white_text(age_text, 'sans 20')
        image = image.composite white_dates, 'over', x: 100, y: 140
      end
      
      image
    end
    
    def add_family_sections(image)
      y_start = 250
      section_spacing = 45
      current_y = y_start
      
      blue_title = create_colored_text('Family Connections', 'sans bold 24', [59, 130, 246])
      image = image.composite blue_title, 'over', x: 100, y: current_y
      current_y += 50
      
      parents = @person.parents
      if parents.any?
        parents_title = create_colored_text('Parents', 'sans bold 18', [107, 114, 128])
        image = image.composite parents_title, 'over', x: 120, y: current_y
        current_y += 30
        
        parents_text = parents.map(&:full_name).join(', ')
        parents_content = create_colored_text(parents_text, 'sans 16', [75, 85, 99])
        image = image.composite parents_content, 'over', x: 140, y: current_y
        current_y += section_spacing
      end
      
      spouses = @person.all_spouses_including_deceased
      if spouses.any?
        spouse_title = create_colored_text("Spouses", 'sans bold 18', [107, 114, 128])
        image = image.composite spouse_title, 'over', x: 120, y: current_y
        current_y += 30
        
        # Build spouse display with proper deceased logic
        spouse_displays = spouses.map do |spouse|
          spouse_type = get_spouse_relationship_type(spouse)
          "#{spouse_type}: #{spouse.full_name}"
        end
        spouse_text = spouse_displays.join(', ')
        spouse_content = create_colored_text(spouse_text, 'sans 16', [75, 85, 99])
        image = image.composite spouse_content, 'over', x: 140, y: current_y
        current_y += section_spacing
      end
      
      children = @person.children
      if children.any?
        children_title = create_colored_text('Children', 'sans bold 18', [107, 114, 128])
        image = image.composite children_title, 'over', x: 120, y: current_y
        current_y += 30
        
        children_text = children.count > 4 ? 
          "#{children.limit(4).map(&:full_name).join(', ')} +#{children.count - 4} more" :
          children.map(&:full_name).join(', ')
        children_content = create_colored_text(children_text, 'sans 16', [75, 85, 99])
        image = image.composite children_content, 'over', x: 140, y: current_y
        current_y += section_spacing
      end
      
      siblings = @person.siblings
      if siblings.any?
        siblings_title = create_colored_text('Siblings', 'sans bold 18', [107, 114, 128])
        image = image.composite siblings_title, 'over', x: 120, y: current_y
        current_y += 30
        
        siblings_text = siblings.count > 3 ? 
          "#{siblings.limit(3).map(&:full_name).join(', ')} +#{siblings.count - 3} more" :
          siblings.map(&:full_name).join(', ')
        siblings_content = create_colored_text(siblings_text, 'sans 16', [75, 85, 99])
        image = image.composite siblings_content, 'over', x: 140, y: current_y
      end
      
      image
    end
    
    def add_styled_footer(image)
      footer_y = CANVAS_HEIGHT - 60
      
      footer_bg = Vips::Image.new_from_array [[249, 250, 251]]
      footer_bg = footer_bg.embed 0, 0, CANVAS_WIDTH - 120, 40, extend: :copy
      image = image.composite footer_bg, 'over', x: 60, y: footer_y - 10
      
      footer_text = "Generated by ChronicleTree • #{Date.current.strftime('%B %Y')}"
      footer_styled = create_colored_text(footer_text, 'sans 14', [107, 114, 128])
      image = image.composite footer_styled, 'over', x: 100, y: footer_y
      
      image
    end
    
    def create_white_text(text, font)
      begin
        text_img = Vips::Image.text text, font: font, rgba: true
        text_img = text_img.invert.extract_band(0, n: 3)
        white_bg = Vips::Image.new_from_array [[255, 255, 255]]
        white_bg = white_bg.embed 0, 0, text_img.width, text_img.height, extend: :copy
        white_bg
      rescue => e
        Rails.logger.warn "White text creation failed: #{e.message}"
        Vips::Image.text text, font: font
      end
    end
    
    def create_colored_text(text, font, color_rgb)
      begin
        Vips::Image.text text, font: font
      rescue => e
        Rails.logger.warn "Colored text creation failed: #{e.message}"
        Vips::Image.text text, font: 'sans 14'
      end
    end
    
    def get_section_y_position(section_name)
      # No longer needed - positioning is handled in the new two-column layout methods
      header_height = HEADER_HEIGHT + (@content_sections[:header_facts][:height] || 0)
      header_height + 80  # After header + margin
    end
    
    def calculate_max_items_for_space(available_height, item_height)
      [(available_height / item_height).floor, 1].max
    end
    
    def get_max_chars_for_column_width(width, font_size = 16)
      # Approximate character width calculation based on font size
      char_width = font_size * 0.6  # Average character width multiplier
      (width / char_width).floor
    end
    
    def get_max_chars_for_width(width, font_size = 16)
      # Approximate character width calculation for full width text
      char_width = font_size * 0.6  # Average character width multiplier
      (width / char_width).floor
    end
    
    def create_placeholder_svg
      create_basic_svg_structure
    end
    
    def create_basic_svg_structure
      height = @dynamic_height || MIN_CANVAS_HEIGHT
      <<~SVG
        <svg width="#{CANVAS_WIDTH}" height="#{height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#{COLORS[:background]}"/>
          <rect x="50" y="50" width="#{CANVAS_WIDTH-100}" height="#{height-100}" fill="#{COLORS[:card_bg]}" stroke="#{COLORS[:accent]}" stroke-width="2" rx="20"/>
          #{svg_content}
        </svg>
      SVG
    end
    
    def escape_xml(text)
      text.to_s.gsub('&', '&amp;').gsub('<', '&lt;').gsub('>', '&gt;').gsub('"', '&quot;').gsub("'", '&apos;')
    end
    
    def add_main_card(person)
      # Main white card background
      card_margin = 80
      card_width = CANVAS_WIDTH - (card_margin * 2)
      card_height = CANVAS_HEIGHT - (card_margin * 2)
      
      add_rounded_rectangle(
        card_margin, 
        card_margin, 
        card_width, 
        card_height,
        {
          radius: 20,
          color: COLORS[:card_bg],
          border_color: COLORS[:accent],
          border_width: 2
        }
      )
    end
    
    def add_person_header(person)
      header_y = 120
      
      # Profile photo (if available)
      photo_path = get_profile_photo_path(person)
      if photo_path
        add_profile_photo(photo_path, 120, header_y, 120)
      else
        add_placeholder_avatar(120, header_y, 120)
      end
      
      # Name and basic info
      name_x = 270
      add_text(person.full_name, name_x, header_y, {
        size: 36,
        weight: 'bold',
        color: COLORS[:text_primary],
        max_width: 50
      })
      
      # Life dates
      dates = format_life_dates(person)
      if dates.present?
        add_text(dates, name_x, header_y + 50, {
          size: 20,
          color: COLORS[:text_secondary]
        })
      end
      
      # Gender indicator (optional)
      if person.gender.present?
        gender_icon = person.gender.downcase == 'female' ? '♀' : '♂'
        add_text("#{gender_icon} #{person.gender}", name_x, header_y + 80, {
          size: 16,
          color: COLORS[:accent]
        })
      end
    end
    
    def add_person_details(person)
      details_y = 280
      left_margin = 120
      
      # Birth place (disabled - field doesn't exist in Person model)
      # if person.respond_to?(:birth_place) && person.birth_place.present?
      #   add_text("Born in #{person.birth_place}", left_margin, details_y, {
      #     size: 18,
      #     color: COLORS[:text_primary]
      #   })
      #   details_y += 35
      # end
      
      # Key facts (limit to 3 most important)
      facts = get_key_facts(person).limit(3)
      facts.each do |fact|
        if fact.label.present? && fact.value.present?
          fact_text = "• #{fact.label}: #{fact.value}"
        elsif fact.label.present?
          fact_text = "• #{fact.label}"
        elsif fact.value.present?
          fact_text = "• #{fact.value}"
        else
          next # Skip empty facts
        end
        
        add_text(fact_text, left_margin, details_y, {
          size: 16,
          color: COLORS[:text_primary],
          max_width: 80
        })
        details_y += 30
      end
      
      # Add some spacing if no facts
      details_y += 20 if facts.empty?
      
      # Timeline highlights (if available)
      timeline_items = get_timeline_highlights(person).limit(2)
      timeline_items.each do |item|
        year = item.date&.year || item.year || 'Unknown'
        timeline_text = "#{year}: #{item.title}"
        
        add_text(timeline_text, left_margin, details_y, {
          size: 16,
          color: COLORS[:text_secondary],
          max_width: 80
        })
        details_y += 30
      end
    end
    
    def add_relationships_summary(person)
      summary_y = 450
      left_margin = 120
      right_margin = CANVAS_WIDTH - 120
      
      # Create relationship summary boxes
      relationships = gather_relationship_stats(person)
      
      if relationships.any?
        add_text("Family Connections:", left_margin, summary_y, {
          size: 20,
          weight: 'bold',
          color: COLORS[:primary]
        })
        summary_y += 35
        
        # Display relationship counts in a grid
        col_width = 200
        relationships.each_with_index do |rel, index|
          x = left_margin + (index % 3) * col_width
          y = summary_y + (index / 3) * 35
          
          add_text("#{rel[:icon]} #{rel[:count]} #{rel[:label]}", x, y, {
            size: 16,
            color: COLORS[:text_primary]
          })
        end
      end
    end
    
    def add_footer
      footer_y = CANVAS_HEIGHT - 60
      
      # App branding
      add_text("Generated by ChronicleTree", 120, footer_y, {
        size: 14,
        color: COLORS[:text_secondary]
      })
      
      # Date generated
      date_text = Date.current.strftime("%B %Y")
      add_text(date_text, CANVAS_WIDTH - 200, footer_y, {
        size: 14,
        color: COLORS[:text_secondary]
      })
    end
    
    def get_profile_photo_path(person)
      # Try to get the profile photo from the person's profile
      return nil unless person.profile&.avatar&.attached?
      
      begin
        # For Active Storage, we need to get the actual file path
        # This is a simplified approach - in production you might want to handle this differently
        blob = person.profile.avatar.blob
        if blob.service.respond_to?(:path_for)
          blob.service.path_for(blob.key)
        else
          # Fallback: download the file temporarily
          tempfile = Tempfile.new(['avatar', blob.filename.extension_with_delimiter])
          tempfile.binmode
          blob.download { |chunk| tempfile.write(chunk) }
          tempfile.close
          tempfile.path
        end
      rescue => e
        Rails.logger.warn "Could not access profile photo: #{e.message}"
        nil
      end
    end
    
    def format_life_dates(person)
      birth_year = person.date_of_birth&.year || person.birth_year
      death_year = person.date_of_death&.year || person.death_year
      
      return nil unless birth_year
      
      if death_year
        "#{birth_year} - #{death_year}"
      else
        "Born #{birth_year}"
      end
    end
    
    def get_key_facts(person)
      person.facts.order(:created_at)
    end
    
    def get_timeline_highlights(person)
      person.timeline_items.order(:date, :created_at)
    end
    
    def gather_relationship_stats(person)
      stats = []
      
      # Count current spouses
      current_spouses = count_current_spouses(person)
      if current_spouses > 0
        stats << {
          icon: 'Spouse',
          count: current_spouses,
          label: current_spouses == 1 ? 'spouse' : 'spouses'
        }
      end
      
      # Count children
      children = count_children(person)
      if children > 0
        stats << {
          icon: 'Child',
          count: children,
          label: children == 1 ? 'child' : 'children'
        }
      end
      
      # Count parents
      parents = count_parents(person)
      if parents > 0
        stats << {
          icon: 'Parent',
          count: parents,
          label: parents == 1 ? 'parent' : 'parents'
        }
      end
      
      # Count siblings
      siblings = count_siblings(person)
      if siblings > 0
        stats << {
          icon: 'Sibling',
          count: siblings,
          label: siblings == 1 ? 'sibling' : 'siblings'
        }
      end
      
      stats
    end
    
    def count_current_spouses(person)
      person.relationships
            .where(relationship_type: 'spouse')
            .where.not(is_ex: true)
            .count
    end
    
    def count_children(person)
      person.relationships
            .where(relationship_type: 'child')
            .count
    end
    
    def count_parents(person)
      person.related_by_relationships
            .where(relationship_type: 'child')
            .count
    end
    
    def count_siblings(person)
      person.relationships
            .where(relationship_type: 'sibling')
            .count
    end
  end
end