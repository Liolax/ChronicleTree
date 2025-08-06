# Test media creation with file attachment to debug Redis issue
require_relative '../../config/environment'

puts "=== TESTING MEDIA CREATION WITH FILE ATTACHMENT ==="

# Find test user and a person
user = User.find_by(email: 'test@example.com')
person = user.people.first

puts "User: #{user.email}"
puts "Person: #{person.first_name} #{person.last_name} (ID: #{person.id})"
puts "Active Job adapter: #{Rails.application.config.active_job.queue_adapter}"

# Test media creation with file
begin
  media = person.media.build(
    title: "Test Media with File", 
    description: "Test description for debugging Redis issue"
  )
  
  # Create a simple in-memory file for testing
  require 'tempfile'
  temp_file = Tempfile.new(['test', '.txt'])
  temp_file.write("This is a test file content")
  temp_file.rewind
  
  # Attach the file
  media.file.attach(
    io: temp_file,
    filename: 'test_file.txt',
    content_type: 'text/plain'
  )
  
  if media.save
    puts "SUCCESS: Media with file created successfully"
    puts "  Media ID: #{media.id}"
    puts "  Title: #{media.title}"
    puts "  File attached: #{media.file.attached?}"
    puts "  File name: #{media.file.filename}" if media.file.attached?
  else
    puts "ERROR: Media creation failed"
    puts "  Errors: #{media.errors.full_messages}"
  end
  
  temp_file.close
  temp_file.unlink
  
rescue => e
  puts "EXCEPTION: #{e.message}"
  puts "Error class: #{e.class}"
  puts "Backtrace:"
  puts e.backtrace.first(10).join("\n")
end