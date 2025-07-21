namespace :db do
  desc "Debug blood relationship detection issues"
  task debug_blood_detection: :environment do
    puts "🔍 Debugging blood relationship detection..."
    
    great = Person.find_by(first_name: "Great", last_name: "Grandparent")
    grand = Person.find_by(first_name: "Grand", last_name: "Parent")
    
    if great.nil? || grand.nil?
      puts "❌ Test people not found"
      exit
    end
    
    puts "\n👤 Great Grandparent (#{great.id}):"
    children_list = great.children.map { |c| "#{c.first_name} #{c.last_name} (#{c.id})" }
    puts "   Children: #{children_list}"
    
    puts "\n👤 Grand Parent (#{grand.id}):"
    parents_list = grand.parents.map { |p| "#{p.first_name} #{p.last_name} (#{p.id})" }
    puts "   Parents: #{parents_list}"
    
    puts "\n🔍 Direct relationship check:"
    puts "   Great.children.include?(Grand): #{great.children.include?(grand)}"
    puts "   Grand.parents.include?(Great): #{grand.parents.include?(great)}"
    
    puts "\n🧬 BloodRelationshipDetector tests:"
    detector = BloodRelationshipDetector.new(great, grand)
    puts "   blood_related?: #{detector.blood_related?}"
    puts "   direct_parent_child?: #{detector.send(:direct_parent_child?)}"
    puts "   siblings?: #{detector.send(:siblings?)}"
    puts "   ancestor_descendant?: #{detector.send(:ancestor_descendant?)}"
    
    puts "\n📊 Relationship records:"
    Relationship.where("person_id = ? OR relative_id = ?", great.id, great.id).each do |rel|
      puts "   #{rel.person.first_name} (#{rel.person_id}) -#{rel.relationship_type}-> #{rel.relative.first_name} (#{rel.relative_id})"
    end
    
    puts "\n🧪 Manual ancestor check:"
    puts "   is_ancestor_of?(Great, Grand): #{detector.send(:is_ancestor_of?, great, grand)}"
    puts "   is_ancestor_of?(Grand, Great): #{detector.send(:is_ancestor_of?, grand, great)}"
  end
end