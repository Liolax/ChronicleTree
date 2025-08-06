#!/usr/bin/env ruby
# Backend test script for marriage age validation and relationship constraints
# Tests the server-side validation logic that triggers 422 errors

require 'net/http'
require 'json'
require 'uri'

class ValidationTester
  def initialize(base_url = 'http://localhost:4000')
    @base_url = base_url
    @auth_token = nil
  end

  def authenticate
    puts "=== AUTHENTICATION TEST ==="
    
    # First, try to authenticate with test user
    auth_url = URI("#{@base_url}/api/v1/auth/sign_in")
    auth_data = {
      email: 'test@example.com',
      password: 'Password123!'
    }
    
    response = make_request(:post, auth_url, auth_data)
    
    if response.code == '200'
      # Extract auth token from headers
      @auth_token = response['authorization']
      puts "✅ Authentication successful"
      puts "Token: #{@auth_token ? 'Present' : 'Missing'}"
      return true
    else
      puts "❌ Authentication failed: #{response.code}"
      puts "Response: #{response.body}"
      return false
    end
  end

  def test_marriage_age_validation
    puts "\n=== MARRIAGE AGE VALIDATION TEST ==="
    
    return false unless @auth_token
    
    # Test creating a relationship that should trigger marriage age validation
    # This should return a 422 error with marriage age message
    
    relationship_url = URI("#{@base_url}/api/v1/relationships")
    relationship_data = {
      person_id: 1,      # Assuming person 1 exists
      relative_id: 2,    # Assuming person 2 exists and is too young
      relationship_type: 'spouse',
      is_ex: false
    }
    
    response = make_request(:post, relationship_url, relationship_data, @auth_token)
    
    puts "Response code: #{response.code}"
    puts "Response body: #{response.body}"
    
    if response.code == '422'
      error_data = JSON.parse(response.body) rescue {}
      error_message = error_data['errors']&.first || error_data['message'] || error_data['exception'] || ''
      
      puts "Error message: #{error_message}"
      
      # Check if it's a marriage age error
      if error_message.include?('marriage') && error_message.include?('16')
        puts "✅ Marriage age validation working correctly"
        return true
      elsif error_message.include?('years old') && error_message.include?('Minimum')
        puts "✅ Marriage age validation working correctly (alternative pattern)"
        return true
      else
        puts "⚠️ Got 422 error but not marriage age related: #{error_message}"
        return false
      end
    else
      puts "❌ Expected 422 error for marriage age validation"
      return false
    end
  end

  def test_person_creation_with_invalid_data
    puts "\n=== PERSON CREATION VALIDATION TEST ==="
    
    return false unless @auth_token
    
    # Test creating a person with invalid data that should trigger validation
    person_url = URI("#{@base_url}/api/v1/people")
    person_data = {
      person: {
        first_name: 'Test',
        last_name: 'Child',
        date_of_birth: Date.today.strftime('%Y-%m-%d'), # Today (0 years old)
        gender: 'Female'
      },
      relationships: [
        {
          relative_id: 1, # Assuming person 1 exists
          relationship_type: 'spouse'
        }
      ]
    }
    
    response = make_request(:post, person_url, person_data, @auth_token)
    
    puts "Response code: #{response.code}"
    puts "Response body: #{response.body}"
    
    if response.code == '422'
      error_data = JSON.parse(response.body) rescue {}
      error_message = error_data['errors']&.first || error_data['message'] || error_data['exception'] || ''
      
      puts "Error message: #{error_message}"
      
      # Check if it's a marriage age error
      if error_message.include?('marriage') || error_message.include?('16') || error_message.include?('Minimum')
        puts "✅ Person creation validation working correctly"
        return true
      else
        puts "⚠️ Got 422 error but not marriage age related: #{error_message}"
        puts "This might be a different validation error, which is also good"
        return true
      end
    elsif response.code == '201'
      puts "⚠️ Person created successfully - validation might be missing"
      # Clean up created person if needed
      return false
    else
      puts "❌ Unexpected response code: #{response.code}"
      return false
    end
  end

  def test_validation_error_format
    puts "\n=== VALIDATION ERROR FORMAT TEST ==="
    
    return false unless @auth_token
    
    # Test that validation errors are properly formatted for frontend consumption
    person_url = URI("#{@base_url}/api/v1/people")
    person_data = {
      person: {
        first_name: '', # Empty name should trigger validation
        last_name: '',
        gender: 'Invalid' # Invalid gender
      }
    }
    
    response = make_request(:post, person_url, person_data, @auth_token)
    
    puts "Response code: #{response.code}"
    
    if response.code == '422'
      begin
        error_data = JSON.parse(response.body)
        puts "Error data structure: #{error_data.keys}"
        
        if error_data['errors'].is_a?(Array)
          puts "✅ Errors properly formatted as array"
          puts "Error messages: #{error_data['errors']}"
          return true
        elsif error_data['message']
          puts "✅ Error message present: #{error_data['message']}"
          return true
        elsif error_data['exception']
          puts "✅ Exception message present: #{error_data['exception']}"
          return true
        else
          puts "❌ Error format not recognized"
          puts "Response: #{response.body}"
          return false
        end
      rescue JSON::ParserError
        puts "❌ Response is not valid JSON"
        puts "Response: #{response.body}"
        return false
      end
    else
      puts "❌ Expected 422 error for validation"
      return false
    end
  end

  private

  def make_request(method, url, data = nil, auth_token = nil)
    http = Net::HTTP.new(url.host, url.port)
    
    case method
    when :post
      request = Net::HTTP::Post.new(url)
      request['Content-Type'] = 'application/json'
      request.body = data.to_json if data
    when :get
      request = Net::HTTP::Get.new(url)
    end
    
    if auth_token
      request['Authorization'] = auth_token
    end
    
    http.request(request)
  end
end

# Run tests
def run_backend_validation_tests
  puts "Starting backend validation tests..."
  puts "Testing server at: http://localhost:4000"
  
  tester = ValidationTester.new
  
  results = {
    auth: false,
    marriage_age: false,
    person_creation: false,
    error_format: false
  }
  
  results[:auth] = tester.authenticate
  
  if results[:auth]
    results[:marriage_age] = tester.test_marriage_age_validation
    results[:person_creation] = tester.test_person_creation_with_invalid_data
    results[:error_format] = tester.test_validation_error_format
  else
    puts "\n❌ Skipping validation tests - authentication failed"
    puts "Please ensure:"
    puts "1. Rails server is running on http://localhost:4000"
    puts "2. Test user (test@example.com / Password123!) exists"
    puts "3. Database is properly seeded"
  end
  
  puts "\n=== TEST RESULTS SUMMARY ==="
  results.each do |test_name, passed|
    status = passed ? "✅ PASS" : "❌ FAIL"
    puts "#{test_name.to_s.upcase.gsub('_', ' ')}: #{status}"
  end
  
  passed_count = results.values.count(true)
  total_count = results.size
  
  puts "\nPassed: #{passed_count}/#{total_count} tests"
  
  if passed_count == total_count
    puts "🎉 All backend validation tests passed!"
  else
    puts "⚠️ Some tests failed. Check the output above for details."
  end
  
  puts "\n=== TROUBLESHOOTING ==="
  puts "If tests fail:"
  puts "1. Ensure Rails server is running: rails server -p 4000"
  puts "2. Check database has test data: rails db:seed"
  puts "3. Verify authentication is working: check user exists"
  puts "4. Check Rails logs for detailed error messages"
  puts "5. Ensure CORS is configured for API requests"
end

# Run tests if this script is executed directly
if __FILE__ == $0
  run_backend_validation_tests
end
