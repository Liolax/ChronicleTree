# == Schema Information
#
# Table name: users
#
#  id                     :bigint           not null, primary key
#  name                   :string
#  email                  :string           not null, unique
#  encrypted_password     :string           not null
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#
# == Description
# The User model handles authentication and is the root owner of all genealogical data within ChronicleTree.
class User < ApplicationRecord
  # Devise modules for robust authentication and secure password management
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable,
         jwt_revocation_strategy: JwtDenylist

  # Associations
  has_many :people, dependent: :destroy
  has_many :shares, dependent: :destroy

  # Validations
  validates :email, presence: true, uniqueness: true
  validates :name, presence: true

  # Additional security hardening or custom logic can be placed here
end
