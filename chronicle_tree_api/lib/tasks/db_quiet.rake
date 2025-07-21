# Custom rake tasks for quiet database operations
namespace :db do
  desc "Reset database quietly (suppress log rotation messages)"
  task :reset_quiet => :environment do
    ENV['DB_RESET'] = 'true'
    Rails.logger.level = Logger::ERROR
    
    # Suppress stdout during database operations
    original_stdout = $stdout
    $stdout = File.new(File::NULL, 'w')
    
    begin
      Rake::Task['db:drop'].invoke
      Rake::Task['db:create'].invoke
      Rake::Task['db:schema:load'].invoke
      Rake::Task['db:seed'].invoke
    rescue => e
      $stdout = original_stdout
      puts "Database reset failed: #{e.message}"
      exit 1
    ensure
      $stdout = original_stdout
      ENV.delete('DB_RESET')
    end
    
    puts "Database reset completed successfully!"
  end
  
  desc "Seed database quietly"
  task :seed_quiet => :environment do
    ENV['DB_SEED'] = 'true'
    Rails.logger.level = Logger::ERROR
    
    original_stdout = $stdout
    $stdout = File.new(File::NULL, 'w')
    
    begin
      Rake::Task['db:seed'].invoke
    rescue => e
      $stdout = original_stdout
      puts "Database seed failed: #{e.message}"
      exit 1
    ensure
      $stdout = original_stdout
      ENV.delete('DB_SEED')
    end
    
    puts "Database seeded successfully!"
  end
end