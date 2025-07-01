class Profile < ApplicationRecord
  belongs_to :person
  has_one_attached :avatar
end
