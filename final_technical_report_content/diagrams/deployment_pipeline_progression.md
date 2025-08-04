// ChronicleTree Deployment Pipeline - Environment Progression
// Shows the progression from Development → Staging → Production
// Highlights hybrid implementation (Sidekiq+Redis dev vs Solid Queue prod)

direction: right

group_development [label: "Development Environment", color: green, icon: monitor] {
    node_dev_react [label: "React 19 Dev Server\nVite HMR (port 5178)", icon: react]
    node_dev_rails [label: "Rails API Server\nRuby 3.3.7 (port 4000)", icon: ruby]
    node_dev_postgresql [label: "Local PostgreSQL\nDevelopment Data", icon: database]
    node_dev_sidekiq [label: "Sidekiq Workers\nReal-time Monitoring", icon: clock]
    node_dev_redis [label: "Redis Queue\nJob Storage", icon: memory]
    node_dev_memory_cache [label: "Memory Store Cache\nDevelopment Caching", icon: memory]
    node_dev_file_storage [label: "Local File Storage\nActive Storage", icon: hard-drive]
}

group_staging [label: "Staging Environment", color: orange, icon: server] {
    node_staging_static [label: "Static React Build\nVite Production Build", icon: file]
    node_staging_rails [label: "Containerized Rails API\nKamal Deploy", icon: package]
    node_staging_postgresql [label: "Cloud PostgreSQL\nStaging Data", icon: database]
    node_staging_solid_queue [label: "Solid Queue Workers\nDatabase-backed Jobs", icon: layers]
    node_staging_solid_cache [label: "Solid Cache\nDatabase Caching", icon: database]
    node_staging_cloud_storage [label: "Cloud Storage\nS3/GCS Compatible", icon: cloud]
    node_staging_ssl [label: "SSL Certificates\nLet's Encrypt", icon: lock]
}

group_production [label: "Production Environment", color: blue, icon: cloud] {
    node_prod_load_balancer [label: "Load Balancer\nKamal Proxy", icon: shuffle]
    node_prod_cdn [label: "CDN Distribution\nStatic Assets", icon: globe]
    node_prod_api_instances [label: "Multiple API Instances\nHorizontal Scaling", icon: layers]
    node_prod_postgresql [label: "PostgreSQL Cluster\nHigh Availability", icon: database]
    node_prod_solid_queue [label: "Solid Queue Pool\nBackground Processing", icon: clock]
    node_prod_solid_cache [label: "Solid Cache Cluster\nPerformance Layer", icon: memory]
    node_prod_monitoring [label: "Monitoring & Logging\nHealth Checks", icon: activity]
    node_prod_backup [label: "Backup Strategy\nData Protection", icon: shield]
}

node_arrow_dev_staging [shape: diamond, label: "Deploy →", color: purple, icon: arrow-right]
node_arrow_staging_prod [shape: diamond, label: "Promote →", color: purple, icon: arrow-right]

// Environment progression connections
group_development > node_arrow_dev_staging
node_arrow_dev_staging > group_staging
group_staging > node_arrow_staging_prod
node_arrow_staging_prod > group_production

// Internal development connections
node_dev_react > node_dev_rails: "API Calls"
node_dev_rails > node_dev_postgresql: "Database"
node_dev_rails > node_dev_sidekiq: "Queue Jobs"
node_dev_sidekiq > node_dev_redis: "Job Storage"
node_dev_rails > node_dev_memory_cache: "Cache Access"
node_dev_rails > node_dev_file_storage: "File Operations"

// Internal staging connections
node_staging_static > node_staging_rails: "API Requests"
node_staging_rails > node_staging_postgresql: "Database"
node_staging_rails > node_staging_solid_queue: "Background Jobs"
node_staging_rails > node_staging_solid_cache: "Cache Layer"
node_staging_rails > node_staging_cloud_storage: "File Storage"
node_staging_ssl > node_staging_rails: "Secure Connection"

// Internal production connections
node_prod_load_balancer > node_prod_api_instances: "Request Distribution"
node_prod_cdn > node_prod_api_instances: "Asset Delivery"
node_prod_api_instances > node_prod_postgresql: "Database Cluster"
node_prod_api_instances > node_prod_solid_queue: "Job Processing"
node_prod_api_instances > node_prod_solid_cache: "Cache Access"
node_prod_monitoring > node_prod_api_instances: "Health Monitoring"
node_prod_postgresql > node_prod_backup: "Data Backup"
