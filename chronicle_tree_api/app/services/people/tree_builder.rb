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
      # include ancestors, siblings, spouses, children, self
      ([@center] + @center.parents + @center.siblings + @center.spouses + @center.children).uniq
    end

    def collect_edges(nodes)
      edges = []
      nodes.each do |n|
        n.parents.each { |p| edges << { from: p.id, to: n.id, type: 'child' } }
        n.spouses.each { |s| edges << { from: n.id, to: s.id, type: 'spouse' } if n.id < s.id }
      end
      edges.uniq
    end
  end
end
