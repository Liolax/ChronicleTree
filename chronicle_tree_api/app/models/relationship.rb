class Relationship < ApplicationRecord
  belongs_to :person
  belongs_to :friend, class_name: 'Person', foreign_key: 'friend_id'
end
