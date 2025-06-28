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
      [@center] + @center.parents + @center.siblings + @center.spouses + @center.children
    end

    def collect_edges(nodes)
      edges = []
      nodes.each do |n|
        n.parents.each { |pid| edges << { from: pid.id, to: n.id, type: 'child' } }
        n.spouses.each { |sid| edges << { from: n.id, to: sid.id, type: 'spouse' } }
      end
      edges
    end
  end
end
