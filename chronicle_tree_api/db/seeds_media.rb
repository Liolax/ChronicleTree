# Separate media file seeding script that can be run independently
# Usage: rails runner db/seeds_media.rb

puts "Attaching media files to existing media records..."

media_files = [
  # Images
  {id: 301, url: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=400&h=400&facepad=2', filename: 'john_doe.jpg', content_type: 'image/jpeg'},
  {id: 302, url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=facearea&w=400&h=400&facepad=2', filename: 'alice_painting.jpg', content_type: 'image/jpeg'},
  {id: 303, url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=facearea&w=400&h=400&facepad=2', filename: 'jane_graduation.jpg', content_type: 'image/jpeg'},
  {id: 304, url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=facearea&w=400&h=400&facepad=2', filename: 'david_work.jpg', content_type: 'image/jpeg'},
  {id: 305, url: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=facearea&w=400&h=400&facepad=2', filename: 'bob_soccer.jpg', content_type: 'image/jpeg'},
  {id: 306, url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=400&h=400&facepad=2', filename: 'emily_reading.jpg', content_type: 'image/jpeg'},
  {id: 307, url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=facearea&w=400&h=400&facepad=2', filename: 'charlie_guitar.jpg', content_type: 'image/jpeg'},
  # PDFs
  {id: 308, url: 'https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf', filename: 'john_doe_resume.pdf', content_type: 'application/pdf'},
  {id: 309, url: 'https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf', filename: 'alice_portfolio.pdf', content_type: 'application/pdf'}
]

require 'open-uri'

media_files.each do |file_info|
  media = Medium.find_by(id: file_info[:id])
  unless media
    puts "  ⚠ Media record with id #{file_info[:id]} not found, skipping"
    next
  end
  
  if media.file.attached?
    puts "  ✓ Media file already exists: #{file_info[:filename]}"
    next
  end
  
  begin
    puts "  Downloading #{file_info[:filename]}..."
    file = URI.open(file_info[:url], read_timeout: 10)
    media.file.attach(io: file, filename: file_info[:filename], content_type: file_info[:content_type])
    puts "  ✓ Media file attached: #{file_info[:filename]}"
  rescue => e
    puts "  ⚠ Error attaching #{file_info[:filename]}: #{e.message}"
  end
end

puts "Media file seeding completed!"