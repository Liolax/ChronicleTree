namespace :db do
  desc "Debug family relationships for Robert and Alice"
  task debug_relationships: :environment do
    puts "🔍 Debugging Robert Doe and Alice Doe relationships..."
    
    # Find Robert and Alice
    robert = Person.find_by(first_name: 'Robert', last_name: 'Doe')
    alice = Person.find_by(first_name: 'Alice', last_name: 'Doe')
    john = Person.find_by(first_name: 'John', last_name: 'Doe')
    
    if robert.nil?
      puts "❌ Robert Doe not found"
      exit
    end
    
    if alice.nil?
      puts "❌ Alice Doe not found"
      exit
    end
    
    puts "\n👤 Robert Doe (ID: #{robert.id}):"
    puts "   Children: #{robert.children.map { |c| "#{c.first_name} #{c.last_name} (#{c.id})" }}"
    puts "   Parents: #{robert.parents.map { |p| "#{p.first_name} #{p.last_name} (#{p.id})" }}"
    puts "   Spouses: #{robert.spouses.map { |s| "#{s.first_name} #{s.last_name} (#{s.id})" }}"
    
    puts "\n👤 Alice Doe (ID: #{alice.id}):"
    puts "   Children: #{alice.children.map { |c| "#{c.first_name} #{c.last_name} (#{c.id})" }}"
    puts "   Parents: #{alice.parents.map { |p| "#{p.first_name} #{p.last_name} (#{p.id})" }}"
    puts "   Spouses: #{alice.spouses.map { |s| "#{s.first_name} #{s.last_name} (#{s.id})" }}"
    
    if john
      puts "\n👤 John Doe (ID: #{john.id}):"
      puts "   Children: #{john.children.map { |c| "#{c.first_name} #{c.last_name} (#{c.id})" }}"
      puts "   Parents: #{john.parents.map { |p| "#{p.first_name} #{p.last_name} (#{p.id})" }}"
      puts "   Spouses: #{john.spouses.map { |s| "#{s.first_name} #{s.last_name} (#{s.id})" }}"
    end
    
    puts "\n🔍 Checking blood relationship between Robert and Alice:"
    detector = BloodRelationshipDetector.new(robert, alice)
    is_blood_related = detector.blood_related?
    relationship_desc = detector.relationship_description
    
    puts "   Blood related: #{is_blood_related}"
    puts "   Relationship: #{relationship_desc}" if relationship_desc
    
    puts "\n📊 All relationships involving Robert:"
    Relationship.where("person_id = ? OR relative_id = ?", robert.id, robert.id).each do |rel|
      person = rel.person
      relative = rel.relative
      puts "   #{person.first_name} #{person.last_name} (#{person.id}) -> #{rel.relationship_type} -> #{relative.first_name} #{relative.last_name} (#{relative.id})"
    end
    
    puts "\n📊 All relationships involving Alice:"
    Relationship.where("person_id = ? OR relative_id = ?", alice.id, alice.id).each do |rel|
      person = rel.person
      relative = rel.relative
      puts "   #{person.first_name} #{person.last_name} (#{person.id}) -> #{rel.relationship_type} -> #{relative.first_name} #{relative.last_name} (#{relative.id})"
    end
    
    if john
      puts "\n📊 All relationships involving John:"
      Relationship.where("person_id = ? OR relative_id = ?", john.id, john.id).each do |rel|
        person = rel.person
        relative = rel.relative
        puts "   #{person.first_name} #{person.last_name} (#{person.id}) -> #{rel.relationship_type} -> #{relative.first_name} #{relative.last_name} (#{relative.id})"
      end
    end
  end
end