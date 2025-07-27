# frozen_string_literal: true

# Base class for generating shareable family tree images with VIPS image processing
# Provides common functionality for profile cards and tree snippet generation
module ImageGeneration
  class BaseGenerator
    require 'vips'
    require 'tempfile'
    
    CANVAS_WIDTH = 1200
    CANVAS_HEIGHT = 630
    
    # Updated to match main app styling from tailwind.config.js
    COLORS = {
      primary: '#4F868E',        # button-primary (teal)
      secondary: '#A0C49D',      # app-accent (sage green)
      accent: '#4F868E',         # button-primary (teal)
      text_primary: '#4A4A4A',   # app-primary (dark gray)
      text_secondary: '#6b7280', # keeping this gray for secondary text
      text_light: '#ffffff',     # white text on colored backgrounds
      background: '#F8F4F0',     # app-bg (warm beige)
      card_bg: '#FEFEFA'         # app-container (warm white)
    }.freeze
    
    def initialize
      @canvas = create_base_canvas
      @generation_start_time = Time.current
    end
    
    protected
    
    def create_base_canvas
      nil
    end
    
    def add_gradient_background
      @canvas = @canvas.composite(create_gradient) do |c|
        c.compose "Over"
      end
    end
    
    def create_gradient
      MiniMagick::Image.create do |gradient|
        gradient.size "#{CANVAS_WIDTH}x#{CANVAS_HEIGHT}"
        gradient.gradient "#{COLORS[:primary]}-#{COLORS[:secondary]}"
      end
    end
    
    def add_text(text, x, y, options = {})
      font_size = options[:size] || 24
      color = options[:color] || COLORS[:text_primary]
      font_weight = options[:weight] || 'normal'
      max_width = options[:max_width]
      
      if max_width && text.length > max_width
        text = "#{text[0...max_width-3]}..."
      end
      
      @canvas = @canvas.composite(create_text_image(text, font_size, color, font_weight)) do |c|
        c.compose "Over"
        c.geometry "+#{x}+#{y}"
      end
    end
    
    def create_text_image(text, font_size, color, font_weight)
      MiniMagick::Image.create do |txt|
        txt.size "#{CANVAS_WIDTH}x#{font_size + 10}"
        txt.canvas "transparent"
        txt.fill color
        txt.pointsize font_size
        txt.font get_font_path(font_weight)
        txt.gravity "NorthWest"
        txt.annotate("+5+5", text)
      end
    end
    
    def get_font_path(weight = 'normal')
      case weight
      when 'bold'
        find_system_font('Arial-Bold') || 'Arial-Bold'
      else
        find_system_font('Arial') || 'Arial'
      end
    end
    
    def find_system_font(font_name)
      possible_paths = [
        "/System/Library/Fonts/#{font_name}.ttf",
        "/usr/share/fonts/truetype/dejavu/#{font_name}.ttf",
        "C:/Windows/Fonts/#{font_name.downcase}.ttf"
      ]
      
      possible_paths.find { |path| File.exist?(path) }
    end
    
    def add_rounded_rectangle(x, y, width, height, options = {})
      radius = options[:radius] || 10
      color = options[:color] || COLORS[:card_bg]
      border_color = options[:border_color]
      border_width = options[:border_width] || 0
      
      rect = MiniMagick::Image.create do |r|
        r.size "#{width}x#{height}"
        r.canvas color
        
        if radius > 0
          r.border_radius "#{radius}x#{radius}"
        end
        
        if border_color && border_width > 0
          r.bordercolor border_color
          r.border border_width
        end
      end
      
      @canvas = @canvas.composite(rect) do |c|
        c.compose "Over"
        c.geometry "+#{x}+#{y}"
      end
    end
    
    def add_profile_photo(photo_path, x, y, size = 100)
      return unless photo_path && File.exist?(photo_path)
      
      begin
        photo = MiniMagick::Image.open(photo_path)
        
        photo.resize "#{size}x#{size}^"
        photo.gravity "center"
        photo.crop "#{size}x#{size}+0+0"
        
        mask = create_circular_mask(size)
        photo = photo.composite(mask) do |c|
          c.compose "CopyOpacity"
        end
        
        @canvas = @canvas.composite(photo) do |c|
          c.compose "Over"
          c.geometry "+#{x}+#{y}"
        end
      rescue => e
        Rails.logger.warn "Failed to add profile photo: #{e.message}"
        add_placeholder_avatar(x, y, size)
      end
    end
    
    def create_circular_mask(size)
      MiniMagick::Image.create do |mask|
        mask.size "#{size}x#{size}"
        mask.canvas "black"
        mask.fill "white"
        mask.draw "circle #{size/2},#{size/2} #{size/2},0"
      end
    end
    
    def add_placeholder_avatar(x, y, size)
      @canvas = @canvas.composite(create_avatar_placeholder(size)) do |c|
        c.compose "Over"
        c.geometry "+#{x}+#{y}"
      end
    end
    
    def create_avatar_placeholder(size)
      MiniMagick::Image.create do |placeholder|
        placeholder.size "#{size}x#{size}"
        placeholder.canvas COLORS[:secondary]
        placeholder.fill COLORS[:text_light]
        placeholder.pointsize size / 3
        placeholder.font get_font_path('bold')
        placeholder.gravity "center"
        placeholder.annotate("+0+0", "👤")
        
        mask = create_circular_mask(size)
        placeholder = placeholder.composite(mask) do |c|
          c.compose "CopyOpacity"
        end
      end
    end
    
    def add_logo(x = nil, y = nil)
      x ||= CANVAS_WIDTH - 200
      y ||= CANVAS_HEIGHT - 50
      
      add_text("ChronicleTree", x, y, {
        size: 16,
        color: COLORS[:text_secondary],
        weight: 'bold'
      })
    end
    
    def add_decorative_elements
      add_corner_decoration(50, 50)
      add_corner_decoration(CANVAS_WIDTH - 100, 50, flip: true)
    end
    
    def add_corner_decoration(x, y, options = {})
      size = 30
      
      decoration = MiniMagick::Image.create do |dec|
        dec.size "#{size}x#{size}"
        dec.canvas "transparent"
        dec.fill COLORS[:accent]
        dec.draw "circle #{size/2},#{size/2} #{size/2},#{size/4}"
      end
      
      if options[:flip]
        decoration.flop
      end
      
      @canvas = @canvas.composite(decoration) do |c|
        c.compose "Over"
        c.geometry "+#{x}+#{y}"
      end
    end
    
    def save_to_file(filename)
      output_dir = Rails.root.join('public', 'generated_shares')
      FileUtils.mkdir_p(output_dir)
      
      timestamp = Time.current.to_i
      unique_filename = "#{timestamp}_#{filename}"
      
      begin
        jpg_filename = unique_filename.gsub('.svg', '.jpg')
        output_path = output_dir.join(jpg_filename)
        
        svg_content = create_placeholder_svg
        svg_buffer = svg_content.encode('UTF-8')
        
        image = Vips::Image.new_from_buffer(svg_buffer, "")
        image.write_to_file(output_path.to_s, Q: 95)
        
        "generated_shares/#{jpg_filename}"
      rescue => e
        Rails.logger.error "JPG conversion failed: #{e.message}, falling back to SVG"
        
        svg_filename = unique_filename.gsub('.jpg', '.svg')
        output_path = output_dir.join(svg_filename)
        svg_content = create_placeholder_svg
        File.write(output_path, svg_content)
        "generated_shares/#{svg_filename}"
      end
    end
    
    def output_dir
      Rails.root.join('public', 'generated_shares')
    end
    
    def unique_filename
      "#{Time.current.to_i}_#{SecureRandom.hex(8)}"
    end
    
    def create_placeholder_svg
      create_basic_svg_structure
    end
    
    def create_basic_svg_structure
      <<~SVG
        <svg width="#{CANVAS_WIDTH}" height="#{CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#{COLORS[:background]}"/>
          <rect x="50" y="50" width="#{CANVAS_WIDTH-100}" height="#{CANVAS_HEIGHT-100}" fill="#{COLORS[:card_bg]}" stroke="#{COLORS[:accent]}" stroke-width="2" rx="20"/>
          #{svg_content}
        </svg>
      SVG
    end
    
    def svg_content
      <<~CONTENT
        <text x="#{CANVAS_WIDTH/2}" y="#{CANVAS_HEIGHT/2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" fill="#{COLORS[:text_primary]}">
          ChronicleTree Share
        </text>
        <text x="#{CANVAS_WIDTH/2}" y="#{CANVAS_HEIGHT/2 + 50}" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#{COLORS[:text_secondary]}">
          Family Tree Sharing System
        </text>
      CONTENT
    end
    
    def generation_time
      ((Time.current - @generation_start_time) * 1000).round
    end
    
    def convert_svg_to_jpg(svg_content)
      begin
        create_vips_jpg_with_content
      rescue => e
        Rails.logger.error "VIPS JPG creation failed: #{e.message}"
        create_enhanced_fallback_jpg
      end
    end
    
    def create_vips_jpg_with_content
      require 'vips'
      
      image = create_gradient_background
      image_with_content = add_content_to_vips_image(image)
      image_with_content.jpegsave_buffer(Q: 85)
    end
    
    def create_gradient_background
      require 'vips'
      
      base_color = [59, 130, 246]
      light_color = [248, 250, 252]
      
      top_half = Vips::Image.new_from_array [light_color]
      top_half = top_half.embed 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT / 2, extend: :copy
      
      bottom_half = Vips::Image.new_from_array [base_color.map { |c| (c * 0.1 + 240).to_i }]
      bottom_half = bottom_half.embed 0, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT / 2, extend: :copy
      
      gradient = top_half.composite bottom_half, 'over'
      
      gradient
    end
    
    def add_content_to_vips_image(image)
      begin
        text_image = Vips::Image.text 'ChronicleTree', 
                                     width: CANVAS_WIDTH - 100,
                                     height: 100,
                                     font: 'Arial 36',
                                     rgba: true
        
        subtitle = Vips::Image.text 'Family Tree Sharing System',
                                   width: CANVAS_WIDTH - 100, 
                                   height: 50,
                                   font: 'Arial 18',
                                   rgba: true
        
        image = image.composite text_image, 'over', x: 100, y: CANVAS_HEIGHT/2 - 75
        image = image.composite subtitle, 'over', x: 100, y: CANVAS_HEIGHT/2 + 25
        
        image
      rescue => e
        Rails.logger.warn "VIPS text overlay failed: #{e.message}"
        image
      end
    end
    
    def create_enhanced_fallback_jpg
      begin
        create_vips_jpg_with_content
      rescue => e
        Rails.logger.error "Enhanced fallback failed: #{e.message}"
        create_minimal_fallback_jpg
      end
    end
    
    def create_minimal_fallback_jpg
      minimal_jpg_content = "\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xFF\xDB\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\f\x14\r\f\v\v\f\x19\x12\x13\x0F\x14\x1D\x1A\x1F\x1E\x1D\x1A\x1C\x1C $.' \",#\x1C\x1C(7),01444\x1F'9=82<.342\xFF\xC0\x00\x11\x08\x02v\x04\xB0\x03\x01\"\x00\x02\x11\x01\x03\x11\x01\xFF\xC4\x00\x1F\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\v\xFF\xC4\x00\xB5\x10\x00\x02\x01\x03\x03\x02\x04\x03\x05\x05\x04\x04\x00\x00\x01}\x01\x02\x03\x00\x04\x11\x05\x12!1A\x06\x13Qa\x07\"q\x142\x81\x91\xA1\x08#B\xB1\xC1\x15R\xD1\xF0$3br\x82\t\n\x16\x17\x18\x19\x1A%&'()*456789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz\x83\x84\x85\x86\x87\x88\x89\x8A\x92\x93\x94\x95\x96\x97\x98\x99\x9A\xA2\xA3\xA4\xA5\xA6\xA7\xA8\xA9\xAA\xB2\xB3\xB4\xB5\xB6\xB7\xB8\xB9\xBA\xC2\xC3\xC4\xC5\xC6\xC7\xC8\xC9\xCA\xD2\xD3\xD4\xD5\xD6\xD7\xD8\xD9\xDA\xE1\xE2\xE3\xE4\xE5\xE6\xE7\xE8\xE9\xEA\xF1\xF2\xF3\xF4\xF5\xF6\xF7\xF8\xF9\xFA\xFF\xDA\x00\x0C\x03\x01\x00\x02\x11\x03\x11\x00?\x00\xF7\xFA(\xA2\x80\x0F\xFF\xD9"
      minimal_jpg_content
    end

    def cleanup
    end
  end
end