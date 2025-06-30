# app/services/people/tree_builder.rb
module People
  class TreeBuilder
    def initialize(person)
      @center = person
    end

    # returns [nodes_array, edges_array]
    def as_json
      nodes = collect_nodes
      edges = collect_edges(nodes)
      [nodes, edges]
    end

    private

    def collect_nodes
      # include ancestors, siblings, spouses, children, self, cousins, grandparents
      (
        [@center] +
        @center.parents +
        @center.siblings +
        @center.spouses +
        @center.children +
        (@center.parents.flat_map(&:siblings).flat_map(&:children) - [@center]) + # cousins
        @center.parents.flat_map(&:parents) # grandparents
      ).uniq
    end

    def collect_edges(nodes)
      edges = []
      node_ids = nodes.map(&:id)
      nodes.each do |n|
        # Parent edges
        n.parents.each do |p|
          edges << { from: p.id, to: n.id, type: 'parent' } if node_ids.include?(p.id)
        end
        # Spouse edges (undirected, only one per pair)
        n.spouses.each do |s|
          edges << { from: [n.id, s.id].min, to: [n.id, s.id].max, type: 'spouse' } if n.id < s.id && node_ids.include?(s.id)
        end
        # Sibling edges (undirected, only one per pair)
        n.siblings.each do |sib|
          edges << { from: [n.id, sib.id].min, to: [n.id, sib.id].max, type: 'sibling' } if n.id < sib.id && node_ids.include?(sib.id)
        end
        # Cousin edges (undirected, only one per pair)
        n.parents.each do |parent|
          parent.siblings.each do |aunt_uncle|
            aunt_uncle.children.each do |cousin|
              if node_ids.include?(cousin.id) && n.id < cousin.id
                edges << { from: n.id, to: cousin.id, type: 'cousin' }
              end
            end
          end
        end
        # Grandparent edges
        n.parents.each do |parent|
          parent.parents.each do |grandparent|
            edges << { from: grandparent.id, to: n.id, type: 'grandparent' } if node_ids.include?(grandparent.id)
          end
        end
      end
      edges.uniq
    end
  end
end
