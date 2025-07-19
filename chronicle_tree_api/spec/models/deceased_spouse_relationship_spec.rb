require 'rails_helper'

RSpec.describe Relationship, type: :model do
  describe 'Deceased Spouse Functionality' do
    let(:john) { create(:person, first_name: 'John', last_name: 'Doe', gender: 'Male') }
    let(:jane) { create(:person, first_name: 'Jane', last_name: 'Doe', gender: 'Female') }
    let(:mary) { create(:person, first_name: 'Mary', last_name: 'Smith', gender: 'Female') }

    describe 'deceased spouse relationships' do
      it 'allows creating deceased spouse relationships' do
        relationship = Relationship.create!(
          person: john,
          relative: jane,
          relationship_type: 'spouse',
          is_deceased: true
        )
        
        expect(relationship).to be_valid
        expect(relationship.is_deceased).to be true
        expect(relationship.is_ex).to be false
      end

      it 'syncs deceased status to reciprocal relationship' do
        # Create initial relationship
        Relationship.create!(
          person: john,
          relative: jane,
          relationship_type: 'spouse'
        )
        
        # Create reciprocal relationship
        jane_to_john = Relationship.create!(
          person: jane,
          relative: john,
          relationship_type: 'spouse'
        )
        
        # Update one to deceased
        john_to_jane = Relationship.find_by(person: john, relative: jane)
        john_to_jane.update!(is_deceased: true)
        
        # Check reciprocal is updated
        jane_to_john.reload
        expect(jane_to_john.is_deceased).to be true
      end

      it 'allows new spouse after deceased spouse' do
        # Create deceased spouse relationship
        Relationship.create!(
          person: john,
          relative: jane,
          relationship_type: 'spouse',
          is_deceased: true
        )
        
        # Should allow new current spouse
        new_relationship = Relationship.new(
          person: john,
          relative: mary,
          relationship_type: 'spouse'
        )
        
        expect(new_relationship).to be_valid
      end

      it 'prevents spouse from being both ex and deceased' do
        relationship = Relationship.new(
          person: john,
          relative: jane,
          relationship_type: 'spouse',
          is_ex: true,
          is_deceased: true
        )
        
        expect(relationship).not_to be_valid
        expect(relationship.errors[:base]).to include('A spouse cannot be both ex-spouse and deceased spouse.')
      end
    end

    describe 'scopes' do
      before do
        # Current spouse
        Relationship.create!(person: john, relative: mary, relationship_type: 'spouse')
        
        # Deceased spouse
        Relationship.create!(person: john, relative: jane, relationship_type: 'spouse', is_deceased: true)
        
        # Ex-spouse (for completeness)
        sarah = create(:person, first_name: 'Sarah', gender: 'Female')
        Relationship.create!(person: john, relative: sarah, relationship_type: 'spouse', is_ex: true)
      end

      it 'current_spouses scope returns only current spouses' do
        current_spouses = Relationship.current_spouses.where(person: john)
        expect(current_spouses.count).to eq(1)
        expect(current_spouses.first.relative).to eq(mary)
      end

      it 'deceased_spouses scope returns only deceased spouses' do
        deceased_spouses = Relationship.deceased_spouses.where(person: john)
        expect(deceased_spouses.count).to eq(1)
        expect(deceased_spouses.first.relative).to eq(jane)
      end

      it 'ex_spouses scope returns only ex-spouses' do
        ex_spouses = Relationship.ex_spouses.where(person: john)
        expect(ex_spouses.count).to eq(1)
        expect(ex_spouses.first.relative.first_name).to eq('Sarah')
      end
    end

    describe 'validation logic' do
      it 'allows multiple deceased spouses' do
        lisa = create(:person, first_name: 'Lisa', gender: 'Female')
        
        # Create two deceased spouses
        Relationship.create!(person: john, relative: jane, relationship_type: 'spouse', is_deceased: true)
        relationship2 = Relationship.new(person: john, relative: lisa, relationship_type: 'spouse', is_deceased: true)
        
        expect(relationship2).to be_valid
      end

      it 'prevents multiple current spouses' do
        # Create first current spouse
        Relationship.create!(person: john, relative: jane, relationship_type: 'spouse')
        
        # Try to create second current spouse
        relationship2 = Relationship.new(person: john, relative: mary, relationship_type: 'spouse')
        
        expect(relationship2).not_to be_valid
        expect(relationship2.errors[:base]).to include('A person can only have one current spouse at a time.')
      end

      it 'allows current spouse alongside deceased spouses' do
        # Create deceased spouse
        Relationship.create!(person: john, relative: jane, relationship_type: 'spouse', is_deceased: true)
        
        # Create current spouse
        relationship2 = Relationship.new(person: john, relative: mary, relationship_type: 'spouse')
        
        expect(relationship2).to be_valid
      end
    end
  end
end
