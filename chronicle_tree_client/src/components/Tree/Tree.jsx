import React, { useEffect, useCallback, useRef, useState, forwardRef } from "react";
import ReactDOM from "react-dom";
import ReactFlow, {
  useReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "reactflow";
import * as d3 from "d3-hierarchy";
import "reactflow/dist/style.css";
import CustomNode from "./CustomNode";
import ParentEdge from "./edges/ParentEdge";
import ChildEdge from "./edges/ChildEdge";
import { SmoothStepEdge, StraightEdge, BezierEdge } from "reactflow";
import { useTreeState } from "../../context/TreeStateContext";
import { useFullTree, usePeople } from "../../services/people";
import Button from "../UI/Button";
import AddPersonModal from "./modals/AddPersonModal";
import EditPersonModal from "./modals/EditPersonModal";
import ConfirmDeleteModal from "./modals/ConfirmDeleteModal";
import PersonCard from "./PersonCard";
import DeletePersonModal from '../UI/DeletePersonModal';
import './tree-animations.css';

const nodeWidth = 172;
const nodeHeight = 60;

// Map your relationship types to edge components
const edgeTypes = {
  parent: ParentEdge,
  child: ChildEdge, // Now using the new ChildEdge
  spouse: SmoothStepEdge,
  sibling: StraightEdge,
  cousin: BezierEdge,
  grandparent: StraightEdge,
  default: StraightEdge,
};

const nodeTypes = {
  person: CustomNode,
};

// D3-based family tree layout
function getD3LayoutedElements(nodes, edges, direction = "TB") {
  // Build a map of nodes by id
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  // Only use parent/child edges for tree structure
  const parentChildEdges = edges.filter(e => e.type === "parent" || e.type === "child");
  // DEBUG: Print all node ids and first names
  console.log('All node ids and first names:', nodes.map(n => ({ id: n.id, name: n.data && n.data.person && n.data.person.first_name })));
  // DEBUG: Print parent/child edges for Bob and Charlie
  const bobNode = nodes.find(n => n.data && n.data.person && n.data.person.first_name === 'Bob');
  const charlieNode = nodes.find(n => n.data && n.data.person && n.data.person.first_name === 'Charlie');
  if (bobNode && charlieNode) {
    const bobToCharlieEdges = parentChildEdges.filter(e => e.source === bobNode.id && e.target === charlieNode.id);
    console.log('Bob to Charlie parent/child edges:', bobToCharlieEdges);
  }
  // Build a map of children for each node
  const childrenMap = {};
  parentChildEdges.forEach((e) => {
    const parentId = e.source;
    const childId = e.target;
    if (!childrenMap[parentId]) childrenMap[parentId] = [];
    childrenMap[parentId].push(childId);
  });
  // Find root nodes (no incoming parent/child edge)
  const childIds = new Set(parentChildEdges.map((e) => e.target));
  let rootNodes = nodes.filter((n) => !childIds.has(n.id));
  console.log("All edges:", edges);
  console.log("Parent/child edges:", parentChildEdges);
  console.log("Root nodes for D3 layout:", rootNodes.map(n => n.id));
  // If no root, pick the oldest person as root
  if (!rootNodes.length && nodes.length) {
    // Try to find the node with the earliest date_of_birth
    const nodesWithDOB = nodes.filter(
      (n) => n.data && n.data.person && n.data.person.date_of_birth
    );
    if (nodesWithDOB.length) {
      nodesWithDOB.sort(
        (a, b) =>
          new Date(a.data.person.date_of_birth) -
          new Date(b.data.person.date_of_birth)
      );
      rootNodes = [nodesWithDOB[0]];
      console.log("No roots found, using oldest person as root:", rootNodes);
    } else {
      // Fallback: use the first node
      rootNodes = [nodes[0]];
      console.log("No roots or DOBs, using first node as root:", rootNodes);
    }
  }
  if (!rootNodes.length) {
    return { nodes, edges };
  }
  // Build a hierarchy for each root
  const d3Trees = rootNodes.map((root) => {
    function buildD3Node(nodeId, visited = new Set()) {
      if (visited.has(nodeId)) return null; // Prevent cycles
      visited.add(nodeId);
      const node = nodeMap.get(nodeId);
      return {
        ...node,
        children: (childrenMap[nodeId] || [])
          .map((childId) => buildD3Node(childId, new Set(visited)))
          .filter(Boolean),
      };
    }
    return d3.hierarchy(buildD3Node(root.id));
  });
  // Use d3.tree() to layout each tree
  // Increase node separation to prevent overlap
  // Increase vertical gap between parent/child nodes
  const treeLayout = d3.tree().nodeSize([nodeWidth * 2.5, nodeHeight * 4]);
  let layoutedNodes = [];
  d3Trees.forEach((tree) => {
    treeLayout(tree);
    tree.each((d) => {
      layoutedNodes.push({
        ...d.data,
        position: {
          x: d.x,
          y: d.y,
        },
        targetPosition: "top",
        sourcePosition: "bottom",
      });
    });
  });
  // Optionally, adjust for multiple roots (shift horizontally)
  if (d3Trees.length > 1) {
    let offset = 0;
    d3Trees.forEach((tree, i) => {
      const minX = Math.min(...Array.from(tree.descendants(), (d) => d.x));
      const maxX = Math.max(...Array.from(tree.descendants(), (d) => d.x));
      const width = maxX - minX + nodeWidth;
      tree.each((d) => {
        const node = layoutedNodes.find((n) => n.id === d.data.id);
        if (node) node.position.x += offset;
      });
      offset += width + 800; // force a large fixed gap between root trees
    });
  }
  // Ensure all nodes are shown: add any not in layoutedNodes in a grid below
  const layoutedIds = new Set(layoutedNodes.map((n) => n.id));
  let missingIndex = 0;
  nodes.forEach((n, i) => {
    if (!layoutedIds.has(n.id)) {
      layoutedNodes.push({
        ...n,
        position: {
          x: (missingIndex % 8) * (nodeWidth * 2),
          y: Math.floor(missingIndex / 8 + 5) * (nodeHeight * 2),
        },
        targetPosition: "top",
        sourcePosition: "bottom",
      });
      missingIndex++;
    }
  });
  // Return nodes in original order (for ReactFlow)
  layoutedNodes = nodes.map(
    (n) => layoutedNodes.find((ln) => ln.id === n.id) || n
  );
  return { nodes: layoutedNodes, edges };
}

// Helper to detect mobile screen
function isMobile() {
  if (typeof window !== 'undefined') {
    return window.innerWidth <= 640; // Tailwind's sm breakpoint
  }
  return false;
}

const Tree = ({ headerHeight = 72, headerHorizontalPadding = 24, modalMaxWidth }) => {
  const { selectedPerson, openPersonCard, closePersonCard } = useTreeState();
  const { data, isLoading, isError } = useFullTree();
  const { openAddPersonModal, closeAddPersonModal, isAddPersonModalOpen } =
    useTreeState();
  const { data: people = [] } = usePeople();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [editPerson, setEditPerson] = useState(null);
  const [deletePerson, setDeletePerson] = useState(null);
  const [interactivity, setInteractivity] = useState(false);
  const [transform, setTransform] = useState({ x: 0, y: 0, zoom: 1 });
  const [layoutDirection, setLayoutDirection] = useState('TB');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const reactFlowWrapper = useRef(null);
  const { fitView } = useReactFlow();

  // Handler to open edit modal
  const handleEditPerson = useCallback((person) => {
    setEditPerson(person);
  }, []);

  // Handler to close edit modal
  const handleCloseEditModal = useCallback(() => {
    setEditPerson(null);
  }, []);

  // Handler to open delete modal
  const handleDeletePerson = useCallback((person) => {
    setDeleteTarget(person);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    await deletePerson(deleteTarget.id);
    setIsDeleting(false);
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  // Listen for pan/zoom changes
  const handleMove = useCallback(
    (event, flowTransform) => {
      setTransform({
        x: flowTransform.x,
        y: flowTransform.y,
        zoom: flowTransform.zoom,
      });
    },
    []
  );

  // Update layout direction on window resize
  useEffect(() => {
    // Always use vertical (top-to-bottom) layout
    setLayoutDirection('TB');
  }, []);

  // Layout and fit view on mount or when nodes/edges change
  useEffect(() => {
    if (data && typeof data === "object" && Array.isArray(data.nodes) && Array.isArray(data.edges)) {
      console.log("Fetched nodes:", data.nodes);
      console.log("Fetched edges:", data.edges);
      // API returns { nodes: [...], edges: [...] }
      const apiNodes = data.nodes;
      const apiEdges = data.edges;
      // Convert backend format to React Flow format
      // Check for duplicate node IDs
      const nodeIdCounts = {};
      apiNodes.forEach(n => {
        const id = String(n.id);
        nodeIdCounts[id] = (nodeIdCounts[id] || 0) + 1;
      });
      const duplicateNodeIds = Object.entries(nodeIdCounts).filter(([id, count]) => count > 1);
      // Remove duplicate edge check and warning, since edge IDs are now unique
      // const edgeIdCounts = {};
      // apiEdges.forEach(e => {
      //   const id = `${e.type}-${e.from}-${e.to}`;
      //   edgeIdCounts[id] = (edgeIdCounts[id] || 0) + 1;
      // });
      // const duplicateEdgeIds = Object.entries(edgeIdCounts).filter(([id, count]) => count > 1);
      // if (duplicateEdgeIds.length) {
      //   console.warn('Duplicate edge IDs detected:', duplicateEdgeIds);
      // }
      const rfNodes = apiNodes.map((n) => ({
        id: String(n.id),
        type: "person",
        data: {
          person: n,
          onEdit: handleEditPerson,
          onDelete: handleDeletePerson,
          onPersonCardOpen: () => openPersonCard(n),
          onClick: () => openPersonCard(n),
        },
        position: { x: 0, y: 0 }, // will be set by layout
        className: 'tree-node-animate', // <-- add this
      }));
      const rfEdges = apiEdges.map((e, i) => ({
        id: `${e.type}-${e.from}-${e.to}-${i}`,
        source: String(e.from),
        target: String(e.to),
        type: e.type,
      }));
      // Use D3-based layout
      const { nodes: layoutedNodes, edges: layoutedEdges } = getD3LayoutedElements(rfNodes, rfEdges, layoutDirection);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setTimeout(() => fitView({ padding: 0.2, minZoom: 0.2, maxZoom: 1.5 }), 0);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [data, fitView, handleEditPerson, handleDeletePerson, layoutDirection]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        Loading tree...
      </div>
    );
  if (isError)
    return (
      <div className="flex items-center justify-center h-full text-red-600">
        Failed to load tree.
      </div>
    );
  if (!nodes.length)
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
        <div>No tree data available.</div>
        <Button onClick={openAddPersonModal} variant="primary">
          Add Person
        </Button>
      </div>
    );

  // Helper to render PersonCard as a fixed overlay above the canvas
  const renderPersonCardOverlay = (selectedPerson, nodes) => {
    if (!selectedPerson || !reactFlowWrapper.current) return null;
    const node = nodes.find(
      (n) => n.data && n.data.person && n.data.person.id === selectedPerson.id
    );
    const position = node ? node.position : undefined;
    const wrapperRect = reactFlowWrapper.current.getBoundingClientRect();
    let left = 0,
      top = 0;
    if (position) {
      // Use tracked transform state instead of DOM query
      const { x: translateX, y: translateY, zoom: scale } = transform;
      // Respect header height (72px) and header horizontal padding (24px each side)
      const headerHeight = 72;
      const headerPadding = 24;
      left = Math.max(
        wrapperRect.left + window.scrollX + translateX + position.x * scale + 80,
        headerPadding
      );
      top = wrapperRect.top + window.scrollY + translateY + position.y * scale + headerHeight;
      return ReactDOM.createPortal(
        <PersonCard
          person={selectedPerson}
          onClose={closePersonCard}
          onEdit={(person) => {
            closePersonCard();
            handleEditPerson(person);
          }}
          onDelete={(person) => {
            closePersonCard();
            handleDeletePerson(person);
          }}
          position={{ x: left, y: top }}
          fixed
          style={{
            maxWidth: 'calc(100vw - 48px)',
            width: '100%',
            maxHeight: 'calc(100vh - 72px)',
            overflowY: 'auto',
            boxSizing: 'border-box',
            left,
            top,
            position: 'fixed',
            transition: 'left 0.4s cubic-bezier(0.4,0,0.2,1), top 0.4s cubic-bezier(0.4,0,0.2,1)', // smooth move
          }}
          className="person-card-animate"
        />, 
        document.body
      );
    }
    return null;
  };

  // --- MiniMap viewport rectangle logic ---
  const MiniMapWithViewport = forwardRef(function MiniMapWithViewport({ nodes, transform, ...props }, ref) {
    const miniMapRef = ref || useRef(null);
    const [dragging, setDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    const { setViewport } = useReactFlow();

    // Calculate bounds for the viewport rectangle
    // These calculations are approximate and may need tuning for your node/canvas scale
    const scale = transform.zoom;
    const offsetX = transform.x;
    const offsetY = transform.y;
    // MiniMap size (default 200x120, can be customized)
    const miniMapWidth = 200;
    const miniMapHeight = 120;
    // Find bounds of all nodes
    const nodeXs = nodes.map(n => n.position.x);
    const nodeYs = nodes.map(n => n.position.y);
    const minX = Math.min(...nodeXs);
    const minY = Math.min(...nodeYs);
    const maxX = Math.max(...nodeXs);
    const maxY = Math.max(...nodeYs);
    const nodesWidth = maxX - minX + 172; // nodeWidth
    const nodesHeight = maxY - minY + 60; // nodeHeight
    // Main canvas visible area in node space
    const viewW = window.innerWidth / scale;
    const viewH = window.innerHeight / scale;
    // Rectangle position in minimap
    // Remove rectScale and use true proportional mapping for MiniMap rectangle size and position for maximum accuracy
    // Rectangle size: proportion of visible area to total node area
    let rectW = (nodesWidth > 0) ? Math.min(miniMapWidth, Math.max(24, (viewW / nodesWidth) * miniMapWidth)) : miniMapWidth;
    let rectH = (nodesHeight > 0) ? Math.min(miniMapHeight, Math.max(18, (viewH / nodesHeight) * miniMapHeight)) : miniMapHeight;
    // If the visible area is larger than the node area, fill the minimap
    if (viewW >= nodesWidth) rectW = miniMapWidth;
    if (viewH >= nodesHeight) rectH = miniMapHeight;
    // Rectangle position: where the visible area starts in the minimap
    let unclampedRectX = (nodesWidth > 0) ? ((-offsetX - minX) / nodesWidth) * miniMapWidth : 0;
    let unclampedRectY = (nodesHeight > 0) ? ((-offsetY - minY) / nodesHeight) * miniMapHeight : 0;
    // Clamp position so rectangle always stays inside minimap
    const rectX = Math.max(0, Math.min(unclampedRectX, miniMapWidth - rectW));
    const rectY = Math.max(0, Math.min(unclampedRectY, miniMapHeight - rectH));

    // Drag logic
    const onRectMouseDown = (e) => {
      e.stopPropagation();
      const miniMapRect = miniMapRef.current?.getBoundingClientRect();
      const offsetXInRect = e.clientX - (miniMapRect?.left ?? 0) - rectX;
      const offsetYInRect = e.clientY - (miniMapRect?.top ?? 0) - rectY;
      setDragging(true);
      setDragStart({
        offsetXInRect,
        offsetYInRect,
      });
    };
    // Touch support
    const onRectTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      e.stopPropagation();
      e.preventDefault();
      const touch = e.touches[0];
      const miniMapRect = miniMapRef.current?.getBoundingClientRect();
      const offsetXInRect = touch.clientX - (miniMapRect?.left ?? 0) - rectX;
      const offsetYInRect = touch.clientY - (miniMapRect?.top ?? 0) - rectY;
      setDragging(true);
      setDragStart({
        offsetXInRect,
        offsetYInRect,
      });
    };
    useEffect(() => {
      if (!dragging) return;
      let animationFrame;
      const onMouseMove = (e) => {
        animationFrame = requestAnimationFrame(() => {
          const miniMapRect = miniMapRef.current?.getBoundingClientRect();
          const mouseX = e.clientX - (miniMapRect?.left ?? 0);
          const mouseY = e.clientY - (miniMapRect?.top ?? 0);
          let newRectX = mouseX - dragStart.offsetXInRect;
          let newRectY = mouseY - dragStart.offsetYInRect;
          newRectX = Math.max(0, Math.min(newRectX, miniMapWidth - rectW));
          newRectY = Math.max(0, Math.min(newRectY, miniMapHeight - rectH));
          const newOffsetX = -minX - (newRectX / miniMapWidth) * nodesWidth;
          const newOffsetY = -minY - (newRectY / miniMapHeight) * nodesHeight;
          setViewport({ x: newOffsetX, y: newOffsetY, zoom: scale });
        });
      };
      const onTouchMove = (e) => {
        if (e.touches.length !== 1) return;
        e.preventDefault();
        const touch = e.touches[0];
        const miniMapRect = miniMapRef.current?.getBoundingClientRect();
        const mouseX = touch.clientX - (miniMapRect?.left ?? 0);
        const mouseY = touch.clientY - (miniMapRect?.top ?? 0);
        let newRectX = mouseX - dragStart.offsetXInRect;
        let newRectY = mouseY - dragStart.offsetYInRect;
        newRectX = Math.max(0, Math.min(newRectX, miniMapWidth - rectW));
        newRectY = Math.max(0, Math.min(newRectY, miniMapHeight - rectH));
        const newOffsetX = -minX - (newRectX / miniMapWidth) * nodesWidth;
        const newOffsetY = -minY - (newRectY / miniMapHeight) * nodesHeight;
        setViewport({ x: newOffsetX, y: newOffsetY, zoom: scale });
      };
      const onMouseUp = () => setDragging(false);
      const onTouchEnd = () => setDragging(false);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
        if (animationFrame) cancelAnimationFrame(animationFrame);
      };
    }, [dragging, dragStart, miniMapRef, nodesWidth, nodesHeight, rectH, rectW, scale, setViewport]);

    return (
      <div style={{ position: 'absolute', right: 16, bottom: 150, width: miniMapWidth, height: miniMapHeight, zIndex: 20 }} ref={miniMapRef}>
        <MiniMap
          nodeColor={() => "#4F868E"}
          style={{ background: "white", width: miniMapWidth, height: miniMapHeight }}
          {...props}
        />
        {/* Viewport rectangle only appears when zoomed in very close to nodes */}
        {scale > 1.3 && (
          <div
            style={{
              position: 'absolute',
              left: rectX,
              top: rectY,
              width: rectW,
              height: rectH,
              border: '2px solid #4F868E',
              background: 'rgba(79,134,142,0.08)',
              cursor: 'grab',
              zIndex: 30,
              transition: dragging ? 'none' : 'left 0.4s cubic-bezier(0.4,0,0.2,1), top 0.4s cubic-bezier(0.4,0,0.2,1), width 0.4s cubic-bezier(0.4,0,0.2,1), height 0.4s cubic-bezier(0.4,0,0.2,1)',
              willChange: 'left, top, width, height',
            }}
            onMouseDown={onRectMouseDown}
            onTouchStart={onRectTouchStart}
          />
        )}
      </div>
    );
  });

  // --- Render unconnected people as nodes in ReactFlow ---
  // Instead of custom cards, show all nodes (including unconnected) in ReactFlow
  // Remove the separate unconnected people cards near Add Person button

  // Helper to group relationships for modal
  const groupRelatives = (person) => {
    const groups = { Parents: [], Children: [], Spouses: [], Siblings: [] };
    if (person?.relatives) {
      person.relatives.forEach(rel => {
        if (rel.relationship_type === 'parent') groups.Parents.push(rel);
        if (rel.relationship_type === 'child') groups.Children.push(rel);
        if (rel.relationship_type === 'spouse') groups.Spouses.push(rel);
        if (rel.relationship_type === 'sibling') groups.Siblings.push(rel);
      });
    }
    return groups;
  };

  return (
    <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ height: "100vh", width: "100vw", position: "relative", overflow: "hidden" }}>
      {/* Add Person Button at the top center of the tree area */}
      <div className="w-full flex flex-col items-center" style={{ marginTop: 24, marginBottom: 8, zIndex: 10, position: 'relative', top: '0' }}>
        <div className="flex flex-row items-center gap-6">
          <button
            onClick={openAddPersonModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition ml-4"
            aria-label="Add Person"
            title="Add Person"
            type="button"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="hidden sm:inline">Add Person</span>
          </button>
        </div>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => setNodes((nds) => applyNodeChanges(changes, nds))}
        onEdgesChange={(changes) => setEdges((eds) => applyEdgeChanges(changes, eds))}
        onConnect={(params) => setEdges((eds) => addEdge(params, eds))}
        onMove={handleMove}
        fitView
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        attributionPosition="bottom-right"
        panOnScroll
        zoomOnScroll
        zoomOnPinch
        panOnDrag
        style={{ backgroundColor: "#F9FAFB" }}
        {...(interactivity ? {} : { nodesDraggable: false, nodesConnectable: false, edgesUpdatable: false })}
      >
        <Background color="#888" gap={16} />
        <Controls style={{ bottom: 180 }} />
        <MiniMapWithViewport nodes={nodes} transform={transform} nodeColor={() => "#4F868E"} />
      </ReactFlow>
      {renderPersonCardOverlay(selectedPerson, nodes)}
      {isAddPersonModalOpen && <AddPersonModal onClose={closeAddPersonModal} />}
      {editPerson && (
        <EditPersonModal
          person={editPerson}
          onClose={handleCloseEditModal}
          onSave={() => {
            handleCloseEditModal();
            // Optionally, refetch or update local data
          }}
        />
      )}
      {deletePerson && (
        <ConfirmDeleteModal
          person={deletePerson}
          onClose={handleCloseDeleteModal}
          onConfirm={() => {
            handleCloseDeleteModal();
            // Optionally, refetch or update local data
          }}
        />
      )}
      {showDeleteModal && deleteTarget && (
        <DeletePersonModal
          person={deleteTarget}
          relationships={groupRelatives(deleteTarget)}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

export default Tree;
