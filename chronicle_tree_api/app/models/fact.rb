class Fact < ApplicationRecord
  include PaperTrailCustom
  chronicle_versioned

  belongs_to :person
end
