namespace :db do
  desc "Fix invalid blood relative relationships"
  task fix_invalid_relationships: :environment do
    puts "🔍 Checking for invalid blood relative relationships..."
    
    invalid_relationships = []
    
    # Check all spouse relationships
    Relationship.where(relationship_type: 'spouse').find_each do |relationship|
      person = relationship.person
      relative = relationship.relative
      
      if BloodRelationshipDetector.blood_related?(person, relative)
        detector = BloodRelationshipDetector.new(person, relative)
        relationship_desc = detector.relationship_description
        
        invalid_relationships << {
          type: 'spouse',
          relationship: relationship,
          person: person,
          relative: relative,
          description: relationship_desc
        }
      end
    end
    
    # Check all child relationships for blood relative parents
    Relationship.where(relationship_type: 'child').find_each do |relationship|
      parent = relationship.person
      child = relationship.relative
      
      # Get all other parents of this child
      other_parents = child.parents.where.not(id: parent.id)
      
      other_parents.each do |other_parent|
        if BloodRelationshipDetector.blood_related?(parent, other_parent)
          detector = BloodRelationshipDetector.new(parent, other_parent)
          relationship_desc = detector.relationship_description
          
          invalid_relationships << {
            type: 'shared_child',
            relationship: relationship,
            person: parent,
            relative: other_parent,
            child: child,
            description: relationship_desc
          }
        end
      end
    end
    
    if invalid_relationships.empty?
      puts "✅ No invalid blood relative relationships found!"
      next
    end
    
    puts "❌ Found #{invalid_relationships.count} invalid relationships:"
    puts
    
    invalid_relationships.each_with_index do |invalid, index|
      puts "#{index + 1}. #{invalid[:type].upcase} RELATIONSHIP:"
      if invalid[:type] == 'spouse'
        puts "   #{invalid[:person].first_name} #{invalid[:person].last_name} married to #{invalid[:relative].first_name} #{invalid[:relative].last_name}"
        puts "   Issue: #{invalid[:description]}"
      elsif invalid[:type] == 'shared_child'
        puts "   #{invalid[:person].first_name} #{invalid[:person].last_name} and #{invalid[:relative].first_name} #{invalid[:relative].last_name} have shared child #{invalid[:child].first_name} #{invalid[:child].last_name}"
        puts "   Issue: #{invalid[:description]}"
      end
      puts
    end
    
    print "Do you want to remove these invalid relationships? (y/N): "
    response = STDIN.gets.chomp.downcase
    
    if response == 'y' || response == 'yes'
      puts "🔧 Removing invalid relationships..."
      
      removed_count = 0
      invalid_relationships.each do |invalid|
        if invalid[:type] == 'spouse'
          # Remove both directions of spouse relationship
          Relationship.where(
            person: invalid[:person],
            relative: invalid[:relative],
            relationship_type: 'spouse'
          ).destroy_all
          
          Relationship.where(
            person: invalid[:relative],
            relative: invalid[:person],
            relationship_type: 'spouse'
          ).destroy_all
          
          puts "   ❌ Removed marriage between #{invalid[:person].first_name} #{invalid[:person].last_name} and #{invalid[:relative].first_name} #{invalid[:relative].last_name}"
          removed_count += 1
        end
      end
      
      puts "✅ Removed #{removed_count} invalid relationships!"
    else
      puts "⚠️  Invalid relationships were not removed. They will cause validation errors in the future."
    end
  end
end