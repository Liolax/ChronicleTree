class Medium < ApplicationRecord
  belongs_to :attachable, polymorphic: true
end
