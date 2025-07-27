# frozen_string_literal: true

# Background job for cleaning up expired social media share images
# Removes database records and orphaned files to prevent storage bloat
class ShareImageCleanupJob < ApplicationJob
  queue_as :low
  
  def perform
    Rails.logger.info "Starting share image cleanup..."
    
    deleted_count = 0
    error_count = 0
    
    # Remove expired ShareImage database records based on timestamp
    ShareImage.expired.find_each do |share_image|
      begin
        share_image.destroy
        deleted_count += 1
        Rails.logger.debug "Deleted expired share image: #{share_image.file_path}"
      rescue => e
        error_count += 1
        Rails.logger.warn "Failed to delete share image #{share_image.id}: #{e.message}"
      end
    end
    
    # Remove orphaned image files not referenced in database
    orphaned_count = cleanup_orphaned_files
    
    result = {
      deleted_records: deleted_count,
      errors: error_count,
      orphaned_files_cleaned: orphaned_count
    }
    
    Rails.logger.info "Share image cleanup completed: #{result}"
    result
  end
  
  private
  
  def cleanup_orphaned_files
    shares_dir = Rails.root.join('public', 'generated_shares')
    return 0 unless Dir.exist?(shares_dir)
    
    # Create reference set of filenames currently in database
    database_files = ShareImage.pluck(:file_path).map { |path| File.basename(path) }.to_set
    deleted_count = 0
    
    Dir.glob(File.join(shares_dir, '*')).each do |file_path|
      filename = File.basename(file_path)
      
      # Skip system files and directories during cleanup scan
      next if filename.start_with?('.')
      next if File.directory?(file_path)
      
      # Preserve files still referenced in ShareImage records
      next if database_files.include?(filename)
      
      # Remove orphaned files older than one week to free storage space
      if File.mtime(file_path) < 1.week.ago
        begin
          File.delete(file_path)
          deleted_count += 1
          Rails.logger.debug "Deleted orphaned file: #{filename}"
        rescue => e
          Rails.logger.warn "Failed to delete orphaned file #{filename}: #{e.message}"
        end
      end
    end
    
    deleted_count
  rescue => e
    Rails.logger.error "Orphaned file cleanup failed: #{e.message}"
    0
  end
end