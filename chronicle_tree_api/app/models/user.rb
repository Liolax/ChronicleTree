class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable,
         jwt_revocation_strategy: JwtDenylist

  has_many :people, dependent: :destroy
  has_many :shares, dependent: :destroy

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true

end
