class Medium < ApplicationRecord
  belongs_to :attachable, polymorphic: true
  has_one_attached :file
end
