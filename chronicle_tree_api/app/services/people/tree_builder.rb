# app/services/people/tree_builder.rb
module People
  class TreeBuilder
    def initialize(person)
      @center = person
    end

    # returns [nodes_array, edges_array]
    def as_json
      nodes = collect_tree_nodes
      edges = collect_tree_edges(nodes)
      [ nodes, edges ]
    end

    private

    # Recursively collect all ancestors, descendants, spouses, and siblings
    def collect_tree_nodes
      seen = {}
      queue = [@center]
      while queue.any?
        person = queue.shift
        next if seen[person.id]
        seen[person.id] = person
        # Add parents, spouses, and children recursively
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
        # Parent-child edges
        if n.respond_to?(:parents)
          n.parents.each do |parent|
            edges << { from: parent.id, to: n.id, type: 'parent' } if node_ids.include?(parent.id)
          end
        end
        if n.respond_to?(:children)
          n.children.each do |child|
            edges << { from: n.id, to: child.id, type: 'parent' } if node_ids.include?(child.id)
          end
        end
        # Spouse edges
        if n.respond_to?(:spouses)
          n.spouses.each do |spouse|
            # Only add one edge per pair
            if n.id < spouse.id && node_ids.include?(spouse.id)
              edges << { from: n.id, to: spouse.id, type: 'spouse' }
            end
          end
        end
        # Sibling edges (optional, for visualization)
        if n.respond_to?(:siblings)
          n.siblings.each do |sib|
            if n.id < sib.id && node_ids.include?(sib.id)
              edges << { from: n.id, to: sib.id, type: 'sibling' }
            end
          end
        end
      end
      edges.uniq
    end
  end
end
