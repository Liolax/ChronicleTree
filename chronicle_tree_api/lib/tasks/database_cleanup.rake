namespace :db do
  namespace :cleanup do
    desc "Preview cross-generational sibling cleanup (shows what would be changed)"
    task preview_siblings: :environment do
      puts "🔍 ChronicleTree Database Cleanup - Preview Mode"
      puts "=" * 60
      puts
      
      begin
        DatabaseCleanupPreview.preview_cleanup
      rescue => e
        puts "❌ Error during preview: #{e.message}"
        puts e.backtrace.first(5)
      end
    end
    
    desc "Clean up invalid cross-generational sibling relationships"
    task fix_siblings: :environment do
      puts "🧹 ChronicleTree Database Cleanup - Execution Mode"
      puts "=" * 60
      puts
      
      print "⚠️  This will permanently remove invalid sibling relationships. Continue? (y/N): "
      confirmation = STDIN.gets.chomp.downcase
      
      unless confirmation == 'y' || confirmation == 'yes'
        puts "❌ Cleanup cancelled."
        exit
      end
      
      begin
        DatabaseCleanupService.clean_cross_generational_siblings
        puts
        puts "🎉 Database cleanup completed successfully!"
        puts "💡 Your relationship calculator should now work correctly."
      rescue => e
        puts "❌ Error during cleanup: #{e.message}"
        puts e.backtrace.first(5)
      end
    end
    
    desc "Comprehensive database relationship analysis"
    task analyze: :environment do
      puts "📊 ChronicleTree Database Analysis"
      puts "=" * 50
      puts
      
      # Count all relationships
      total_relationships = Relationship.count
      sibling_relationships = Relationship.where(relationship_type: 'Sibling').count
      parent_relationships = Relationship.where(relationship_type: 'Parent').count
      spouse_relationships = Relationship.where(relationship_type: 'Spouse').count
      
      puts "📈 Relationship Statistics:"
      puts "   Total Relationships: #{total_relationships}"
      puts "   Parent Relationships: #{parent_relationships}"
      puts "   Sibling Relationships: #{sibling_relationships}"
      puts "   Spouse Relationships: #{spouse_relationships}"
      puts
      
      # Find potential issues
      DatabaseCleanupPreview.preview_cleanup
    end
  end
end
