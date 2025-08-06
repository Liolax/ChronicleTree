# VIPS configuration for Windows compatibility
# VIPS warnings about missing optional modules (heif, jxl, magick, etc.) 
# are harmless and occur because these format extensions aren't installed.
# Basic image processing with JPEG, PNG, WebP still works perfectly.

# Set environment variables to minimize VIPS verbosity
ENV['VIPS_WARNING'] = '0'
ENV['G_MESSAGES_DEBUG'] = ''
ENV['VIPS_CONCURRENCY'] = '1'

# Add a note to developers about these warnings
Rails.application.config.after_initialize do
  if Rails.env.development? && Gem.win_platform?
    Rails.logger.info "=" * 60
    Rails.logger.info "VIPS MODULE INFO:"
    Rails.logger.info "Optional VIPS modules (heif, jxl, magick, etc.) not found."
    Rails.logger.info "This is normal on Windows and doesn't affect functionality."
    Rails.logger.info "Basic image processing (PNG, JPEG, WebP) works normally."
    Rails.logger.info "=" * 60
  end
end