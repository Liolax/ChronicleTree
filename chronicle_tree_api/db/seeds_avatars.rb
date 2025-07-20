# Separate avatar seeding script that can be run independently
# Usage: rails runner db/seeds_avatars.rb

puts "Attaching avatars to existing profiles..."

# Find all people who need avatars
people_needing_avatars = Person.joins(:profile).where.not(profiles: { id: nil })

avatar_urls = {
  'John' => 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=facearea&w=400&h=400&facepad=2',
  'Alice' => 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400&facepad=2',
  'Jane' => 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=facearea&w=400&h=400&facepad=2',
  'David' => 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=facearea&w=400&h=400&facepad=2',
  'Bob' => 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?auto=format&fit=facearea&w=400&h=400&facepad=2',
  'Emily' => 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=facearea&w=400&h=400&facepad=2',
  'Charlie' => 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=facearea&w=400&h=400&facepad=2',
  'Molly' => 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=400&h=400&facepad=2',
  'Robert' => 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=facearea&w=400&h=400&facepad=2',
  'Sarah' => 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=400&h=400&facepad=2',
  'Thomas' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&w=400&h=400&facepad=2',
  'Lisa' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&w=400&h=400&facepad=2',
  'Michael' => 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=facearea&w=400&h=400&facepad=2',
  'Emma' => 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=facearea&w=400&h=400&facepad=2',
  'William' => 'https://images.unsplash.com/photo-1556474835-b0f3ac40d4d1?auto=format&fit=facearea&w=400&h=400&facepad=2',
  'Patricia' => 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=facearea&w=400&h=400&facepad=2',
  'Richard' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=400&h=400&facepad=2',
  'Margaret' => 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=facearea&w=400&h=400&facepad=2'
}

require 'open-uri'

people_needing_avatars.each do |person|
  profile = person.profile
  next unless profile
  
  if profile.avatar.attached?
    puts "  ✓ Avatar already exists for #{person.first_name}"
    next
  end
  
  url = avatar_urls[person.first_name]
  if url
    begin
      puts "  Downloading avatar for #{person.first_name}..."
      file = URI.open(url, read_timeout: 10)
      profile.avatar.attach(io: file, filename: "avatar_#{person.first_name.downcase}.jpg", content_type: 'image/jpeg')
      puts "  ✓ Avatar attached for #{person.first_name}"
    rescue => e
      puts "  ⚠ Error attaching avatar for #{person.first_name}: #{e.message}"
    end
  else
    puts "  ⚠ No avatar URL found for #{person.first_name}"
  end
end

puts "Avatar seeding completed!"