# frozen_string_literal: true

class ShareImage < ApplicationRecord
  belongs_to :person
  
  validates :image_type, inclusion: { in: %w[profile tree] }
  validates :file_path, presence: true
  validates :expires_at, presence: true
  
  scope :expired, -> { where('expires_at < ?', Time.current) }
  scope :by_type, ->(type) { where(image_type: type) }
  scope :recent, -> { where('created_at > ?', 1.week.ago) }
  
  after_destroy :cleanup_file
  
  def expired?
    expires_at < Time.current
  end
  
  def file_exists?
    File.exist?(full_file_path)
  end
  
  def full_file_path
    Rails.root.join('public', 'generated_shares', File.basename(file_path))
  end
  
  def url
    return nil unless file_exists?
    
    filename = File.basename(file_path)
    "/generated_shares/#{filename}"
  end
  
  def self.cleanup_expired
    expired.find_each(&:destroy)
  end
  
  private
  
  def cleanup_file
    File.delete(full_file_path) if file_exists?
  rescue => e
    Rails.logger.warn "Failed to delete share image file: #{e.message}"
  end
end