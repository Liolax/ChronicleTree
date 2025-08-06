# Test script to verify rate limiting implementation
# Run this after starting the Rails server to test Rack::Attack configuration

require 'net/http'
require 'json'

# Test configuration
BASE_URL = 'http://localhost:3000'
TEST_ENDPOINTS = [
  '/api/v1/auth/sign_in',
  '/api/v1/people',
  '/ping'
]

def test_rate_limiting(endpoint, requests_count = 10)
  puts "\n=== Testing Rate Limiting for #{endpoint} ==="
  
  requests_count.times do |i|
    uri = URI("#{BASE_URL}#{endpoint}")
    
    case endpoint
    when '/api/v1/auth/sign_in'
      # Test login rate limiting
      http = Net::HTTP.new(uri.host, uri.port)
      request = Net::HTTP::Post.new(uri)
      request['Content-Type'] = 'application/json'
      request.body = { user: { email: 'test@example.com', password: 'wrongpassword' } }.to_json
    else
      # Test general API rate limiting
      http = Net::HTTP.new(uri.host, uri.port)
      request = Net::HTTP::Get.new(uri)
    end
    
    response = http.request(request)
    
    puts "Request ##{i + 1}: Status #{response.code}"
    
    # Check for rate limiting headers
    rate_limit_remaining = response['X-RateLimit-Remaining']
    rate_limit_reset = response['X-RateLimit-Reset']
    
    if rate_limit_remaining
      puts "  Rate Limit Remaining: #{rate_limit_remaining}"
      puts "  Rate Limit Reset: #{Time.at(rate_limit_reset.to_i)}" if rate_limit_reset
    end
    
    if response.code == '429'
      puts "  ✓ Rate limited! Protection is working."
      break
    elsif response.code.start_with?('2')
      puts "  Request successful"
    else
      puts "  Response: #{response.body[0..100]}..."
    end
    
    sleep(0.1) # Small delay between requests
  end
end

def test_security_logging
  puts "\n=== Testing Security Logging ==="
  
  # Test suspicious request
  uri = URI("#{BASE_URL}/api/v1/people/../admin")
  http = Net::HTTP.new(uri.host, uri.port)
  request = Net::HTTP::Get.new(uri)
  
  response = http.request(request)
  puts "Suspicious path request: Status #{response.code}"
  puts "This should be logged as suspicious activity."
end

# Run tests
puts "ChronicleTree Security Features Test"
puts "===================================="

TEST_ENDPOINTS.each do |endpoint|
  test_rate_limiting(endpoint, 8)
end

test_security_logging

puts "\n=== Test Complete ==="
puts "Check the Rails logs for:"
puts "1. Rate limiting events (rack::attack throttling messages)"
puts "2. Security events (suspicious_activity logs)"
puts "3. Audit logging (user_activity and request tracking)"
puts "4. Paper Trail version records in the database"
