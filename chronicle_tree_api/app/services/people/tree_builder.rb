# app/services/people/tree_builder.rb
module People
  class TreeBuilder
    def initialize(person)
      @center = person
    end

    def as_json
      nodes = collect_tree_nodes
      edges = collect_tree_edges(nodes)
      [ nodes, edges ]
    end

    private

    def collect_tree_nodes
      seen = {}
      queue = [@center]
      while queue.any?
        person = queue.shift
        next if seen[person.id]
        seen[person.id] = person
        if person.respond_to?(:parents)
          queue.concat(person.parents.reject { |p| seen[p.id] })
        end
        if person.respond_to?(:children)
          queue.concat(person.children.reject { |c| seen[c.id] })
        end
        if person.respond_to?(:spouses)
          queue.concat(person.spouses.reject { |s| seen[s.id] })
        end
        if person.respond_to?(:siblings)
          queue.concat(person.siblings.reject { |sib| seen[sib.id] })
        end
      end
      seen.values
    end

    def collect_tree_edges(nodes)
      edges = []
      node_ids = nodes.map(&:id)
      nodes.each do |n|
        if n.respond_to?(:parents)
          n.parents.each do |parent|
            edges << { source: parent.id, target: n.id, relationship_type: 'parent' } if node_ids.include?(parent.id)
          end
        end
        if n.respond_to?(:children)
          n.children.each do |child|
            edges << { source: n.id, target: child.id, relationship_type: 'parent' } if node_ids.include?(child.id)
          end
        end
        if n.respond_to?(:spouses)
          n.spouses.each do |spouse|
            if n.id < spouse.id && node_ids.include?(spouse.id)
              relationship = n.relationships.find { |r| r.relative_id == spouse.id && r.relationship_type == 'spouse' }
              edge = { source: n.id, target: spouse.id, relationship_type: 'spouse' }
              if relationship
                edge[:is_ex] = relationship.is_ex
                edge[:is_deceased] = relationship.is_deceased
              end
              edges << edge
            end
          end
        end
        if n.respond_to?(:siblings)
          n.siblings.each do |sib|
            if n.id < sib.id && node_ids.include?(sib.id)
              edges << { source: n.id, target: sib.id, relationship_type: 'sibling' }
            end
          end
        end
      end
      edges.uniq
    end
  end
end
