class Share < ApplicationRecord
  belongs_to :user
  belongs_to :shareable, polymorphic: true, optional: true
  
  validates :content_type, presence: true, inclusion: { in: %w[tree profile] }
  validates :platform, presence: true, inclusion: { in: %w[facebook twitter whatsapp email copy] }
  validates :share_token, presence: true, uniqueness: true
  
  before_validation :generate_share_token, on: :create
  
  scope :recent, -> { order(created_at: :desc) }
  scope :by_platform, ->(platform) { where(platform: platform) }
  scope :by_content_type, ->(content_type) { where(content_type: content_type) }
  
  private
  
  def generate_share_token
    self.share_token = SecureRandom.urlsafe_base64(32) if share_token.blank?
  end
end