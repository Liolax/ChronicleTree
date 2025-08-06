# Suppress VIPS warnings about missing DLL modules
# These warnings are common on Windows and don't affect functionality

# Set environment variables to suppress VIPS warnings
ENV['VIPS_WARNING'] = '0'
ENV['G_MESSAGES_DEBUG'] = ''
ENV['VIPS_CONCURRENCY'] = '1'

# On Windows, suppress VIPS GLib warnings through environment
if Gem.win_platform?
  ENV['G_MESSAGES_PREFIXED'] = 'VIPS-WARNING'  
  ENV['G_DEBUG'] = ''
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