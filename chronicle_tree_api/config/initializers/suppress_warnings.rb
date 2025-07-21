# Suppress VIPS warnings about missing DLL modules
# These warnings are common on Windows and don't affect functionality

# Redirect VIPS warnings to /dev/null on Windows
if Gem.win_platform?
  begin
    # Suppress VIPS warnings by setting environment variable
    ENV['VIPS_WARNING'] = '0'
    ENV['G_MESSAGES_DEBUG'] = ''
    
    # Alternative: Redirect stderr for VIPS operations
    # This prevents the DLL not found warnings from showing
    original_stderr = $stderr
    $stderr = File.new('NUL', 'w') if Gem.win_platform?
    
    # Only during initialization, restore stderr after gems are loaded
    Rails.application.config.after_initialize do
      $stderr = original_stderr if defined?(original_stderr)
    end
  rescue => e
    Rails.logger.debug "Could not suppress VIPS warnings: #{e.message}"
  end
end

# Suppress other common development warnings (Ruby 2.7+)
if Warning.respond_to?(:ignore)
  Warning.ignore(/method redefined/)
  Warning.ignore(/already initialized constant/)
  Warning.ignore(/circular require considered harmful/)
end

# Custom log formatter to filter out log rotation messages
class QuietLogFormatter < Logger::Formatter
  def call(severity, time, progname, msg)
    # Skip log rotation messages
    return '' if msg.to_s.include?('log shifting failed') || 
                 msg.to_s.include?('closed stream') ||
                 msg.to_s.include?('log rotation')
    
    # Skip VIPS warnings
    return '' if msg.to_s.include?('VIPS-WARNING') ||
                 msg.to_s.include?('unable to load') ||
                 msg.to_s.include?('.dll')
    
    super
  end
end

# Apply quiet formatter in development
if Rails.env.development?
  Rails.application.config.log_formatter = QuietLogFormatter.new
end