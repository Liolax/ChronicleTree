class Note < ApplicationRecord
  belongs_to :person

  validates :content, presence: true
  validates :person_id, uniqueness: true
end
