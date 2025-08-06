class Medium < ApplicationRecord
  include PaperTrailCustom
  chronicle_versioned

  belongs_to :attachable, polymorphic: true
  has_one_attached :file
end
