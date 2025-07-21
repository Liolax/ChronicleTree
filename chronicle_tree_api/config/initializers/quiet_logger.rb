# Quiet logger that filters out unwanted messages
class QuietLogger < Logger
  def add(severity, message = nil, progname = nil)
    # Convert message to string for checking
    msg_str = message.to_s
    
    # Filter out unwanted messages
    filtered_messages = [
      'log shifting failed',
      'closed stream',
      'log rotation',
      'VIPS-WARNING',
      'unable to load',
      'vips-heif.dll',
      'vips-jxl.dll', 
      'vips-magick.dll',
      'The specified module could not be found'
    ]
    
    # Skip the message if it contains any filtered terms
    return true if filtered_messages.any? { |filter| msg_str.include?(filter) }
    
    super
  end
end

# Apply quiet logger in development
if Rails.env.development?
  Rails.application.configure do
    # Replace the default logger
    config.logger = QuietLogger.new(STDOUT)
    config.logger.level = Logger::INFO
  end
end