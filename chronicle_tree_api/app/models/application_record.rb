# ApplicationRecord is the base class for all Active Record models in ChronicleTree.
# It sets up shared behavior, validations, or scopes to be inherited by all models.
class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true
end