# Puma web server configuration for Chronicle Tree API

# Thread configuration - balance throughput and latency
threads_count = ENV.fetch("RAILS_MAX_THREADS", 3)
threads threads_count, threads_count

port ENV.fetch("PORT", 3000)

# Enable restart capability
plugin :tmp_restart

# Solid Queue integration for background jobs
plugin :solid_queue if ENV["SOLID_QUEUE_IN_PUMA"]

pidfile ENV["PIDFILE"] if ENV["PIDFILE"]
