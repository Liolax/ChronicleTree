#!/usr/bin/env ruby
# Quick test script to verify deceased spouse API functionality

require 'net/http'
require 'json'
require 'uri'

# Test API endpoint
base_url = 'http://localhost:3000/api/v1'

# First, let's try to authenticate
auth_data = {
  user: {
    email: 'test@example.com',
    password: 'Password123!'
  }
}

# Login request
uri = URI("#{base_url}/auth/sign_in")
http = Net::HTTP.new(uri.host, uri.port)
request = Net::HTTP::Post.new(uri)
request['Content-Type'] = 'application/json'
request.body = auth_data.to_json

begin
  response = http.request(request)
  puts "Login Response: #{response.code}"
  
  if response.code == '200'
    # Extract token from response headers
    auth_token = response['Authorization']
    puts "Auth token: #{auth_token[0..20]}..." if auth_token
    
    # Test fetching people with deceased spouse relationships
    uri = URI("#{base_url}/people")
    request = Net::HTTP::Get.new(uri)
    request['Authorization'] = auth_token if auth_token
    request['Content-Type'] = 'application/json'
    
    response = http.request(request)
    puts "People Response: #{response.code}"
    
    if response.code == '200'
      people = JSON.parse(response.body)
      puts "Found #{people.length} people"
      
      # Look for deceased people
      deceased_people = people.select { |p| p['is_deceased'] }
      puts "Deceased people: #{deceased_people.map { |p| p['first_name'] + ' ' + p['last_name'] }.join(', ')}"
      
      # Look for relationships API
      uri = URI("#{base_url}/people/1/tree")
      request = Net::HTTP::Get.new(uri)
      request['Authorization'] = auth_token if auth_token
      request['Content-Type'] = 'application/json'
      
      response = http.request(request)
      puts "Tree Response: #{response.code}"
      
      if response.code == '200'
        tree_data = JSON.parse(response.body)
        
        # Check for deceased spouse relationships
        if tree_data['edges']
          deceased_spouse_edges = tree_data['edges'].select { |e| e['is_deceased'] }
          puts "Found #{deceased_spouse_edges.length} deceased spouse relationships"
          deceased_spouse_edges.each do |edge|
            puts "  - #{edge['source']} <-> #{edge['target']} (deceased: #{edge['is_deceased']})"
          end
        end
      end
    end
  else
    puts "Login failed: #{response.body}"
  end
rescue => e
  puts "Connection error: #{e.message}"
  puts "Make sure the Rails server is running with: bundle exec rails server"
end
