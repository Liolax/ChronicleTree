class Note < ApplicationRecord
  belongs_to :person

  validates :content, presence: true
  # Ensure only one note per person
  validates :person_id, uniqueness: true
end
